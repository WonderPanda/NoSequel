import { IndexableObject, PartitionKeyQuery, AnError, ClusteringKeyQuery } from "../core/domain";
import { TypedEntityMeta } from "../decorators/entity.decorator";

export interface IRepository<T extends IndexableObject> {
  getFromPartition(query: PartitionKeyQuery<T>, subquery: ClusteringKeyQuery<T>): Promise<Partial<T>[] | AnError>

  insert(entity: T): Promise<T | AnError>

  deleteOne(query: PartitionKeyQuery<T>): Promise<void | AnError>

  deleteMany(query: PartitionKeyQuery<T>): Promise<void | AnError>
}