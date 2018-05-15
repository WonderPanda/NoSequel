import { Entity } from "../decorators/entity.decorator";
import { Column } from "../decorators/column.decorator";
import { types } from 'cassandra-driver';

@Entity<TestEntity>({
  keyspace: 'test',
  table: 'complex_things',
  partitionKeys: ['accountId', 'solutionId', 'id'],
  clusteringKeys: ['message']
})
export class TestEntity {
  @Column({ colType: 'int' })
  public accountId: number = 0;

  @Column({ colType: 'text' })
  public solutionId: string = '';

  @Column({ colType: 'text' })
  public id: string = '';

  @Column({ colType: 'text' })
  public message: string = '';
}

@Entity<GameScore>({
  keyspace: 'games',
  table: 'user_scores',
  partitionKeys: ['user', 'gameTitle'],
  clusteringKeys: ['year', 'month', 'day'],
  materializedViews: [
    {
      name: 'allTimeHigh',
      partitionKeys: ['gameTitle'],
      clusteringKeys: ['score', 'user', 'year', 'month', 'day'],
      columns: ['description', 'comment']
    },
    {
      name: 'monthlyHigh',
      partitionKeys: ['gameTitle', 'year', 'month'],
      clusteringKeys: ['score', 'user', 'day']
    },
    {
      name: 'dailyHigh',
      partitionKeys: ['gameTitle', 'year', 'month', 'day'],
      clusteringKeys: ['score', 'user']
    }
  ]
})
export class GameScore {
  @Column({ colType: 'text' }) public user!: string;
  @Column({ colType: 'text' }) public gameTitle!: string;
  @Column({ colType: 'int' }) public year!: number;
  @Column({ colType: 'int' }) public month!: number;
  @Column({ colType: 'int' }) public day!: number;
  @Column({ colType: 'int' }) public score!: number;
  @Column({ colType: 'text' }) public description!: string;
  @Column({ colType: 'text' }) public comment!: string;
}