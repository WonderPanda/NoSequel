import 'reflect-metadata';
import { CandidateKeys, ClusteringKeys, PartitionKeys } from '../core/domain';
import { getGlobalMeta, extractMeta } from '../core/reflection';
import { ColumnMetadata, columnMetaSymbol } from './column.decorator';

export interface EntityMeta {
    keyspace: string;
    table: string;
    partitionKeys: string[];
    clusteringKeys?: string[];
    materializedViews?: MaterializedViewConfig[];
}

export interface TypedEntityMeta<T> extends EntityMeta {
    partitionKeys: CandidateKeys<T>[];
    clusteringKeys?: CandidateKeys<T>[];
    materializedViews?: TypedMaterializedViewConfig<T>[];
}

export interface MaterializedViewConfig {
    name: string;
    partitionKeys: string[];
    clusteringKeys?: string[];
    columns?: string[];
}

export interface TypedMaterializedViewConfig<T> extends MaterializedViewConfig {
    partitionKeys: CandidateKeys<T>[];
    clusteringKeys?: CandidateKeys<T>[];
    columns?: (keyof T)[];
}

const DiscoveredEntityMeta = new Map<Function, EntityMeta>();

export function getDiscoveredEntities(): Function[] {
    return Array.from(DiscoveredEntityMeta.keys());
}


export function getEntityMetaForType<T>(source: Function): TypedEntityMeta<T> | undefined {
    return DiscoveredEntityMeta.get(source) as TypedEntityMeta<T>;
}

export function Entity<T>(meta: TypedEntityMeta<T>): ClassDecorator {
    return (ctor) => {
        DiscoveredEntityMeta.set(ctor, meta);
    }
}