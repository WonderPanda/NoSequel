import { makeError, IError } from "ts-errorflow";

/**
 * Represents the data types which should logically be candidates for usage in
 * partition or clustering key queries.
 * 
 * In the future this may diverge into two separate types
 * depending on usage patterns in the queries
 */
export type AllowedKeyTypes = string | number | Date

/**
 * Represents the generic set of unique key names that are valid based on the structure
 * from the supplied type of T
 */
export type CandidateKeys<T> = { [K in keyof T]: T[K] extends AllowedKeyTypes ? K : never }[keyof T]

/**
 * Represents the generic set of unique key names that are candidate selections for a Partition Key or
 * as part of a Composite Partition key based on the structure of the supplied type T
 */
export type PartitionKeys<T> = CandidateKeys<T>

/**
 * Represents the generic set of unique key names that are candidate selections for a Composite Key or
 * as part of a Composite Partition key based on the structure of the supplied type T
 */
export type ClusteringKeys<T> = CandidateKeys<T>

/**
 * Represents an object whose property keys must be selected from ones that could potentially be
 * partition keys on the target type T
 * 
 * If ParititionKeys<T> for a given T yielded 'tenantId' | 'applicationId' | 'entityId'
 * then the result of applying this against the same type T would be:
 * TODO: Comments of this nature belong in formal docs
 */
export type PartitionKeysFromType<T> = Pick<T, CandidateKeys<T>>

/**
 * Represents an object whose property keys are an optional subset of keys
 * designated as potential Partition Keys from type T
 */
export type PartitionKeyQuery<T> = Partial<PartitionKeysFromType<T>>

/**
 * Represents an object whose property keys must be selected from ones that could potentially be
 * partition keys on the target type T
 * 
 * If ParititionKeys<T> for a given T yielded 'tenantId' | 'applicationId' | 'entityId'
 * then the result of applying this against the same type T would be:
 * TODO: Comments of this nature belong in formal docs
 */
export type ClusteringKeysFromType<T> = Pick<T, CandidateKeys<T>>

/**
 * Represents an object whose property keys are an optional subset of keys
 * designated as potential Partition Keys from type T
 */
export type ClusteringKeyQuery<T> = Partial<PartitionKeysFromType<T>>

/**
 * Any type that can be accessed using x['someValue'] notation
 */
export type IndexableObject = { [index: string]: any }

/**
 * An error that includes a message with some indication of what went wrong
 */
export interface AnError extends IError { message: string; }

/**
 * A more specific error that includes a payload of information that may
 * be helpful in diagnosing what went wrong
 */
export interface ATypedError<T> extends AnError { body: T }

/**
 * Data types that are supported for the purposes of deserialization from the database back
 * to regular javascript objects
 */
export type DataType = 'string' | 'number' | 'date' | 'object' | 'boolean';

export type Converter<T> = (T: any) => T;