import { CandidateKeys } from "../core/domain";
import { getEntityMetaForType, TypedMaterializedViewConfig, getDiscoveredEntities } from "../decorators/entity.decorator";
import { ColumnMetadata, columnMetaSymbol, getColumnMetaForEntity } from "../decorators/column.decorator";
import { commaSeparatedSpacedString, injectAllButLastString } from "../core/utils";
import { GameScore } from "../models/test.entities";
import { writeFile } from 'async-file';
import * as path from 'path';

function generatePrimaryKey(partitionKeys: string[], clusteringKeys: string[]) {
    const clusteringKeysText = clusteringKeys.length
        ? `, ${commaSeparatedSpacedString(clusteringKeys)}`
        : '';

    return `PRIMARY KEY ((${partitionKeys.join(', ')})${clusteringKeysText})`
}

function generateMaterializedViewSchema<T>(
    keyspace: string, 
    table: string, 
    tablePrimaryKeys: CandidateKeys<T>[], 
    mvConfig: TypedMaterializedViewConfig<T>) 
{
    const clusteringKeys = mvConfig.clusteringKeys || [];
    const primaryKeys = mvConfig.partitionKeys.concat(clusteringKeys);
    const primaryKeysWhere = primaryKeys.map(x => `${x} IS NOT NULL`)
    
    const selectColumns = mvConfig.columns || [ tablePrimaryKeys[0] ];
    const selectColumnsText = commaSeparatedSpacedString(selectColumns);
    
    const mvSchema = `
        CREATE MATERIALIZED VIEW ${keyspace}.${mvConfig.name} AS
            SELECT ${selectColumnsText} FROM ${table}
            WHERE ${injectAllButLastString(primaryKeysWhere, ' AND ')}
            ${generatePrimaryKey(mvConfig.partitionKeys, clusteringKeys)};
    `;
    
    return mvSchema;
}

async function writeToFile<T>(destinationDir: string, ctor: Function) { 
    const entityMeta = getEntityMetaForType<T>(ctor);
    if (entityMeta === undefined) {
        throw Error('No metadata available for this type');
    }

    const schema = generateSchemaForType<T>(ctor);

    await writeFile(
        `${destinationDir}/${entityMeta.keyspace}.${entityMeta.table}.cql`, 
        schema
    );
}


export function generateSchemaForType<T>(ctor: Function) {
    const entityMeta = getEntityMetaForType<T>(ctor);
    const columnMeta = getColumnMetaForEntity(ctor);

    if (entityMeta !== undefined && columnMeta !== undefined) {
        const columnPropsText = columnMeta.map((x, i) => {
            const text = `${x.propertyKey} ${x.colType},`
            return text;
        });

        const tableSchema = 
        `CREATE TABLE IF NOT EXISTS ${entityMeta.keyspace}.${entityMeta.table} (
            ${columnPropsText.join(' ')}
            ${generatePrimaryKey(entityMeta.partitionKeys, entityMeta.clusteringKeys || [])}
        );`;

        let mvSchema = '';

        if (entityMeta.materializedViews && entityMeta.materializedViews.length) {
            mvSchema = `${
                entityMeta.materializedViews.map(config => {
                    return `${
                        generateMaterializedViewSchema(
                            entityMeta.keyspace, 
                            entityMeta.table,
                            entityMeta.partitionKeys.concat(entityMeta.clusteringKeys || []),
                            config
                        )}`
                }).join(' ')
            }`;
        }

        return `${tableSchema}
            ${mvSchema}`;
    }   
}

export async function generateSchemas(destinationDir: string) {
    const entities = getDiscoveredEntities();
    await Promise.all(entities.map(x => writeToFile(destinationDir, x)));
}