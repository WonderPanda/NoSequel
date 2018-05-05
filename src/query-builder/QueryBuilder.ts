import { IndexableObject } from "..";

class TestEntity {
    public name!: string;
    public date!: Date;
    public number!: number;
}

export class PartitionQueryBuilder<T extends object> {
    private queryParts: string[] = [];
    public forPartition() {
        return this;
    }

    public where<K extends keyof T>(property: K, predicate: T[K]) {
        return this;
    }
}


const queryBuilder = new PartitionQueryBuilder<TestEntity>();

const query = queryBuilder.forPartition()
    .where('number', 123);
