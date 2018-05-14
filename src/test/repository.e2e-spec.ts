import 'reflect-metadata';
import { Repository, MissingPartitionKeys, normalizeQueryText } from '../db-providers/repository';
import { isError } from 'ts-errorflow';
import { Entity } from '../decorators/entity.decorator';
import { Client } from 'cassandra-driver';
import { TestEntity } from '../models/test.entities';
import { generateSchemaForType } from '../schema-gen/generator';

describe('Given a Repository<T>', () => {
  describe('get()', () => {
    let client: Client;
    let repository: Repository<TestEntity>;

    beforeAll(async () => {
      client = new Client({ contactPoints: ['127.0.0.1'] });
      await client.connect();

      repository = new Repository<TestEntity>(client, TestEntity);

      const keyspace = `
        CREATE KEYSPACE IF NOT EXISTS test WITH REPLICATION = { 
            'class' : 'SimpleStrategy', 
            'replication_factor' : 1 
        };
      `;

      const table = generateSchemaForType<TestEntity>(TestEntity) || 'error';

      await client.execute(keyspace);
      await client.execute(table);
    });

    afterAll(async () => {
      await client.execute('DROP KEYSPACE test');
      client.shutdown();
    })

    it ('should insert the entity', async () => {
      const entity = new TestEntity();
      entity.accountId = 'Contra';
      entity.id = 'WonderPanda';
      entity.message = '9001';
      entity.solutionId = '2018';
      
      
      await repository.insert(entity);
    });


    it('should execute the correct query for retrieving one or more entities by partition key', async () => {
      const repo = new Repository<TestEntity>(client, TestEntity);

      let results = await repo.getFromPartition({
        accountId: 'Contra',
        id: 'WonderPanda',
        solutionId: '2018',

      });
    });
  });
});