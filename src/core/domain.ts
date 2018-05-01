export type Ctor = new (...args: any[]) => {}

export type TypedCtor<T> = new (...args: any[]) => T

export type ColumnTypes = string | number | Date

export type ColumnProperties<T> = { [K in keyof T]: T[K] extends ColumnTypes ? K : never }[keyof T]

export type IndexableObject = { [index: string]: any }