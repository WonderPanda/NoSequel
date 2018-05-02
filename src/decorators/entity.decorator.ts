import 'reflect-metadata';
import { Ctor, TypedCtor, CandidateKeys, ClusteringKeys } from '../core/domain';
import { getGlobalMeta, extractMeta } from '../core/reflection';
import { ColumnMetadata, columnMetaSymbol } from './column.decorator';

export const EntityMetaSymbol = Symbol('EntityMeta');

export interface EntityMetadata<T> {
    keyspace: string;
    table: string;
    partitionKeys: CandidateKeys<T>[];
    clusteringKeys?: ClusteringKeys<T>[];
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

export function getAllEntityMeta<T>(): Map<TypedCtor<T>, EntityMetadata<T>> {
    return Reflect.getMetadata(EntityMetaSymbol, Reflect) || new Map<TypedCtor<T>, EntityMetadata<T>>();
}

export function getEntityMeta<T>(entityCtor: TypedCtor<T>): EntityMetadata<T> | undefined {
    const allMeta = getAllEntityMeta<T>();
    return allMeta.get(entityCtor);
}

export function generateEntityTableSchema<T>(ctor: TypedCtor<T>): string | undefined {
    const entityMeta = getEntityMetaForType<T>(ctor);
    const columnMeta = extractMeta<ColumnMetadata[]>(columnMetaSymbol, ctor);

    if (entityMeta !== undefined && columnMeta !== undefined) {
        const columnPropsText = columnMeta.map((x, i) => {
            const text = `${x.propertyKey} ${x.colType},`
            return text;
        });

        const partitionKeysText = entityMeta.partitionKeys.map((x, i) => {
            return i === entityMeta.partitionKeys.length - 1
                ? x
                : `${x},`;
        })

        // It's possible that these won't be assigned based if no clustering keys were
        // provided
        let clusteringKeysText = '';

        if (entityMeta.clusteringKeys !== undefined) {
            const clusteringKeys = entityMeta.clusteringKeys as string[];
            clusteringKeysText = clusteringKeys.map((x, i) => {
                return i === clusteringKeys.length - 1
                    ? x
                    : `${x},`;
            }).join(' ');

            clusteringKeysText = clusteringKeysText ? `, ${clusteringKeysText}` : '';
        }

        const tableSchema = `
            CREATE TABLE IF NOT EXISTS ${entityMeta.keyspace}.${entityMeta.table} (
                ${columnPropsText.join(' ')}
                PRIMARY KEY ((${partitionKeysText.join(' ')})${clusteringKeysText})
            )
        `;

        return tableSchema;
    }
}
