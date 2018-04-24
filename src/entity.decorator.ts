import 'reflect-metadata';
import { Ctor, TypedCtor, KeySelectorFn } from './domain';

const EntityMetaSymbol = Symbol('EntityMeta');

export interface EntityMetadata<T> {
    keyspace: string;
    table: string;
    partitionKeys: KeySelectorFn<T>;
    clusteringKeys: KeySelectorFn<T>;
}

export function Entity<T>(meta: EntityMetadata<T>) {
    return (ctor: TypedCtor<T>) => {
        const entityMeta = getAllEntityMeta<T>() || new Map<Ctor, EntityMetadata<T>>();
        entityMeta.set(ctor, meta);

        Reflect.defineMetadata(EntityMetaSymbol, entityMeta, Reflect);   
    }
}

export function getAllEntityMeta<T>(): Map<TypedCtor<T>, EntityMetadata<T>> {
    return Reflect.getMetadata(EntityMetaSymbol, Reflect)
}

export function getEntityMeta<T>(entityCtor: TypedCtor<T>): EntityMetadata<T> | undefined {
    const allMeta = getAllEntityMeta();
    return allMeta.get(entityCtor);
}

@Entity<Sensor>({ 
    keyspace: 'iot', 
    table: '',
    partitionKeys: () => { return ['id'] },
    clusteringKeys: () => { return ['timestamp'] }
})
class Sensor {
    public id!: string;
    public display!: string;
    public timestamp!: Date;   
}