import { TypedCtor } from './domain';
import { Entity } from './entity.decorator';

export class Repository<T> {
    //readonly entityCtor: TypedCtor<T>;
    
    constructor(
        entityCtor: new () => T, 
        partitionKeys: (keyof T)[], 
        clusteringKeys: (keyof T)[]
    ) {
        //this.entityCtor = entityCtor;
    }

    getByPrimaryId(id: string) {
        //return new this.entityCtor();
        
    }
}