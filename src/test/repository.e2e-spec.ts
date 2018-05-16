import 'reflect-metadata';
import { Repository, MissingPartitionKeys, normalizeQueryText } from '../db-providers/repository';
import { isError } from 'ts-errorflow';
import { Entity } from '../decorators/entity.decorator';
import { Client } from 'cassandra-driver';
import { TestEntity } from '../models/test.entities';
import { generateSchemaForType } from '../schema-gen/generator';
import { AnError } from '../core/domain';

describe('Given a Repository<T>', () => {
  let client: Client;
  let repository: Repository<TestEntity>;
  let entity: TestEntity;

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
    // console.log(table);

    await client.execute(keyspace);
    await client.execute(table);

    entity = new TestEntity();
    entity.accountId = 123;
    entity.solutionId = '456';
    entity.id = 'abc';
    entity.message = 'abcd';
    entity.anotherMessage = 'else';
    entity.lastMessage = 'last';
  });

  afterAll(async () => {
    await client.execute('DROP KEYSPACE test');
    client.shutdown();
  })

  it('should insert the entity', async () => {
    await repository.insert(entity);
  });


  it('should be able to retrieve the entity from the database', async () => {
    let results = await repository.getFromPartition({
      accountId: 123,
      solutionId: '456',
      id: 'abc',
      message: 'abcd',
      anotherMessage: 'else',
      lastMessage: 'last'
    })

    if (isError<Partial<TestEntity>[], AnError>(results)) {
      throw new Error('Expected database results but got an error');
    } else {
      expect(results.length).toBe(1);
      expect(results[0]).toEqual(entity);
    }
  });

  it('should delete the entity', async () => {
    await repository.deleteOne({
      accountId: 123,
      solutionId: '456',
      id: 'abc',
      message: 'abcd',
      anotherMessage: 'else',
      lastMessage: 'last'
    })

  });

  it('should delete the entity in multiple places', async () => {
    await repository.deleteMany({
      accountId: 123,
      solutionId: '456',
      id: 'abc',
      message: 'abcd',
      anotherMessage: 'else'

    })

  });

  it('should no longer be able to retrieve the entity', async () => {
    let results = await repository.getFromPartition({
      accountId: 123,
      solutionId: '456',
      id: 'abc',
      message: 'abcd',
      anotherMessage: 'else',
      lastMessage: 'last'
    })


    if (isError<Partial<TestEntity>[], AnError>(results)) {
      throw new Error('Expected database results but got an error');
    } else {
      expect(results.length).toBe(0);
    }
  });
});