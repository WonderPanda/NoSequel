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

//const insert = `INSERT INTO sensors (id, timestamp, display) VALUES (70f28770-394b-4d44-af8d-a98d8fa89b6e, now(), 'jesse');`;

(async () => {
    await client.connect();

    await client.execute(keyspace);

    const query = await fs.readFileAsync(schemaFile, 'utf8');
    let result = await client.execute(query);
    
    
    const repository = new Repository<Sensor>(client, Sensor);
    

    await repository.getByKeys({
        id: '70f28770-394b-4d44-af8d-a98d8fa89b6e'
    })
    
})();

//INSERT INTO sensors ()