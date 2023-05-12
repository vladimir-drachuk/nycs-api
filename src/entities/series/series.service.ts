import { HttpStatus, Injectable } from '@nestjs/common';
import { ClientSession } from 'mongoose';

import { SeriesDbService } from './db/series.db.service';
import { Seria, SeriaDocument } from './db/series.schema';
import { Options } from '../../core/models/base-options.model';
import { getGraphQLError } from '../../core/graphql/error-handling/handler';
import { ParamsOptions, SeriaDuration } from './models/series.model';
import { MatchesService } from '../matches/matches.service';
import { MatchDocument } from '../matches/db/matches.schema';
import { TransactionsService } from '../../core/db/transaction.service';
import { getTeamStatByMatches } from '../../core/utils/get-team-stats';
import {
  EQUAL_SCORE_IN_SERIA_MATCH,
  MAPS_NOT_MATCH,
  MAP_POOL_IS_EMPTY,
  MAP_POOL_UPDATE_DISALLOWED,
  READONLY_PLAYOFF,
  SERIA_IS_COMPLETE,
  SERIA_IS_EMPTY,
  WRONG_SERIA_DURATION,
} from '../../core/graphql/error-handling/messages';

@Injectable()
export class SeriesService {
  constructor(
    private transactionsService: TransactionsService,
    private seriesDbService: SeriesDbService,
    private matchesService: MatchesService,
  ) {}

  private getMatchesToCompleteAmount(duration: SeriaDuration) {
    return (duration + 1) / 2;
  }

  private getWinnerId(
    seria: SeriaDocument,
    [upSeedTeamScore, downSeedTeamScore]: [number, number],
  ) {
    const { upSeedTeamId, downSeedTeamId, duration } = seria;
    const completeScore = this.getMatchesToCompleteAmount(duration);

    if (
      upSeedTeamScore === completeScore ||
      downSeedTeamScore === completeScore
    ) {
      return upSeedTeamScore === completeScore ? upSeedTeamId : downSeedTeamId;
    }

    return null;
  }

  private async upsertMatches(
    seria: SeriaDocument,
    matches: MatchDocument[],
    session?: ClientSession,
  ) {
    const {
      duration,
      id: seriaId,
      mapPool,
      upSeedTeamId,
      downSeedTeamId,
      matchOrder,
    } = seria;
    const matchesToComplete = this.getMatchesToCompleteAmount(duration);
    const score = this.getScore(matches);
    const leaderScore = Math.max(...score);
    const incompleteMatchesAmount = matches.filter(
      ({ isComplete }) => !isComplete,
    ).length;
    const isComplete = leaderScore === matchesToComplete;
    const winnerId = this.getWinnerId(seria, score);

    if (matchesToComplete - leaderScore > incompleteMatchesAmount) {
      const { id } = await this.matchesService.create(
        {
          homeTeamId: upSeedTeamId,
          awayTeamId: downSeedTeamId,
          map: mapPool.shift(),
          belongId: seriaId,
        },
        session,
      );

      matchOrder.push(id);
    }

    if (matchesToComplete - leaderScore < incompleteMatchesAmount) {
      const lastMatchId = matchOrder.at(-1);

      const { map } = await this.matchesService.remove(
        lastMatchId,
        { belongId: seriaId },
        session,
      );

      matchOrder.pop();
      mapPool.unshift(map);
    }

    return this.seriesDbService.update(
      seriaId,
      { mapPool, matchOrder, isComplete, winnerId },
      session,
    );
  }

  getAll(seriesFilter?: Partial<Seria>, options?: Options) {
    return this.seriesDbService.getAll(seriesFilter, options);
  }

  getAllByIds(ids: string[]) {
    return this.seriesDbService.getAllByIds(ids);
  }

  getById(id: string) {
    return this.seriesDbService.getById(id);
  }

  async getSortedMatches(seria: SeriaDocument) {
    const { matchOrder, id: seriaId } = seria;
    const matches = await this.matchesService.getAll({ belongId: seriaId });

    return matchOrder.map((matchId) =>
      matches.find(({ id }) => id === matchId),
    );
  }

  async getTeamStatByMatches(seriaId: string, teamId: string) {
    const { isComplete, winnerId } = await this.seriesDbService.getById(
      seriaId,
    );
    const matches = await this.matchesService.getAll({ belongId: seriaId });

    const matchesStat = getTeamStatByMatches(teamId, matches);
    const winSeria = Number(isComplete && teamId === winnerId);
    const lostSeria = Number(isComplete && teamId !== winnerId);

    return {
      ...matchesStat,
      totalGames: [winSeria, lostSeria],
    };
  }

  getScore(matches: MatchDocument[]): [number, number] {
    const upSeedTeamScore = matches.filter(
      ({ homeTeamId, isComplete, winnerId }) =>
        isComplete && homeTeamId === winnerId,
    ).length;
    const downSeedTeamScore = matches.filter(
      ({ awayTeamId, isComplete, winnerId }) =>
        isComplete && awayTeamId === winnerId,
    ).length;

    return [upSeedTeamScore, downSeedTeamScore];
  }

  updateMapPool(seriaId: string, mapPool: string[], session?: ClientSession) {
    return this.transactionsService.withTransactions(
      session,
      async (session) => {
        const { duration, matchOrder } = await this.getById(seriaId);

        if (mapPool.length !== duration) {
          getGraphQLError(HttpStatus.BAD_REQUEST, MAPS_NOT_MATCH);
        }

        const matches = await this.matchesService.getAll({ belongId: seriaId });

        const score = this.getScore(matches);
        const isSeriaHasBegan = Math.max(...score) > 0;

        if (isSeriaHasBegan) {
          return getGraphQLError(
            HttpStatus.CONFLICT,
            MAP_POOL_UPDATE_DISALLOWED,
          );
        }

        for (const matchId of matchOrder) {
          const map = mapPool.shift();
          await this.matchesService.update(
            matchId,
            { map },
            { belongId: seriaId },
            session,
          );
        }

        return this.seriesDbService.update(seriaId, { mapPool }, session);
      },
    );
  }

  create(seriesInfo: Partial<Seria>, session?: ClientSession) {
    return this.transactionsService.withTransactions(
      session,
      async (session) => {
        const {
          duration = SeriaDuration.BEST_OF_ONE,
          mapPool = null,
          upSeedTeamId,
          downSeedTeamId,
        } = seriesInfo;

        if (!Object.values(SeriaDuration).includes(duration)) {
          getGraphQLError(HttpStatus.BAD_REQUEST, WRONG_SERIA_DURATION);
        }

        if (mapPool && mapPool.length !== duration) {
          getGraphQLError(HttpStatus.BAD_REQUEST, MAPS_NOT_MATCH);
        }

        const { id: seriaId } = await this.seriesDbService.create(
          {
            belongId: null,
            winnerId: null,
            isComplete: false,
            mapPool,
            duration,
            ...seriesInfo,
          },
          session,
        );

        const startMatchIds: string[] = [];
        const startMatchesAmount = this.getMatchesToCompleteAmount(duration);

        for (let i = 0; i < startMatchesAmount; i++) {
          const map = mapPool && mapPool.shift();

          const { id } = await this.matchesService.create(
            {
              homeTeamId: upSeedTeamId,
              awayTeamId: downSeedTeamId,
              map,
              belongId: seriaId,
            },
            session,
          );

          startMatchIds.push(id);
        }

        return this.seriesDbService.update(
          seriaId,
          {
            mapPool,
            matchOrder: startMatchIds,
          },
          session,
        );
      },
    );
  }

  remove(seriaId: string, options?: ParamsOptions, session?: ClientSession) {
    return this.transactionsService.withTransactions(
      session,
      async (session) => {
        const seria = await this.getById(seriaId);
        const { belongId } = seria;

        if (belongId && belongId !== options?.belongId) {
          return getGraphQLError(HttpStatus.CONFLICT, READONLY_PLAYOFF);
        }

        const matches = await this.matchesService.getAll({ belongId: seriaId });

        for (const match of matches) {
          await this.matchesService.remove(
            match.id,
            { belongId: seriaId },
            session,
          );
        }

        return this.seriesDbService.remove(seriaId, session);
      },
    );
  }

  playMatch(
    seriaId: string,
    score: [number, number],
    options?: ParamsOptions,
    session?: ClientSession,
  ) {
    return this.transactionsService.withTransactions(
      session,
      async (session) => {
        const [upSeedTeamScore, downSeedTeamScore] = score;

        if (upSeedTeamScore === downSeedTeamScore) {
          return getGraphQLError(
            HttpStatus.BAD_REQUEST,
            EQUAL_SCORE_IN_SERIA_MATCH,
          );
        }

        const seria = await this.getById(seriaId);
        const { isComplete, mapPool, belongId } = seria;

        if (belongId && belongId !== options?.belongId) {
          return getGraphQLError(HttpStatus.CONFLICT, READONLY_PLAYOFF);
        }

        if (!mapPool) {
          return getGraphQLError(HttpStatus.CONFLICT, MAP_POOL_IS_EMPTY);
        }

        if (isComplete) {
          return getGraphQLError(HttpStatus.NOT_FOUND, SERIA_IS_COMPLETE);
        }

        const sortedMatches = await this.getSortedMatches(seria);

        const currentMatch = sortedMatches.find(
          ({ isComplete }) => !isComplete,
        );
        const currentMatchIndex = sortedMatches.indexOf(currentMatch);
        const { id: matchId } = currentMatch;

        const completedMatch = await this.matchesService.update(
          matchId,
          { score },
          { belongId: seriaId },
          session,
        );

        sortedMatches.splice(currentMatchIndex, 1, completedMatch);

        return this.upsertMatches(seria, sortedMatches, session);
      },
    );
  }

  changeLastMatch(
    seriaId: string,
    score: [number, number],
    options?: ParamsOptions,
    session?: ClientSession,
  ) {
    return this.transactionsService.withTransactions(
      session,
      async (session) => {
        const seria = await this.getById(seriaId);
        const { belongId } = seria;

        if (belongId && belongId !== options?.belongId) {
          return getGraphQLError(HttpStatus.CONFLICT, READONLY_PLAYOFF);
        }

        const sortedMatches = await this.getSortedMatches(seria);

        const currentMatch = [...sortedMatches]
          .reverse()
          .find(({ isComplete }) => isComplete);

        if (!currentMatch) {
          getGraphQLError(HttpStatus.NOT_FOUND, SERIA_IS_EMPTY);
        }

        const { id: matchId } = currentMatch;
        const currentMatchIndex = sortedMatches.indexOf(currentMatch);

        const changedMatch = await this.matchesService.update(
          matchId,
          { score },
          { belongId: seriaId },
          session,
        );

        sortedMatches.splice(currentMatchIndex, 1, changedMatch);

        return this.upsertMatches(seria, sortedMatches, session);
      },
    );
  }

  resetLastMatch(
    seriaId: string,
    options?: ParamsOptions,
    session?: ClientSession,
  ) {
    return this.changeLastMatch(seriaId, [null, null], options, session);
  }
}
