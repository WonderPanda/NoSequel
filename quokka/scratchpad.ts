import { promisifyAll } from 'bluebird';
import { Client, types } from 'cassandra-driver';
import { readFile, readFileSync } from 'fs';
import { Repository, Sensor } from '../src/repository';
import * as path from 'path';
import { Entity } from '../src/entity.decorator';
const fs = promisifyAll(require('fs'));

let schemaFile = path.join(__dirname, '../test-schemas/init.cql');

const client = new Client({ contactPoints: ['127.0.0.1']});

const keyspace = `
    CREATE KEYSPACE IF NOT EXISTS iot WITH REPLICATION = { 
        'class' : 'SimpleStrategy', 
        'replication_factor' : 1 
    };
`;

(async () => {
    await client.connect();

    await client.execute(keyspace);

    const query = await fs.readFileAsync(schemaFile, 'utf8');
    let result = await client.execute(query);
    
    
    const repository = new Repository<Sensor>(client, Sensor);
    
    await repository.getByPrimaryId('db28d516-0e6c-4f35-b65e-625f228be45e')
})();

//INSERT INTO sensors ()