export type Ctor = new (...args: any[]) => {}

export type TypedCtor<T> = new (...args: any[]) => T

type ColumnTypes = string | number | Date

export type Column<T> = T;

export type ColumnProperties<T> = { [ K in keyof T]: T[K] extends Column<K> ? K : never }[keyof T];

export type NonFunctionProperties<T> = { [ K in keyof T]: T[K] extends Function ? never : K }[keyof T];

export type KeySelectorFn<T> = () => NonFunctionProperties<T>[]; 

export const FailureSymbol = Symbol('Failure');

export interface IFailure {
    error: Symbol;
}

export type Either<T, U> = T | U;

/**
 * Type guard that guarantees the right hand side of either is present
 * based on the use of a special failure symbol
 * @param either Something that can be only one of two things
 */
export function isFailure<T, U extends {}>(either: T | U): either is U {
    const candidateFailure = either as any;
    return candidateFailure.error && candidateFailure.error === FailureSymbol;
}

/**
 * Turns any object which may be used to include additional information about a failure
 * into an object that will always return true when checked with isFailure
 * @param failureObj The object to be augmented with failure information
 */
export function makeFailure<T extends object>(failureObj: T) : T & IFailure {
    const failure = <T & IFailure>{};
    failure.error = FailureSymbol;

    for (let x in failureObj) {
        failure[x] = (failureObj as any)[x];
    }

    return failure;
}