import { Entity, EntityMetaSymbol, EntityMetadata, getEntityMeta, getEntityMetaForType } from "../decorators/entity.decorator";
import { Column, columnMetaSymbol, ColumnMetadata } from "../decorators/column.decorator";
import { extractMeta, getGlobalMeta, } from '../core/reflection';

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
