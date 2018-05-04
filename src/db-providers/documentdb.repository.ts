import { IndexableObject, AnError, PartitionKeyQuery, CandidateKeys, ClusteringKeys } from "../core/domain";
import { IRepository } from "./repository.interface";
import { TypedEntityMeta, getEntityMetaForType } from "../decorators/entity.decorator";

class DocumentDbRepository<T extends IndexableObject> implements IRepository<T> {
  private readonly entityCtor: Function;
  private readonly metadata: TypedEntityMeta<T>;
  //private readonly client: Client;
  private readonly partitionKeys: CandidateKeys<T>[];

  constructor(entityCtor: Function) {
      this.entityCtor = entityCtor;
      const metadata = getEntityMetaForType<T>(entityCtor);
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