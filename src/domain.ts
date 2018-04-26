export type Ctor = new (...args: any[]) => {}

export type TypedCtor<T> = new (...args: any[]) => T

export type KeySelectorFn<T> = () => (keyof T)[]; 

export const FailureSymbol = Symbol('Failure');

export interface IFailure {
    error: Symbol;
}

export type Either<T, U> = T | U;

export function isFailure<T, U extends {}>(either: T | U): either is U {
    const candidateFailure = either as any;
    return candidateFailure.error && candidateFailure.error === FailureSymbol;
}

export function makeFailure<T extends object>(failureObj: T) : T & IFailure {
    const failure = <T & IFailure>{};
    failure.error = FailureSymbol;

    for (let x in failureObj) {
        failure[x] = (failureObj as any)[x];
    }

    return failure;
}