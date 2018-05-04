import { Entity, getDiscoveredEntities, getEntityMetaForType } from './entity.decorator';

@Entity<TestClass1>({
    keyspace: 'test',
    table: 'test1',
    partitionKeys: ['id']
})
class TestClass1 {
    public id!: string;
}

@Entity<TestClass2>({
    keyspace: 'test',
    table: 'test2',
    partitionKeys: ['identifier']
})
class TestClass2 {
    public identifier!: string;
}

class TestClass3 {
}

describe('Entity Decorator', () => {
    it('should only store information about decorated classes', () => {
        const discoveredEntities = getDiscoveredEntities();
        expect(discoveredEntities).toContain(TestClass1);
        expect(discoveredEntities).toContain(TestClass2);
        expect(discoveredEntities).not.toContain(TestClass3);
    });

    it('should make the metadata associated with the decorator available', () => {
        const test1Meta = getEntityMetaForType(TestClass1);
        expect(test1Meta).toEqual({
            keyspace: 'test',
            table: 'test1',
            partitionKeys: ['id']
        });

        const test2Meta = getEntityMetaForType(TestClass2);
        expect(test2Meta).toEqual({
            keyspace: 'test',
            table: 'test2',
            partitionKeys: ['identifier']
        });
    });
});