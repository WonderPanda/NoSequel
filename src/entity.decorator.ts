import 'reflect-metadata';
import { Ctor, TypedCtor, KeySelectorFn, NonFunctionProperties, Column, ColumnProperties } from './domain';

const EntityMetaSymbol = Symbol('EntityMeta');

export interface EntityMetadata<T> {
    keyspace: string;
    table: string;
    partitionKeys: KeySelectorFn<T>;
    clusteringKeys: KeySelectorFn<T>;
}

export function Entity<T>(meta: EntityMetadata<T>) {
    return (ctor: TypedCtor<T>) => {
        const entityMetaMap = getAllEntityMeta<T>() || new Map<Ctor, EntityMetadata<T>>();
        entityMetaMap.set(ctor, meta);

        Reflect.defineMetadata(EntityMetaSymbol, entityMetaMap, Reflect);   
        Reflect.defineMetadata(EntityMetaSymbol, meta, ctor);
    }
}

export function getAllEntityMeta<T>(): Map<TypedCtor<T>, EntityMetadata<T>> {
    return Reflect.getMetadata(EntityMetaSymbol, Reflect) || new Map<TypedCtor<T>, EntityMetadata<T>>();
}

export function getEntityMeta<T>(entityCtor: TypedCtor<T>): EntityMetadata<T> | undefined {
    const allMeta = getAllEntityMeta<T>();
    return allMeta.get(entityCtor);
}

// @Entity<Sensor>({ 
//     keyspace: 'iot', 
//     table: 'sensors',
//     partitionKeys: () => { return ['id'] },
//     clusteringKeys: () => { return ['timestamp'] }
// })
// export class Sensor {
//     public id!: Column<string>;
//     public display!: Column<string>;
//     public timestamp!: Date;   

//     doSomething() {
//         return 42;
//     }
// }