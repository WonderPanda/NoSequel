export type Ctor = new (...args: any[]) => {}

export type TypedCtor<T> = new (...args: any[]) => T

export type KeySelectorFn<T> = () => (keyof T)[]; 

export const FailureSymbol = Symbol('Failure');

export interface IFailure {
    error?: Symbol;
}

export type Either<T, U> = T | U;

export function isFailure<T, U extends IFailure>(either: T | U): either is U {
    const candidateFailure = either as U;
    if (candidateFailure.error) {
        return candidateFailure.error === FailureSymbol;
    }

    return false;
}

export function makeFailure<T extends object>(failureObj: T) : T & IFailure {
    const failure = <T & IFailure>{};
    failure.error = FailureSymbol;

    for (let x in failureObj) {
        failure[x] = (failureObj as any)[x];
    }

    return failure;
}