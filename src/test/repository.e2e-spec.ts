import 'reflect-metadata';
import { Repository, MissingPartitionKeys, normalizeQueryText } from '../db-providers/repository';
import { isError } from 'ts-errorflow';
import { Entity } from '../decorators/entity.decorator';
import { Client } from 'cassandra-driver';
import { GameScore } from '../models/test.entities';

describe('Given a Repository<T>', () => {
  describe('get()', () => {
    let client: Client;
    let repository: Repository<GameScore>;

    beforeAll(async () => {
      client = new Client({ contactPoints: ['127.0.0.1'] });
      await client.connect();

      repository = new Repository<GameScore>(client, GameScore);

      const keyspace = `
        CREATE KEYSPACE IF NOT EXISTS test WITH REPLICATION = { 
            'class' : 'SimpleStrategy', 
            'replication_factor' : 1 
        };
      `;

      //const table = generateEntityTableSchema<GameScore>(GameScore) || 'error';
        const table = '';

      await client.execute(keyspace);
      await client.execute(table);
    });

    afterAll(async () => {
      await client.execute('DROP KEYSPACE test');
      client.shutdown();
    })

    it ('should insert the entity', async () => {
      const entity = new GameScore();
      entity.gameTitle = 'Contra';
      entity.user = 'WonderPanda';
      entity.score = 9001;
      entity.year = 2018;
      entity.month = 10;
      entity.day = 19;
      
      await repository.insert(entity);
    });


    it('should execute the correct query for retrieving one or more entities by partition key', async () => {
      const repo = new Repository<GameScore>(client, GameScore);

      let results = await repo.getFromPartition({
        user: 'WonderPanda'
      });
    });
  });
});