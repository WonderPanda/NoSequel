import { TypedCtor } from './domain';
import { Entity } from './entity.decorator';

export class Repository<T> {
    //readonly entityCtor: TypedCtor<T>;
    
    constructor(entityCtor: new () => T) {
        //this.entityCtor = entityCtor;
    }

    getByPrimaryId(id: string) {
        //return new this.entityCtor();
        
    }
}

@Entity({
    keyspace: 'iot',
    table: ''
})
class Sensor {
    public something!: string;   
}

@Entity({
    keyspace: 'iot',
    table: ''
})
class Device {
    public device = 'device';
}

const repo = new Repository<Sensor>(Device);
Device /* ? */