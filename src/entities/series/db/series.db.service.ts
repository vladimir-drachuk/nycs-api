import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { BD_FIELD_NAME } from '../models/series.model';
import { ClientSession, Model } from 'mongoose';
import { Seria } from './series.schema';
import { Options } from '../../../core/models/base-options.model';
import { BaseDbService } from '../../../core/abstracts/base-service';
import { BaseDB } from 'src/core/db/db-base.service';

@Injectable()
export class SeriesDbService implements BaseDbService<Seria> {
  private seriesDb: BaseDB<Seria>;

  constructor(@InjectModel(BD_FIELD_NAME) private seriesModel: Model<Seria>) {
    this.seriesDb = new BaseDB(this.seriesModel);
  }

  getAll(args: Partial<Seria>, options: Options) {
    return this.seriesDb.getAll(args, options);
  }

  getAllByIds(ids: string[]) {
    return this.seriesDb.getAllByIds(ids);
  }

  getById(id: string) {
    return this.seriesDb.getById(id);
  }

  create(teamInfo: Partial<Seria>, session?: ClientSession) {
    return this.seriesDb.create(teamInfo, session);
  }

  update(id: string, teamInfo: Partial<Seria>, session?: ClientSession) {
    return this.seriesDb.update(id, teamInfo, session);
  }

  remove(id: string, session?: ClientSession) {
    return this.seriesDb.remove(id, session);
  }
}
