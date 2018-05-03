import 'reflect-metadata';
import { Ctor, TypedCtor, CandidateKeys, ClusteringKeys, PartitionKeys } from '../core/domain';
import { getGlobalMeta, extractMeta } from '../core/reflection';
import { ColumnMetadata, columnMetaSymbol } from './column.decorator';

export const EntityMetaSymbol = Symbol('EntityMeta');

export interface EntityMetadata<T> {
    keyspace: string;
    table: string;
    partitionKeys: CandidateKeys<T>[];
    clusteringKeys?: CandidateKeys<T>[];
    materializedViews?: MaterializedViewConfig<T>[];
}

export interface MaterializedEntityMetadata<T, U extends string> extends EntityMetadata<T> {
    materializedViews?: MaterializedConfig<T, U>[];
}

export interface MaterializedViewConfig<T> {
    name: string;
    partitionKeys: CandidateKeys<T>[];
    clusteringKeys?: CandidateKeys<T>[];
    columns?: (keyof T)[];
}

export interface MaterializedConfig<T, U> {
    name: U;
    partitionKeys: CandidateKeys<T>[];
    clusteringKeys?: CandidateKeys<T>[];
    columns?: (keyof T)[];
}

export function getEntityMetaForType<T>(source: TypedCtor<T>): EntityMetadata<T> | undefined {
    const globalEntityMap = getGlobalMeta<Map<TypedCtor<T>, EntityMetadata<T>>>(EntityMetaSymbol);
    if (globalEntityMap === undefined) return;

    return globalEntityMap.get(source);
}

export function Entity<T>(meta: EntityMetadata<T>) {
    return (ctor: TypedCtor<T>) => {
        const entityMetaMap = getAllEntityMeta<T>() || new Map<Ctor, EntityMetadata<T>>();
        entityMetaMap.set(ctor, meta);

        Reflect.defineMetadata(EntityMetaSymbol, entityMetaMap, Reflect);
        Reflect.defineMetadata(EntityMetaSymbol, meta, ctor);
    }
}

export function MaterializedEntity<T, U extends string>(materializedMeta: MaterializedEntityMetadata<T, U>) {
    return (ctor: TypedCtor<T>) => {

    }
}

export function getAllEntityMeta<T>(): Map<TypedCtor<T>, EntityMetadata<T>> {
    return Reflect.getMetadata(EntityMetaSymbol, Reflect) || new Map<TypedCtor<T>, EntityMetadata<T>>();
}

export function getEntityMeta<T>(entityCtor: TypedCtor<T>): EntityMetadata<T> | undefined {
    const allMeta = getAllEntityMeta<T>();
    return allMeta.get(entityCtor);
}