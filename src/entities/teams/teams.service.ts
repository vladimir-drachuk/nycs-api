import { Injectable } from '@nestjs/common';

import { TeamsDBService } from './db/teams.db.service';
import { Team } from './db/teams.schema';
import { Options } from '../../core/models/base-options.model';
import { ClientSession } from 'mongoose';

@Injectable()
export class TeamsService {
  constructor(private teamsDbService: TeamsDBService) {}

  getAll(args: Partial<Team> = {}, options: Options = {}) {
    return this.teamsDbService.getAll(args, options);
  }

  getById(id: string) {
    return this.teamsDbService.getById(id);
  }

  getAllByIds(ids: string[]) {
    return this.teamsDbService.getAllByIds(ids);
  }

  create(teamInfo: Partial<Team>, session?: ClientSession) {
    return this.teamsDbService.create(
      {
        description: null,
        division: null,
        ...teamInfo,
      },
      session,
    );
  }

  update(id: string, teamInfo: Partial<Team>, session?: ClientSession) {
    return this.teamsDbService.update(id, teamInfo, session);
  }

  remove(id: string, session?: ClientSession) {
    return this.teamsDbService.remove(id, session);
  }
}
