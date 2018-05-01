import { Entity } from "../decorators/entity.decorator";
import { Column } from "../decorators/column.decorator";
import { types } from 'cassandra-driver';

@Entity<ComplexEntity>({
  keyspace: 'test',
  table: 'complex_things',
  partitionKeys: ['accountId', 'solutionId', 'id'],
  clusteringKeys: []
})
export class ComplexEntity {
  @Column({ colType: 'text' })
  public accountId!: string;

  @Column({ colType: 'text' })
  public solutionId!: string
  
  @Column({ colType: 'text' })
  public id!: string;
  
  @Column({ colType: 'text' })
  public message!: string;
  
  // @Column({ colType: 'timeuuid' })
  // public timestamp!: Date;
}