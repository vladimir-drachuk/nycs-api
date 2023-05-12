import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

import { BD_FIELD_NAME } from '../model/playoffs.model';
import { Playoff } from './playoffs.schema';
import { BaseDbService } from '../../../core/abstracts/base-service';
import { Options } from '../../../core/models/base-options.model';
import { BaseDB } from 'src/core/db/db-base.service';

@Injectable()
export class PlayoffsDbService implements BaseDbService<Playoff> {
  private playoffsDb: BaseDB<Playoff>;

  constructor(
    @InjectModel(BD_FIELD_NAME) private playoffsModel: Model<Playoff>,
  ) {
    this.playoffsDb = new BaseDB(this.playoffsModel);
  }

  getAll(args: Partial<Playoff>, options?: Options) {
    return this.playoffsDb.getAll(args, options);
  }

  getById(id: string) {
    return this.playoffsDb.getById(id);
  }

  create(playoffInfo: Partial<Playoff>, session?: ClientSession) {
    return this.playoffsDb.create(playoffInfo, session);
  }

  update(id: string, teamInfo: Partial<Playoff>, session?: ClientSession) {
    return this.playoffsDb.update(id, teamInfo, session);
  }

  remove(id: string, session?: ClientSession) {
    return this.playoffsDb.remove(id, session);
  }
}
