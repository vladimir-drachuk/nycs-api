import { HttpStatus, Injectable } from '@nestjs/common';
import { ClientSession } from 'mongoose';

import { MatchesDbService } from './db/matches.db.service';
import { Match } from './db/matches.schema';
import { Options } from '../../core/models/base-options.model';
import { ParamsOptions } from './models/matches.model';
import { TeamsService } from '../teams/teams.service';
import { getGraphQLError } from '../../core/graphql/error-handling/handler';
import {
  EMPTY_TEAM_ID,
  EQUAL_TEAM_IDS,
  READONLY_SERIA,
  TEAM_NOT_EXIST,
} from '../../core/graphql/error-handling/messages';

@Injectable()
export class MatchesService {
  constructor(
    private matchesDbService: MatchesDbService,
    private teamsService: TeamsService,
  ) {}

  private getWinner(params: Match, isComplete: boolean) {
    const {
      awayTeamId,
      homeTeamId,
      score: [homeTeamScore, awayTeamScore],
    } = params;

    switch (true) {
      case !isComplete:
        return null;
      case homeTeamScore > awayTeamScore:
        return homeTeamId;
      case awayTeamScore > homeTeamScore:
        return awayTeamId;
      default:
        return null;
    }
  }

  private getOTStatus(params: Match, isComplete: boolean) {
    const {
      roundsAmount,
      score: [homeTeamScore, awayTeamScore],
    } = params;

    switch (true) {
      case !isComplete:
        return null;
      case homeTeamScore + awayTeamScore > roundsAmount:
        return true;
      case homeTeamScore + awayTeamScore <= roundsAmount:
        return false;
      default:
        return null;
    }
  }

  getAll(matchFilter?: Partial<Match>, options?: Options) {
    return this.matchesDbService.getAll(matchFilter, options);
  }

  getById(id: string) {
    return this.matchesDbService.getById(id);
  }

  async create(matchesInfo: Partial<Match>, session?: ClientSession) {
    const { homeTeamId, awayTeamId } = matchesInfo;

    if (!homeTeamId || !awayTeamId) {
      return getGraphQLError(HttpStatus.BAD_REQUEST, EMPTY_TEAM_ID);
    }

    if (homeTeamId === awayTeamId) {
      return getGraphQLError(HttpStatus.BAD_REQUEST, EQUAL_TEAM_IDS);
    }

    const homeTeam = await this.teamsService.getById(homeTeamId);
    const awayTeam = await this.teamsService.getById(awayTeamId);

    const teamId = homeTeam?.id && awayTeam?.id;

    if (!teamId) {
      return getGraphQLError(
        HttpStatus.BAD_REQUEST,
        TEAM_NOT_EXIST(!homeTeam?.id ? homeTeamId : awayTeamId),
      );
    }

    return this.matchesDbService.create(
      {
        score: [null, null],
        roundsAmount: 30,
        belongId: null,
        winnerId: null,
        isComplete: false,
        isOvertime: null,
        map: '',
        ...matchesInfo,
      },
      session,
    );
  }

  async update(
    id: string,
    item: Partial<Match>,
    options?: ParamsOptions,
    session?: ClientSession,
  ) {
    const match = await this.getById(id);
    const { belongId } = match;

    if (belongId && belongId !== options?.belongId) {
      return getGraphQLError(HttpStatus.CONFLICT, READONLY_SERIA);
    }

    const resultParams = { ...match.toObject(), ...item };
    const isComplete = resultParams.score.every(
      (teamScore) => teamScore !== null,
    );

    return this.matchesDbService.update(
      id,
      {
        ...resultParams,
        isComplete,
        winnerId: this.getWinner(resultParams, isComplete),
        isOvertime: this.getOTStatus(resultParams, isComplete),
      },
      session,
    );
  }

  async remove(id: string, options?: ParamsOptions, session?: ClientSession) {
    const match = await this.getById(id);
    const { belongId } = match;

    if (belongId && belongId !== options?.belongId) {
      return getGraphQLError(HttpStatus.CONFLICT, READONLY_SERIA);
    }

    return this.matchesDbService.remove(id, session);
  }

  reset(id: string, options?: ParamsOptions, session?: ClientSession) {
    return this.update(id, { score: [null, null] }, options, session);
  }
}
