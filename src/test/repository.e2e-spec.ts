import 'reflect-metadata';
import { Repository, MissingPartitionKeys, normalizeQueryText } from '../db/repository';
import { isError } from 'ts-errorflow';
import { Entity, generateEntityTableSchema } from '../decorators/entity.decorator';
import { Client } from 'cassandra-driver';
import { ComplexEntity } from '../models/test.entities';

describe('Given a Repository<T>', () => {
  describe('get()', () => {
    let client: Client;
    let repository: Repository<ComplexEntity>;

    beforeAll(async () => {
      client = new Client({ contactPoints: ['127.0.0.1'] });
      await client.connect();

      repository = new Repository<ComplexEntity>(client, ComplexEntity);

      const keyspace = `
        CREATE KEYSPACE IF NOT EXISTS test WITH REPLICATION = { 
            'class' : 'SimpleStrategy', 
            'replication_factor' : 1 
        };
      `;

      const table = generateEntityTableSchema<ComplexEntity>(ComplexEntity) || 'error';

      await client.execute(keyspace);
      await client.execute(table);
    });

    afterAll(async () => {
      await client.execute('DROP KEYSPACE test');
      client.shutdown();
    })

    it ('should insert the entity', async () => {
      const entity = new ComplexEntity();
      entity.accountId = '123';
      entity.solutionId = '456';
      entity.id = 'abc'
      entity.message = 'this is a test message';

      await repository.insert(entity);
    });


    it('should execute the correct query for retrieving one or more entities by partition key', async () => {
      const repo = new Repository<ComplexEntity>(client, ComplexEntity);

      let results = await repo.getFromPartition({
        accountId: '123',
        solutionId: '456',
        id: 'abc',
      });
    });
  });
});