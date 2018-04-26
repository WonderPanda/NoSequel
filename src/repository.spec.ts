import 'reflect-metadata';
import { Repository, MissingPartitionKeys, normalizeQueryText } from './repository';
import { isFailure } from './domain';
import { Entity } from './entity.decorator';
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

    beforeEach(() => {
      //client = new Client({ contactPoints: ['127.0.0.1'] });
      (client as any) = { execute: () => { } };
    })

    it('should execute the correct query for retrieving one or more entities by partition key', async () => {
      const clientSpy = jest.spyOn(client, 'execute').mockImplementation(() => { 
        return { rows: [] };
      });

      const repo = new Repository<SensorHistory>(client, SensorHistory);

      let queryText = await repo.get({
        accountId: 'fakeAccount',
        solutionId: 'coolSolution',
        id: '123',
      });

      const expectedText = normalizeQueryText(`
        SELECT * FROM iot.sensor_history
        WHERE accountId = ? AND solutionId = ? AND id = ?;
      `);

      expect(clientSpy).toBeCalledWith(expectedText, ['fakeAccount', 'coolSolution', '123']);
    });

    it('should flag any missing partitionKeys and not execute any queries', async() => {
      const clientSpy = jest.spyOn(client, 'execute');
      const repo = new Repository<SensorHistory>(client, SensorHistory);
      
      let expected = [ 'id' ];

      const result = await repo.get({
        accountId: '123',
        solutionId: '456',
      });

      expect(isFailure(result)).toBe(true);
      expect((result as MissingPartitionKeys).keys).toEqual(expected);

      expect(clientSpy).toHaveBeenCalledTimes(0);
    })
  });
});