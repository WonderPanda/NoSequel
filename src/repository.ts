import { TypedCtor, Either, makeFailure } from './domain';
import { Entity, EntityMetadata, getEntityMeta } from './entity.decorator';
import { Client } from 'cassandra-driver';

export interface MissingPartitionKeys {
    keys: string[];
}

export function normalizeQueryText(queryText: string): string {
    return queryText.replace(/\s\s+/g, ' ').trim();
}

export class Repository<T> {
    readonly entityCtor: TypedCtor<T>;
    readonly metadata: EntityMetadata<T>;
    readonly client: Client;
    readonly partitionKeys: (keyof T)[];
    readonly clusteringKeys: (keyof T)[];

    constructor(client: Client, entityCtor: TypedCtor<T>) {
        this.client = client;
        this.entityCtor = entityCtor;
        const metadata = getEntityMeta<T>(entityCtor);
        if (metadata === undefined) {
            throw new Error('Metadata not available for this type');
        }

        this.metadata = metadata;
        this.partitionKeys = this.metadata.partitionKeys();
        this.clusteringKeys = this.metadata.clusteringKeys();
    }

    async get(keys: Partial<T>): Promise<T[] | MissingPartitionKeys> {
        // Ensure that the all partition key values have been supplied
        // We can also build up the list of query params assuming keys are
        // valid

        const pkMap = this.partitionKeys.map((pk) => {
            return {
                key: pk,
                value: keys[pk] || undefined
            }
        });

        const missing = pkMap.filter(x => x.value === undefined)
                              .map(x => x.key);

        if (missing.length) {
            return makeFailure({
                keys: missing
            });
        }

        const whereClause = pkMap.map((x, i) => {
            return i > 0 
                ? ` AND ${x.key} = ?`
                : `${x.key} = ?`
        }).join(''); /* ? */

        const query = normalizeQueryText(`
            SELECT * FROM ${this.metadata.keyspace}.${this.metadata.table}
            WHERE ${whereClause};
        `);

        const results = await this.client.execute(query.trim(), pkMap.map(x => x.value));
        return results.rows.map(x => ({} as T));
    }

    async getByKeys(keys: Partial<T>): Promise<string> {
        const partitionKeys = this.metadata.partitionKeys();

        if (Object.keys(keys).length !== partitionKeys.length) {
            throw new Error('these should match I think');
        }

        const query = `
            SELECT * FROM ${this.metadata.keyspace}.${this.metadata.table}
            WHERE ${partitionKeys[0]} = ?
        `; /* ? */

        //const result = await this.client.execute(query, args);
        //console.log(result.rows);
        return query;
    }
}

@Entity<Sensor>({
    keyspace: 'iot',
    table: 'sensors',
    partitionKeys: () => { return ['id'] },
    clusteringKeys: () => { return ['timestamp'] }
})
export class Sensor {
    public id!: string;
    public display!: string;
    public timestamp!: Date;
}