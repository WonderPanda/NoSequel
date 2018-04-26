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
export interface ColumnMetadata {
    colType: ColumnType;
    strategy?: string;
}

export function Column(): PropertyDecorator {
    return () => {
        
    }
}
