import { TypedCtor, CandidateKeys, IndexableObject, ClusteringKeys, AnError, PartitionKeyQuery } from '../core/domain';
import { Entity, EntityMetadata, getEntityMeta } from '../decorators/entity.decorator';
import { Client } from 'cassandra-driver';
import { makeError, isError } from 'ts-errorflow';
import { extractMeta } from '../core/reflection';
import { ColumnMetadata, getColumnMetaForEntity } from '../decorators/column.decorator';
import { IRepository } from './repository.interface';

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
    private readonly entityCtor: TypedCtor<T>;
    private readonly metadata: EntityMetadata<T>;
    private readonly client: Client;
    private readonly partitionKeys: CandidateKeys<T>[];
    private readonly clusteringKeys: ClusteringKeys<T>[];

    constructor(client: Client, entityCtor: TypedCtor<T>) {
        this.client = client;
        this.entityCtor = entityCtor;
        const metadata = getEntityMeta<T>(entityCtor);
        if (metadata === undefined) {
            throw new Error('Metadata not available for this type');
        }

        this.metadata = metadata;
        this.partitionKeys = this.metadata.partitionKeys;
        this.clusteringKeys = this.metadata.clusteringKeys || [];
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
            return i > 0 
                ? ` AND ${x.key} = ?`
                : `${x.key} = ?`
        }).join(''); /* ? */

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
                result[meta.propertyKey] = row[meta.propertyKey.toLowerCase()]
            });

            return result;
        });

        return deserialized;
    }

    async insert(entity: T): Promise<T | AnError> {
        const query = `INSERT INTO ${this.metadata.keyspace}.${this.metadata.table} JSON ?`;
        await this.client.execute(query, [JSON.stringify(entity)]);
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