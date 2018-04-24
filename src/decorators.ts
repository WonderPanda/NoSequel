import 'reflect-metadata';

const EntityMetaSymbol = Symbol('EntityMeta');

type Ctor = new (...args: any[]) => {}

export function Entity(...args: any[]) {
    return (ctor: Ctor) => {
        const ctors = getEntityMeta() || [];
        Reflect.defineMetadata(EntityMetaSymbol, ctors.concat(ctor), Reflect);
    }
}

export function Column(columnMeta: {}) {
    return (proto: any, keyName: string) => {
        proto.constructor
    }
}

export function getEntityMeta(): Ctor[] {
    return Reflect.getMetadata(EntityMetaSymbol, Reflect)
}

@Entity()
class Sensor {

    @Column({})
    public Id!: string;
}

getEntityMeta() /* ? */

