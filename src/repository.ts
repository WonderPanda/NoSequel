import { TypedCtor } from './domain';
import { Entity, EntityMetadata, getEntityMeta, Sensor } from './entity.decorator';

export class Repository<T> {
    readonly entityCtor: TypedCtor<T>;
    readonly metadata: EntityMetadata<T>;

    constructor(entityCtor: TypedCtor<T>) {
        this.entityCtor = entityCtor;
        const metadata = getEntityMeta<T>(entityCtor);
        if (metadata === undefined) {
            throw new Error('Metadata not available for this type');
        }

        this.metadata = metadata;
    }

    getByPrimaryId(...args: string[]): string {
        const partitionKeys = this.metadata.partitionKeys();

        if (args.length !== partitionKeys.length) {
            throw new Error('these should match I think');
        }

        const query = `
            SELECT * FROM ${this.metadata.keyspace}.${this.metadata.table}
            WHERE ${partitionKeys[0]} = '?'
        `; /* ? */
        
        return query;
    }
}

const repo = new Repository<Sensor>(Sensor);
repo.getByPrimaryId('1234');

