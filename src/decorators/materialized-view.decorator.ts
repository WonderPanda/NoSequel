import 'reflect-metadata';
import { TypedCtor } from '../core/domain';
import { getGlobalMeta, extractMeta } from '../core/reflection';

export interface MaterializedViewMetadata<T> {
    
}

export function MaterializedView<T, U>(): ClassDecorator {
    return (ctor) => {

    }
}