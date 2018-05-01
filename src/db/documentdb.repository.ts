import { IndexableObject, AnError, PartitionKeyQuery, TypedCtor, PartitionKeys, ClusteringKeys } from "../core/domain";
import { IRepository } from "./repository.interface";
import { EntityMetadata, getEntityMeta } from "../decorators/entity.decorator";
import { DocumentClient } from 'documentdb';

class DocumentDbRepository<T extends IndexableObject> implements IRepository<T> {
  private readonly entityCtor: TypedCtor<T>;
  private readonly metadata: EntityMetadata<T>;
  //private readonly client: Client;
  private readonly partitionKeys: PartitionKeys<T>[];

  constructor(entityCtor: TypedCtor<T>) {
      this.entityCtor = entityCtor;
      const metadata = getEntityMeta<T>(entityCtor);
      if (metadata === undefined) {
          throw new Error('Metadata not available for this type');
      }

      this.metadata = metadata;
      this.partitionKeys = this.metadata.partitionKeys;
  }

  getFromPartition(query: PartitionKeyQuery<T>): Promise<Partial<T>[] | AnError> {
    throw new Error("Method not implemented.");
  }
  insert(entity: T): Promise<T | AnError> {
    throw new Error("Method not implemented.");
  }
  deleteOne(query: PartitionKeyQuery<T>): Promise<void | AnError> {
    throw new Error("Method not implemented.");
  }
  deleteMany(query: PartitionKeyQuery<T>): Promise<void | AnError> {
    throw new Error("Method not implemented.");
  }
}