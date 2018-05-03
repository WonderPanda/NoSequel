import 'reflect-metadata';
import { CandidateKeys, ClusteringKeys, PartitionKeys } from '../core/domain';
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

export interface MaterializedViewConfig<T> {
    name: string;
    partitionKeys: CandidateKeys<T>[];
    clusteringKeys?: CandidateKeys<T>[];
    columns?: (keyof T)[];
}

export function getEntityMetaForType<T>(source: Function): EntityMetadata<T> | undefined {
    const globalEntityMap = getGlobalMeta<Map<Function, EntityMetadata<T>>>(EntityMetaSymbol);
    if (globalEntityMap === undefined) return;

    return globalEntityMap.get(source);
}

export function Entity<T>(meta: EntityMetadata<T>): ClassDecorator {
    return (ctor) => {
        const entityMetaMap = getAllEntityMeta<T>() || new Map<Function, EntityMetadata<T>>();
        entityMetaMap.set(ctor, meta);

        Reflect.defineMetadata(EntityMetaSymbol, entityMetaMap, Reflect);
        Reflect.defineMetadata(EntityMetaSymbol, meta, ctor);
    }
}

export function getAllEntityMeta<T>(): Map<Function, EntityMetadata<T>> {
    return Reflect.getMetadata(EntityMetaSymbol, Reflect) || new Map<Function, EntityMetadata<T>>();
}

export function getEntityMeta<T>(entityCtor: Function): EntityMetadata<T> | undefined {
    const allMeta = getAllEntityMeta<T>();
    return allMeta.get(entityCtor);
}