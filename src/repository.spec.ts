import 'reflect-metadata';
import { Repository } from './repository';

import { Entity } from './entity.decorator';

@Entity<Sensor>({ 
  keyspace: 'iot', 
  table: 'sensors',
  partitionKeys: () => { return ['id'] },
  clusteringKeys: () => { return ['timestamp'] }
})
export class Sensor {
  public id!: string;
  public display!: string;
  public timestamp!: Date;   
}

describe('Given a repository', () => {
  it('should generate valid CQL to retrieve by partitionkey', () => {
    const repo = new Repository<Sensor>(Sensor);
    let queryText = repo.getByPrimaryId('123');

    const expectedText = `
            SELECT * FROM iot.sensors
            WHERE id = '?'
        `; /* ? */

    expect(queryText).toEqual(expectedText);
  });
})