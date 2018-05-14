import 'reflect-metadata';
import { Repository, MissingPartitionKeys, normalizeQueryText } from '../db-providers/repository';
import { isError } from 'ts-errorflow';
import { Entity } from '../decorators/entity.decorator';
import { Client } from 'cassandra-driver';
import { TestSnakeEntity } from '../models/test.entities';
import { generateSchemaForType } from '../schema-gen/generator';

describe('Given a Repository<T>', () => {
  describe('get()', () => {
    let client: Client;
    let repository: Repository<TestSnakeEntity>;
    let testEntity: TestSnakeEntity;

    beforeAll(async () => {
      client = new Client({ contactPoints: ['127.0.0.1'] });
      await client.connect();

      repository = new Repository<TestSnakeEntity>(client, TestSnakeEntity);

      const keyspace = `
        CREATE KEYSPACE IF NOT EXISTS test WITH REPLICATION = { 
            'class' : 'SimpleStrategy', 
            'replication_factor' : 1 
        };
      `;

      const table = generateSchemaForType<TestSnakeEntity>(TestSnakeEntity) || 'error';
    //   console.log(table);
      await client.execute(keyspace);
      await client.execute(table);

        testEntity = new TestSnakeEntity();
      testEntity.accountId = 'Contra';
      testEntity.id = 'WonderPanda';
      testEntity.message = '9001';
      testEntity.solutionId = '2018';
    });

    afterAll(async () => {
      await client.execute('DROP KEYSPACE test');
      client.shutdown();
    })

    it ('should insert the entity', async () => {
      await repository.insert(testEntity);
    });


    it('should execute the correct query for retrieving one or more entities by partition key', async () => {
      const repo = new Repository<TestSnakeEntity>(client, TestSnakeEntity);

      let results = await repo.getFromPartition({
        accountId: 'Contra',
        id: 'WonderPanda',
        solutionId: '2018',
      });
      
      if (isError<Partial<TestSnakeEntity>[], MissingPartitionKeys>(results)) {
          throw new Error('Expected database results but got none');
      } else {
        expect(results[0]).toEqual(testEntity);
      }
    });
  });
});