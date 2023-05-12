import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

import { Group } from './groups.schema';
import { BD_FIELD_NAME } from '../model/groups.model';
import { BaseDbService } from '../../../core/abstracts/base-service';
import { Options } from '../../../core/models/base-options.model';
import { BaseDB } from 'src/core/db/db-base.service';

@Injectable()
export class GroupsDbService implements BaseDbService<Group> {
  private groupsDb: BaseDB<Group>;

  constructor(@InjectModel(BD_FIELD_NAME) private groupsModel: Model<Group>) {
    this.groupsDb = new BaseDB(this.groupsModel);
  }

  getAll(args: Partial<Group>, options?: Options) {
    return this.groupsDb.getAll(args, options);
  }

  getById(id: string) {
    return this.groupsDb.getById(id);
  }

  create(playoffInfo: Partial<Group>, session?: ClientSession) {
    return this.groupsDb.create(playoffInfo, session);
  }

  update(id: string, teamInfo: Partial<Group>, session?: ClientSession) {
    return this.groupsDb.update(id, teamInfo, session);
  }

  remove(id: string, session?: ClientSession) {
    return this.groupsDb.remove(id, session);
  }
}
