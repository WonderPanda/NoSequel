import { TypedCtor, Either, makeFailure, isFailure, NonFunctionProperties } from '../core/domain';
import { Entity, EntityMetadata, getEntityMeta } from '../decorators/entity.decorator';
import { Client } from 'cassandra-driver';

export interface MissingPartitionKeys {
    keys: string[];
}

interface KeyValue {
    key: string;
    value: string;
}

export function normalizeQueryText(queryText: string): string {
    return queryText.replace(/\s\s+/g, ' ').trim();
}

export class Repository<T> {
    readonly entityCtor: TypedCtor<T>;
    readonly metadata: EntityMetadata<T>;
    readonly client: Client;
    readonly partitionKeys: NonFunctionProperties<T>[];
    readonly clusteringKeys?: NonFunctionProperties<T>[];

    constructor(client: Client, entityCtor: TypedCtor<T>) {
        this.client = client;
        this.entityCtor = entityCtor;
        const metadata = getEntityMeta<T>(entityCtor);
        if (metadata === undefined) {
            throw new Error('Metadata not available for this type');
        }

        this.metadata = metadata;
        this.partitionKeys = this.metadata.partitionKeys;
        this.clusteringKeys = this.metadata.clusteringKeys;
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
    async get(keys: Partial<T>): Promise<T[] | MissingPartitionKeys> {
        const keyMap = this.tryGetPartitionKeys(this.partitionKeys, keys);
        if (isFailure<KeyValue[], MissingPartitionKeys>(keyMap)) {
            return keyMap;
        }

        const whereClause = keyMap.map((x, i) => {
            return i > 0 
                ? ` AND ${x.key} = ?`
                : `${x.key} = ?`
        }).join(''); /* ? */

        const query = normalizeQueryText(`
            SELECT * FROM ${this.metadata.keyspace}.${this.metadata.table}
            WHERE ${whereClause};
        `);

        const results = await this.client.execute(query.trim(), keyMap.map(x => x.value));
        // TODO: entity deserialization
        return results.rows.map(x => ({} as T));
    }

    async delete(keys: Partial<T>): Promise<boolean | MissingPartitionKeys> {
        const keyMap = this.tryGetPartitionKeys(this.partitionKeys, keys);
        if (isFailure<KeyValue[], MissingPartitionKeys>(keyMap)) {
            return keyMap;
        }

        return true;
    }

    private tryGetPartitionKeys(requiredKeys: (keyof T)[], candidate: Partial<T>): KeyValue[] | MissingPartitionKeys {
        const keyMap = requiredKeys.map((key) => {
            return {
                key,    
                value: candidate[key] ? candidate[key].toString() : undefined
            }
        });

        const missing = keyMap.filter(x => x.value === undefined)
                              .map(x => x.key);

        if (missing.length) {
            return makeFailure({
                keys: missing
            });
        }

        // The above code validates that there can never be undefined in the
        // keymap here but I guess TS isn't quite that magical (yet). 
        // Therefore, we cast (safely)
        return keyMap as KeyValue[];
    }
}