import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

import { Team } from './teams.schema';
import { BD_FIELD_NAME } from '../models/teams.model';
import { Options } from '../../../core/models/base-options.model';
import { BaseDbService } from '../../../core/abstracts/base-service';
import { BaseDB } from 'src/core/db/db-base.service';

@Injectable()
export class TeamsDBService implements BaseDbService<Team> {
  private teamsDb: BaseDB<Team>;

  constructor(@InjectModel(BD_FIELD_NAME) private teamsModel: Model<Team>) {
    this.teamsDb = new BaseDB(this.teamsModel);
  }

  getAll(args: Partial<Team>, options: Options) {
    return this.teamsDb.getAll(args, options);
  }

  getAllByIds(ids: string[]) {
    return this.teamsDb.getAllByIds(ids);
  }

  getById(id: string) {
    return this.teamsDb.getById(id);
  }

  create(teamInfo: Partial<Team>, session?: ClientSession) {
    return this.teamsDb.create(teamInfo, session);
  }

  update(id: string, teamInfo: Partial<Team>, session?: ClientSession) {
    return this.teamsDb.update(id, teamInfo, session);
  }

  remove(id: string, session?: ClientSession) {
    return this.teamsDb.remove(id, session);
  }
}
