import 'reflect-metadata';
import { isError } from 'ts-errorflow';
import { Repository, MissingPartitionKeys, normalizeQueryText, MissingClusteringKeys } from './repository';
import { Entity } from '../decorators/entity.decorator';
import { Client } from 'cassandra-driver';
import { TestEntity } from '../models/test.entities';
import { AnError } from '../core/domain';

describe('Given a Repository<T>', () => {
  describe('get()', () => {
    let client: Client;

    beforeEach(() => {
      (client as any) = { execute: () => { } };
    })

    it('should execute the correct query for retrieving one or more entities by partition key', async () => {
      const clientSpy = jest.spyOn(client, 'execute').mockImplementation(() => {
        return { rows: [] };
      });

      const repo = new Repository<TestEntity>(client, TestEntity);

      let queryText = await repo.getFromPartition({
        accountId: 1234,
        solutionId: 'coolSolution',
        id: '123',
      });

      const expectedText = normalizeQueryText(`
        SELECT * FROM test.complex_things
        WHERE accountId = ? AND solutionId = ? AND id = ?;
      `);

      expect(clientSpy).toBeCalledWith(expectedText, ['1234', 'coolSolution', '123'], { prepare: true });
    });

    it('should flag any missing partitionKeys and not execute any queries', async () => {
      const clientSpy = jest.spyOn(client, 'execute');
      const repo = new Repository<TestEntity>(client, TestEntity);

      let expected = ['id'];

      const result = await repo.getFromPartition({
        accountId: 123,
        solutionId: '456',
      });

      expect(isError(result)).toBe(true);
      expect((result as MissingPartitionKeys).body).toEqual(expected);

      expect(clientSpy).toHaveBeenCalledTimes(0);
    })

    it('should require all Partition keys in order to delete', async () => {
      const repo = new Repository<TestEntity>(client, TestEntity);
      let expected = ['id'];
      const result = await repo.deleteOne({
        accountId: 1234,
        solutionId: 'coolSolution'
      });

      expect(isError<void, AnError>(result)).toBe(true);
      expect((result as MissingPartitionKeys).body).toEqual(expected);
    })

    it('should require all Clustering keys in order to delete', async () => {
      const repo = new Repository<TestEntity>(client, TestEntity);
      let expected = ['anotherMessage'];
      const result = await repo.deleteOne({
        accountId: 1234,
        solutionId: 'coolSolution',
        id: 'abc',
        message: 'abcd'
      });

      expect(isError<void, AnError>(result)).toBe(true);
      expect((result as MissingClusteringKeys).body).toEqual(expected);
    })
  });
});