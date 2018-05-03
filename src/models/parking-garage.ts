import { Entity, EntityMetaSymbol, EntityMetadata, getEntityMeta, getEntityMetaForType } from "../decorators/entity.decorator";
import { Column, columnMetaSymbol, ColumnMetadata } from "../decorators/column.decorator";
import { getGlobalMeta, } from '../core/reflection';

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

// @Entity<Cyclist>({
//   keyspace: 'test',
//   table: 'cyclists',
//   partitionKeys: ['id'],
//   clusteringKeys: []
// })
// class Cyclist {
//   public id!: string;

//   public name!: string;

//   public age!: number;

//   public birthday!: Date;
  
//   public country!: string;
// }

// @MaterializedView<CyclistMv, Cyclist>({
//   name: 'cyclists',
//   partitionKeys: ['age', 'id'],
//   clusteringKeys: []
// })
// class CyclistMv {
//   public id!: string;

//   public name!: string;

//   public age!: number;

//   public birthday!: Date;
  
//   public country!: string;
// }