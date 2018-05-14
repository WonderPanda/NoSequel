import { extend, snakeCase } from '../core/utils';
import { extractMeta, setMeta } from '../core/reflection';
import { DataType, Converter } from '../core/domain';

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
export interface ColumnMeta {
    colType: ColumnType;
    dataType?: DataType;
}

/**
 * The stored metadata information from this decorator. Merges supplied metadata with
 * propertyKey of the class for which the decorator was applied
 */
export interface ColumnMetadata extends ColumnMeta {
    propertyKey: string;
    originalPropertyKey: string;
    colNameConverter?: Converter<string>;
}

export function Column(meta: ColumnMeta, colNameConverter?: Converter<string>): PropertyDecorator {
    return (target, propertyKey) => {
        const newPropertyKey = colNameConverter ? colNameConverter(propertyKey.toString()) : propertyKey.toString();
        const columnMeta = getColumnMetaForEntity(target.constructor) 
            || [];

        setMeta(columnMetaSymbol, columnMeta.concat(
            extend(meta, { 
                propertyKey: newPropertyKey, 
                colNameConverter, 
                originalPropertyKey: propertyKey.toString() 
            })), target.constructor);
    }
}

export function makeColumnDecorator(colNameConverter: Converter<string>): (meta: ColumnMeta) => PropertyDecorator {
    return (meta: ColumnMeta) => {
        return Column(meta, colNameConverter);
    }
}

export const SnakeCaseColumn = makeColumnDecorator(snakeCase);

export function getColumnMetaForEntity(ctor: Function) {
    return extractMeta<ColumnMetadata[]>(columnMetaSymbol, ctor) || [];
}
