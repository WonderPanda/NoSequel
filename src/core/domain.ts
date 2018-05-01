import { makeError, IError } from "ts-errorflow";

export type Ctor = new (...args: any[]) => {}

export type TypedCtor<T> = new (...args: any[]) => T

export type AllowedKeyTypes = string | number | Date

export type PartitionKeysFromType<T> = Pick<T, PartitionKeys<T>>

export type PartitionKeyQuery<T> = Partial<PartitionKeysFromType<T>>

export type PartitionKeys<T> = { [K in keyof T]: T[K] extends AllowedKeyTypes ? K : never }[keyof T]

export type ClusteringKeys<T> = { [K in keyof T]: T[K] extends AllowedKeyTypes ? K : never }[keyof T]

export type IndexableObject = { [index: string]: any }

export interface AnError extends IError { message: string; body?: {} }

export interface ATypedError<T> extends AnError { body: T }
