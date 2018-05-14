import { CandidateKeys, IndexableObject, ClusteringKeys, AnError, PartitionKeyQuery, Converter } from '../core/domain';
import { Entity, TypedEntityMeta, getEntityMetaForType } from '../decorators/entity.decorator';
import { Client } from 'cassandra-driver';
import { makeError, isError } from 'ts-errorflow';
import { ColumnMetadata, getColumnMetaForEntity, ColumnType } from '../decorators/column.decorator';
import { IRepository } from './repository.interface';
import { serialize } from '../serializers/cassandra-serializer';

export interface MissingPartitionKeys extends AnError {
    keys: string[];
}

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
    async getFromPartition(query: PartitionKeyQuery<T>): Promise<Partial<T>[] | MissingPartitionKeys> {
        const keyMap = this.validatePartitionKeys(query);
        if (isError<KeyValue[], MissingPartitionKeys>(keyMap)) {
            return keyMap;
        }

        const whereClause = keyMap.map((x, i) => {
            const colMeta = this.columnMeta.find(y => y.originalPropertyKey === x.key);
            if(!colMeta) {
                throw new Error('colmeta does not exist');
            }

            return i > 0 
                ? ` AND ${colMeta.propertyKey} = ?`
                : `${colMeta.propertyKey} = ?`
        }).join('');

        const queryText = normalizeQueryText(`
            SELECT * FROM ${this.metadata.keyspace}.${this.metadata.table}
            WHERE ${whereClause};
        `);

        const results = await this.client.execute(queryText.trim(), keyMap.map(x => x.value));
        
        // Reference column metadata for this type so we can build up the proper
        // deserialized response 
        const columnMeta = getColumnMetaForEntity(this.entityCtor);
    
        const deserialized = results.rows.map(row => {
            // Cassandra normalizes column names to be all lower case
            let result: Partial<T> = {};
            columnMeta.forEach(meta => {
                // TODO: Need to run these through proper deserializers based on their underlying type
                // Ie. timeuuid will need to be converted back to a Date etc
                result[meta.originalPropertyKey] = row[meta.propertyKey.toLowerCase()]
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
            let columnMeta = this.columnMeta.find(x => x.originalPropertyKey === prop);
            if (!columnMeta) {
                throw new Error(`Missing column meta for key: ${prop}`);
            }

            serializedEntity[columnMeta.propertyKey] = serialize(columnMeta.colType, entity[prop], columnMeta.dataType);
        }

        await this.client.execute(query, [JSON.stringify(serializedEntity)]);
        return entity;
    }

    deleteOne(query: PartitionKeyQuery<T>): Promise<void | AnError> {
        throw new Error("Method not implemented.");
    }
    
    deleteMany(query: PartitionKeyQuery<T>): Promise<void | AnError> {
        throw new Error("Method not implemented.");
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
            return makeError({
                keys: missing,
                message: 'test'
            });
        }

        // The above code validates that there can never be undefined in the
        // keymap here but I guess TS isn't quite that magical (yet). 
        // Therefore, we cast (safely)
        return keyMap as KeyValue[];
    }

    private validateClusteringKeys(candidate: Partial<T>) {
        const keyMap = this.clusteringKeys.map((key) => {
            return {
                key,    
                value: candidate[key] ? candidate[key].toString() : undefined
            }
        });

        const missing = keyMap.filter(x => x.value === undefined)
                              .map(x => x.key);

        if (missing.length) {
            return makeError({
                keys: missing
            });
        }
    }
}