import { TypedCtor } from './domain';
import { Entity, EntityMetadata, getEntityMeta } from './entity.decorator';
import { Client } from 'cassandra-driver';

export class Repository<T> {
    readonly entityCtor: TypedCtor<T>;
    readonly metadata: EntityMetadata<T>;
    readonly client: Client;

    constructor(client: Client, entityCtor: TypedCtor<T>) {
        this.client = client;
        this.entityCtor = entityCtor;
        const metadata = getEntityMeta<T>(entityCtor);
        if (metadata === undefined) {
            throw new Error('Metadata not available for this type');
        }

        this.metadata = metadata;
    }

    async getByKeys2(keys: Partial<T>): Promise<T[] | undefined> {
        return undefined;
    }

    async getByKeys(keys: Partial<T>): Promise<string> {
        console.log(keys);
        
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