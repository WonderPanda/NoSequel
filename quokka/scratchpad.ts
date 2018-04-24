import { promisifyAll } from 'bluebird';
import { Client } from 'cassandra-driver';
import { readFile, readFileSync } from 'fs';
import * as path from 'path';
const fs = promisifyAll(require('fs'));

let schemaFile = path.join(__dirname, '../test-schemas/init.cql');

const client = new Client({ contactPoints: ['127.0.0.1']});

(async () => {
    
    const query = await fs.readFileAsync(schemaFile, 'utf8');
    
    await client.connect();
    let result = await client.execute(query);
    result

    //let result = await client.execute('SELECT name, email FROM main.users');
})();