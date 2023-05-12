import { ClientSession } from 'mongoose';
import { Options } from '../models/base-options.model';

export abstract class BaseDbService<T> {
  abstract getAll(entityFilter?: Partial<T>, options?: Options): Promise<T[]>;
  abstract getById(id: string): Promise<T | null>;
  abstract create(info: Partial<T>, session?: ClientSession): Promise<T>;
  abstract update(
    id: string,
    item: Partial<T>,
    session?: ClientSession,
  ): Promise<T>;
  abstract remove(id: string, session?: ClientSession): Promise<T>;
}
