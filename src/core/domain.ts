export type Ctor = new (...args: any[]) => {}

export type TypedCtor<T> = new (...args: any[]) => T

export type ColumnTypes = string | number | Date

export type NonFunctionProperties<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]

export type ColumnProperties<T> = { [K in keyof T]: T[K] extends ColumnTypes ? K : never }[keyof T]