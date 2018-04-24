import 'reflect-metadata';
import { Ctor } from './domain';

const EntityMetaSymbol = Symbol('EntityMeta');

export function Column(columnMeta: {}) {
    return (proto: any, keyName: string) => {
        proto.constructor
    }
}

export function getEntityMeta(): Ctor[] {
    return Reflect.getMetadata(EntityMetaSymbol, Reflect)
}

getEntityMeta() /* ? */

