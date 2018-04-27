import { Ctor, Column } from "./domain";
import { extend } from './utils';
import { extractMeta, setMeta } from './reflection';

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

export interface ColumnMetadata extends ColumnConfig {
    propertyKey: string | symbol;
}

export function Column(meta: ColumnConfig): PropertyDecorator {
    return (target, propertyKey) => {
        const columnMeta = extractMeta<ColumnMetadata[]>(columnMetaSymbol, target.constructor) 
            || [];

        setMeta(columnMetaSymbol, columnMeta.concat(
            extend(meta, { propertyKey })), target.constructor);
    }
}

