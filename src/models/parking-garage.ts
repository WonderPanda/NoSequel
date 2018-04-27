import { Entity, EntityMetaSymbol, EntityMetadata, getEntityMeta, getEntityMetaForType } from "../entity.decorator";
import { Column, columnMetaSymbol, ColumnMetadata } from "../column.decorator";
import { extractMeta, getGlobalMeta, } from '../reflection';

//import { } from './e' 

@Entity<ParkingLotEvent>({
  keyspace: 'parking',
  table: 'lot_events_by_franchisee',
  partitionKeys: ['franchiseeNumber', 'lotId'],
  clusteringKeys: [ 'timeStamp' ]
})
export class ParkingLotEvent {
  @Column({ colType: 'text' })
  public franchiseeNumber!: string;
  
  @Column({ colType: 'text' })
  public lotId!: string;
  
  @Column({ colType: 'timeuuid' })
  public timeStamp!: Date;
}

//const entityMeta = getGlobalMeta<EntityMetadata<ParkingLotEvent>>(EntityMetaSymbol) /* ? */
// const entityMeta = getEntityMetaForType<ParkingLotEvent>(ParkingLotEvent); /* ? */
// const columnMeta = extractMeta<ColumnMetadata[]>(columnMetaSymbol, ParkingLotEvent) /* ? */

// if (entityMeta !== undefined && columnMeta !== undefined) {
//   const columnPropsText = columnMeta.map((x, i) => {
//     const text = `${x.propertyKey} ${x.colType}`
//     return i === columnMeta.length - 1
//       ? text
//       : `${text},`;
//   }) /* ? */;

//   const partitionKeysText = entityMeta.partitionKeys.map((x, i) => {
//     return i === entityMeta.partitionKeys.length - 1
//       ? x
//       : `${x},`;
//   })

//   let clusteringKeysText = '';

//   if (entityMeta.clusteringKeys !== undefined) {
//     const clusteringKeys = entityMeta.clusteringKeys as string[];
//     clusteringKeysText = clusteringKeys.map((x, i) => {
//       return i === clusteringKeys.length - 1
//         ? x
//         : `${x},`;
//     }).join(' ');

//     clusteringKeysText = clusteringKeysText ? `, ${clusteringKeysText}` : '';
//   }

//   const create = `
//     CREATE TABLE IF NOT EXISTS ${entityMeta.keyspace}.${entityMeta.table} (
//       ${columnPropsText.join(' ')}
//       PRIMARY KEY ((${partitionKeysText.join(' ')})${clusteringKeysText})
//     )
//   `; /* ? */
// }



