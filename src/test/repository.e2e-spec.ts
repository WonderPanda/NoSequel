import 'reflect-metadata';
import { Repository, MissingPartitionKeys, normalizeQueryText } from '../repository';
import { isFailure } from '../domain';
import { Entity } from '../entity.decorator';
import { Client } from 'cassandra-driver';

@Entity<SensorHistory>({
  keyspace: 'iot',
  table: 'sensor_history',
  partitionKeys: () => { return ['accountId', 'solutionId', 'id'] },
  clusteringKeys: () => { return ['timestamp'] }
})
class SensorHistory {
  public accountId!: string;
  public solutionId!: string
  public id!: string;
  public display!: string;
  public timestamp!: Date;
}

describe('Given a Repository<T>', () => {
  describe('get()', () => {
    let client: Client;

    beforeEach(async () => {
      client = new Client({ contactPoints: ['127.0.0.1'] });
      await client.connect();
      
      const keyspace = `
        CREATE KEYSPACE IF NOT EXISTS iot WITH REPLICATION = { 
            'class' : 'SimpleStrategy', 
            'replication_factor' : 1 
        };
      `;

      const table = `
        CREATE TABLE IF NOT EXISTS iot.sensor_history (
          accountId text,
          solutionId text,
          id text,
          display text,
          timestamp timeuuid,
          PRIMARY KEY ((accountId, solutionId, id), timestamp)
        );
      `;

      const row = `
        INSERT INTO iot.sensor_history(accountId, solutionId, id, timestamp)
        VALUES ('123', '456', 'abc', now());
      `;

      await client.execute(keyspace);
      await client.execute(table);
      await client.execute(row);
    })

    it('should execute the correct query for retrieving one or more entities by partition key', async () => {
      const repo = new Repository<SensorHistory>(client, SensorHistory);

      let queryText = await repo.get({
        accountId: '123',
        solutionId: '456',
        id: 'abc',
      });
    });
  });
});