import { Logger } from '@nestjs/common';
import { ClientSession, Model } from 'mongoose';
import { Options } from '../models/base-options.model';
import { BaseDbService } from '../abstracts/base-service';

export class BaseDB<T> implements BaseDbService<T> {
  private logger: Logger;

  private logInfo(queryName: string, args: unknown) {
    this.logger.log(
      `${this.Model.modelName.toUpperCase()} > ${queryName} > ${JSON.stringify(
        args,
      )}`,
    );
  }

  constructor(private Model: Model<T>) {
    this.logger = new Logger('MongoDB');
  }

  async getAll(args: Partial<T>, options: Options) {
    const result = await this.Model.find(args, {}, options);
    this.logInfo('getAll', { ...args, ...options });

    return result;
  }

  async getById(id: string) {
    const result = await this.Model.findById(id);
    this.logInfo('getById', { id });

    return result;
  }

  async getAllByIds(ids: string[]) {
    const result = this.Model.find({ _id: { $in: ids } });
    this.logInfo('getAllByIds', { ids });

    return result;
  }

  async create(info: Partial<T>, session: ClientSession = null) {
    const [result] = await this.Model.create([info], { session });
    this.logInfo('create', info);

    return result;
  }

  async update(id: string, item: Partial<T>, session: ClientSession = null) {
    const result = await this.Model.findByIdAndUpdate(id, item, {
      new: true,
      session,
    });
    this.logInfo('update', item);

    return result;
  }

  async remove(id: string, session: ClientSession = null) {
    const result = await this.Model.findByIdAndRemove(id, { session });
    this.logInfo('update', { id });

    return result;
  }
}
