import 'reflect-metadata';
import { Repository } from './repository';

import { Entity } from './entity.decorator';
import { Client } from 'cassandra-driver';

@Entity<Sensor>({
  keyspace: 'iot',
  table: 'sensors',
  partitionKeys: () => { return ['id'] },
  clusteringKeys: () => { return ['timestamp'] }
})
export class Sensor {
  public id!: string;
  public display!: string;
  public timestamp!: Date;
}

describe('Repository<T>', () => {
  describe('Given a repository', () => {
    let client: Client;

    beforeEach(() => {
      client = new Client({ contactPoints: ['127.0.0.1'] });
    })

    it('should execute the correct query for retrieving an entity by partition key', async () => {
      const result = [1, 2, 3];
      const spy = jest.spyOn(client, 'execute').mockImplementation(() => result);

      const repo = new Repository<Sensor>(client, Sensor);
      let queryText = await repo.getByPrimaryId('123');

      const expectedText = `
            SELECT * FROM iot.sensors
            WHERE id = '?'
        `; /* ? */

      expect(spy).toBeCalledWith(expectedText);
    });
  });
});