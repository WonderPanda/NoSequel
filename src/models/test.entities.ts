import { Entity } from "../entity.decorator";
import { Column } from "../column.decorator";

@Entity<ComplexEntity>({
  keyspace: 'test',
  table: 'complex_things',
  partitionKeys: ['accountId', 'solutionId', 'id'],
  clusteringKeys: ['timestamp']
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
  
  @Column({ colType: 'timeuuid' })
  public timestamp!: Date;
}