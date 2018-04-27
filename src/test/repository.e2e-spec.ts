import 'reflect-metadata';
import { Repository, MissingPartitionKeys, normalizeQueryText } from '../db/repository';
import { isFailure } from '../core/domain';
import { Entity, generateEntityTableSchema } from '../decorators/entity.decorator';
import { Client } from 'cassandra-driver';
import { ComplexEntity } from '../models/test.entities';

describe('Given a Repository<T>', () => {
  describe('get()', () => {
    let client: Client;

    beforeEach(async () => {
      client = new Client({ contactPoints: ['127.0.0.1'] });
      await client.connect();
      
      const keyspace = `
        CREATE KEYSPACE IF NOT EXISTS test WITH REPLICATION = { 
            'class' : 'SimpleStrategy', 
            'replication_factor' : 1 
        };
      `;

      const table = generateEntityTableSchema<ComplexEntity>(ComplexEntity) || 'error';
      console.log(table);

      const row = `
        INSERT INTO test.complex_things(accountId, solutionId, id, timestamp)
        VALUES ('123', '456', 'abc', now());
      `;

      await client.execute(keyspace);
      await client.execute(table);
      await client.execute(row);
    })

    it('should execute the correct query for retrieving one or more entities by partition key', async () => {
      const repo = new Repository<ComplexEntity>(client, ComplexEntity);

      let queryText = await repo.get({
        accountId: '123',
        solutionId: '456',
        id: 'abc',
      });
    });
  });
});