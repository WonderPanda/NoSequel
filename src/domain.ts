export type Ctor = new (...args: any[]) => {}

export type TypedCtor<T> = new (...args: any[]) => T

export type KeySelectorFn<T> = () => (keyof T)[]; 