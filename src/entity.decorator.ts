import 'reflect-metadata';
import { Ctor } from './domain';

const EntityMetaSymbol = Symbol('EntityMeta');

export interface EntityMetadata {
    keyspace: string;
    table?: string;
}

export function Entity(meta: EntityMetadata) {
    return (ctor: Ctor) => {
        const entityMeta = getAllEntityMeta() || new Map<Ctor, EntityMetadata>();
        entityMeta.set(ctor, meta);

        Reflect.defineMetadata(EntityMetaSymbol, entityMeta, Reflect);
    }
}

export function getAllEntityMeta(): Map<Ctor, EntityMetadata> {
    return Reflect.getMetadata(EntityMetaSymbol, Reflect)
}

export function getEntityMeta(entityCtor: Ctor): EntityMetadata | undefined {
    const allMeta = getAllEntityMeta();
    return allMeta.get(entityCtor);
}

@Entity({
    keyspace: 'iot',
    table: ''
})
class Sensor {

}

@Entity({
    keyspace: 'iot',
    table: ''
})
class Device {

}

@Entity({
    keyspace: 'iot',
    table: ''
})
class Asset {

}