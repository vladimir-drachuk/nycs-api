import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

import { BD_FIELD_NAME } from '../models/matches.model';
import { Match } from './matches.schema';
import { Options } from '../../../core/models/base-options.model';
import { BaseDbService } from '../../../core/abstracts/base-service';
import { BaseDB } from '../../../core/db/db-base.service';

@Injectable()
export class MatchesDbService implements BaseDbService<Match> {
  private matchesDb: BaseDB<Match>;

  constructor(@InjectModel(BD_FIELD_NAME) private matchesModel: Model<Match>) {
    this.matchesDb = new BaseDB(this.matchesModel);
  }

  getAll(args: Partial<Match>, options: Options) {
    return this.matchesDb.getAll(args, options);
  }

  getById(id: string) {
    return this.matchesDb.getById(id);
  }

  create(matchInfo: Partial<Match>, session?: ClientSession) {
    return this.matchesDb.create(matchInfo, session);
  }

  update(id: string, matchInfo: Partial<Match>, session?: ClientSession) {
    return this.matchesDb.update(id, matchInfo, session);
  }

  remove(id: string, session?: ClientSession) {
    return this.matchesDb.remove(id, session);
  }
}
