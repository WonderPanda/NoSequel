# NoSequel

This library leverages cutting edge Javsascript and Typescript features such as Symbols, decorators and Conditional Types to provide a modern and powerful ORM for NoSQL database systems.

Cassandra support is currently under active development and should be ready for beta testing in the very near future. Support for CosmosDB Graph with the Gremlin API will follow shortly.

## Basic Usage

Simply decorate your entity classes with the required table metadata and then obtain a Repository instance for your type in order to interact with the database.

Note that through the magic of TypeScript Conditional and Mapped types only key names that match your entity properties are valid for selection as partition or clustering keys.

```javascript
@Entity<ParkingLotEvent>({
  keyspace: 'parking',
  table: 'lot_events_by_franchisee',
  partitionKeys: ['franchiseeNumber', 'lotId'],
  clusteringKeys: [ 'timeStamp' ]
})
export class ParkingLotEvent {
  @Column({ colType: 'text' })
  public franchiseeNumber!: string;
  
  @Column({ colType: 'text' })
  public lotId!: string;
  
  @Column({ colType: 'timeuuid' })
  public timeStamp!: Date;
}

const repository = new Repository<ParkingLotEvent>(client, ParkingLotEvent);

// execute operations against this table using repository
```

## Query Patterns Considerations

#### Partition Keys
NoSequel currently enforces that when retrieving data, the full partition key must be specified. This means that for tables with composite parition keys values must be provided for all keys. ie. for the ParkingLotEvent repository:

```
const events = await repository.get({
  franchiseeNumber: '123',
  lotId: 'abc'
});
```

#### Clustering Keys

TODO
