import { CandidateKeys, IndexableObject, ClusteringKeys, AnError, PartitionKeyQuery, ClusteringKeyQuery, Converter, ATypedError } from '../core/domain';
import { extractDataType, keyOrder } from '../core/utils';
import { Entity, TypedEntityMeta, getEntityMetaForType } from '../decorators/entity.decorator';
import { Client } from 'cassandra-driver';
import { makeError, isError } from 'ts-errorflow';
import { ColumnMetadata, getColumnMetaForEntity, ColumnType } from '../decorators/column.decorator';
import { IRepository } from './repository.interface';
import { serialize } from '../serializers/cassandra-serializer';

export interface MissingPartitionKeys extends ATypedError<string[]> { }
export interface MissingClusteringKeys extends ATypedError<string[]> { }

interface KeyValue {
    key: string;
    value: string;
}

export function normalizeQueryText(queryText: string): string {
    return queryText.replace(/\s\s+/g, ' ').trim();
}

export class Repository<T extends IndexableObject> implements IRepository<T> {
    private readonly entityCtor: Function;
    private readonly metadata: TypedEntityMeta<T>;
    private readonly client: Client;
    private readonly partitionKeys: CandidateKeys<T>[];
    private readonly clusteringKeys: ClusteringKeys<T>[];
    private readonly columnMeta: ColumnMetadata[];
    private readonly insertMiddleware: Converter<object>[];
    private readonly queryMiddleware: Converter<object>[];

    constructor(
        client: Client,
        entityCtor: Function,
        insertMiddleware?: Converter<object>[],
        queryMiddleware?: Converter<object>[]
    ) {
        this.client = client;
        this.entityCtor = entityCtor;
        const metadata = getEntityMetaForType<T>(entityCtor);
        if (metadata === undefined) {
            throw new Error('Metadata not available for this type');
        }

        this.columnMeta = getColumnMetaForEntity(entityCtor);

        this.metadata = metadata;
        this.partitionKeys = this.metadata.partitionKeys;
        this.clusteringKeys = this.metadata.clusteringKeys || [];

        this.insertMiddleware = insertMiddleware || [];
        this.queryMiddleware = queryMiddleware || [];
    }

    /**
     * Gets an entity by partition key or all entities from a partition key
     * depending on whether or not clustering keys are available on the table
     * 
     * Clustering keys can be provided and will be executed if they match clustering
     * keys defined on the entity decorator. Values must be provided that match left to right
     * specificity in order for the query to be valid. 
     * 
     * @param keys An object map whose keys and values should correspond to partition keys
     * and their values respectively. Keys for all the selected partition key properties from
     * the entity decorator must be supplied, otherwise a failure will be returned.
     */
    async getFromPartition(query: PartitionKeyQuery<T>): Promise<Partial<T>[] | AnError> {
        const keyMap = this.validatePartitionKeys(query);
        if (isError<KeyValue[], MissingPartitionKeys>(keyMap)) {
            return keyMap;
        }

        const whereClause = keyMap.map((x, i) => {
            return i > 0
                ? ` AND ${x.key} = ?`
                : `${x.key} = ?`
        }).join(''); /* ? */

        const queryText = normalizeQueryText(`
            SELECT * FROM ${this.metadata.keyspace}.${this.metadata.table}
            WHERE ${whereClause};
        `);

        const results = await this.client.execute(queryText.trim(), keyMap.map(x => x.value), { prepare: true });

        // Reference column metadata for this type so we can build up the proper
        // deserialized response 
        const deserialized = results.rows.map(row => {
            // Cassandra normalizes column names to be all lower case
            let result: Partial<T> = {};
            this.columnMeta.forEach(meta => {
                // TODO: Need to run these through proper deserializers based on their underlying type
                // Ie. timeuuid will need to be converted back to a Date etc
                result[meta.objectKey] = row[meta.propertyKey.toLowerCase()]
            });

            return result;
        });

        return deserialized;
    }

    async insert(entity: T): Promise<T | AnError> {
        const query = `INSERT INTO ${this.metadata.keyspace}.${this.metadata.table} JSON ?`;

        const serializedEntity: Partial<T> = {};

        for (let prop in entity) {
            // get the colType for this property
            let columnMeta = this.columnMeta.find(x => x.objectKey === prop);
            if (!columnMeta) {
                throw new Error(`Missing column meta for key: ${prop}`);
            }

            serializedEntity[columnMeta.propertyKey] = serialize(columnMeta.colType, entity[prop], columnMeta.dataType);
        }

        await this.client.execute(query, [JSON.stringify(serializedEntity)], { prepare: true });
        return entity;
    }

    async deleteOne(query: PartitionKeyQuery<T>): Promise<void | AnError> {
        if (this.partitionKeys && this.clusteringKeys) {

            const clusteringCheck = this.validateClusteringKeys(query);
            const partitionCheck = this.validatePartitionKeys(query);

            if (isError<KeyValue[], MissingPartitionKeys>(partitionCheck)) {
                return partitionCheck;
            } else {
                if (isError<KeyValue[], MissingPartitionKeys>(clusteringCheck)) {
                    return clusteringCheck;
                } else {
                    const keyValues: KeyValue[] = partitionCheck.concat(clusteringCheck);
                    const whereClause = keyValues.map((x, i) => {
                        return i > 0
                            ? ` AND ${x.key} = ?`
                            : `${x.key} = ?`
                    }).join('');

                    const queryStatement: string =
                        `DELETE FROM ${this.metadata.keyspace}.${this.metadata.table} 
                        WHERE ${whereClause} IF EXISTS`;

                    const results = await this.client.execute(queryStatement.trim(), keyValues.map(y => y.value), { prepare: true });
                }
            }
        } else {
            throw new Error("Partition Keys not found");
        }
    }

    async deleteMany(query: PartitionKeyQuery<T>): Promise<void | AnError> {
        const clusteringOrderCheck = keyOrder(this.clusteringKeys, query);

        const clusteringKeyValues: any = this.clusteringKeys.filter((key) => {
            return query.hasOwnProperty(key);
        }).map((x) => {
            return {
                key: x,
                value: query[x]
            }
        });

        if (clusteringOrderCheck === true) {
            const partitionCheck = this.validatePartitionKeys(query);

            if (isError<KeyValue[], MissingPartitionKeys>(partitionCheck)) {
                return partitionCheck;
            } else {

                const allKeyValues: KeyValue[] = partitionCheck.concat(clusteringKeyValues);

                const whereClause = allKeyValues.map((x, i) => {
                    return i > 0
                        ? ` AND ${x.key} = ?`
                        : `${x.key} = ?`
                }).join('');

                const queryStatement: string =
                    `DELETE FROM ${this.metadata.keyspace}.${this.metadata.table} 
                        WHERE ${whereClause}`;

                const results = await this.client.execute(queryStatement.trim(), allKeyValues.map(y => y.value), { prepare: true });

            }
        } else {
            throw new Error("Clustering Keys are not in Order");
        }
    }

    private validatePartitionKeys(query: PartitionKeyQuery<T>): KeyValue[] | MissingPartitionKeys {
        const keyMap = this.partitionKeys.map((key) => {
            return {
                key,
                value: query[key] ? query[key].toString() : undefined
            }
        });

        const missing = keyMap.filter(x => x.value === undefined)
            .map(x => x.key);

        if (missing.length) {
            const errorObj: MissingPartitionKeys = {
                code: 'bad_request',
                message: 'All partition keys for the table must be specified',
                body: missing
            };

            return makeError(errorObj);
        }

        // The above code validates that there can never be undefined in the
        // keymap here but I guess TS isn't quite that magical (yet). 
        // Therefore, we cast (safely)
        return keyMap as KeyValue[];
    }

    private validateClusteringKeys(candidate: ClusteringKeyQuery<T>): KeyValue[] | MissingClusteringKeys {
        const keyMap = this.clusteringKeys.map((key) => {
            return {
                key,
                value: candidate[key] ? candidate[key].toString() : undefined
            }
        });

        const missing = keyMap.filter(x => x.value === undefined)
            .map(x => x.key);

        if (missing.length) {
            const errorObj: MissingClusteringKeys = {
                code: 'bad_request',
                message: 'All clustering keys for the table must be specified',
                body: missing
            };

            return makeError(errorObj);
        }
        return keyMap as KeyValue[];
    }
}