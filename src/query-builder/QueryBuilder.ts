import { PartitionKeyQuery } from "../core/domain";


export type Comparisons = 'lt' | 'gt' | 'eq';

class TestEntity {
    public name!: string;
    public dateProp!: Date;
    public number!: number;
}

export function getPartitionQueryBuilder<T extends object>(pkQuery: PartitionKeyQuery<T>) {
    return new PartitionQueryBuilder<T>(pkQuery);
}

export class PartitionQueryBuilder<T extends object> {
    private queryParts: string[] = [];
    private partitionKeyQuery: PartitionKeyQuery<T>;

    constructor(pkQuery: PartitionKeyQuery<T>) {
        this.partitionKeyQuery = pkQuery;
    }
    

    public where<K extends keyof T>(property: K, comparison: Comparisons, predicate: T[K]) {
        return this;
    }

    public limit(count: number) {
        return this;
    }
}


const queryBuilder = getPartitionQueryBuilder<TestEntity>({name: 'jesse'});

const query = queryBuilder
    .where('dateProp', 'lt', new Date())
    .limit(1);
