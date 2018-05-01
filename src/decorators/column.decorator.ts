import { Ctor } from "../core/domain";
import { extend } from '../core/utils';
import { extractMeta, setMeta } from '../core/reflection';

export const columnMetaSymbol = Symbol('ColumnMetaSymbol');

// https://docs.datastax.com/en/cql/3.3/cql/cql_reference/cql_data_types_c.html
export type ColumnType = 
    'ascii' |
    'bigint' |
    'blob' |
    'Boolean' |
    'counter' |
    'decimal' |
    'double' |
    'float' |
    'inet' |
    'int' |
    'text' |
    'timestamp' |
    'timeuuid' |
    'uuid' |
    'varchar' |
    'varint' |
    'list' |
    'map' |
    'set'

/**
 * The relevant metadata information that will be supplied by the decorator
 */
export interface ColumnConfig {
    colType: ColumnType;
    strategy?: string;
}

/**
 * The stored metadata information from this decorator. Merges supplied metadata with
 * propertyKey of the class for which the decorator was applied
 */
export interface ColumnMetadata extends ColumnConfig {
    propertyKey: string;
}

export function Column(meta: ColumnConfig): PropertyDecorator {
    return (target, propertyKey) => {
        propertyKey = propertyKey.toString();
        const columnMeta = extractMeta<ColumnMetadata[]>(columnMetaSymbol, target.constructor) 
            || [];

        setMeta(columnMetaSymbol, columnMeta.concat(
            extend(meta, { propertyKey })), target.constructor);
    }
}

export function getColumnMetaForEntity(ctor: Ctor) {
    return extractMeta<ColumnMetadata[]>(columnMetaSymbol, ctor) || []; 
}

