import { HttpStatus, Injectable } from '@nestjs/common';
import { ClientSession } from 'mongoose';

import { PlayoffsDbService } from './db/playoffs.db.service';
import { Playoff, PlayoffDocument } from './db/playoffs.schema';
import { Options } from '../../core/models/base-options.model';
import { SeriaDuration } from '../series/models/series.model';
import { getGraphQLError } from 'src/core/graphql/error-handling/handler';
import { SeriesService } from '../series/series.service';
import { TransactionsService } from '../../core/db/transaction.service';
import {
  CANNOT_REMOVE_ROUND,
  INVALID_SERIA_ID,
  PLAYOFF_SCHEMA_NOT_VALID,
  TEAMS_AMOUNT_NOT_VALID,
} from '../../core/graphql/error-handling/messages';

@Injectable()
export class PlayoffsService {
  constructor(
    private transactionsService: TransactionsService,
    private playoffsDbService: PlayoffsDbService,
    private seriesService: SeriesService,
  ) {}

  private isSchemaValid(schema: number[]) {
    return (
      schema.length &&
      schema.every((schemaItem) =>
        Object.values(SeriaDuration).includes(schemaItem),
      )
    );
  }

  private isTeamsAmountValid(teams: string[], schema: number[]) {
    return teams.length > 1 && teams.length === 2 ** schema.length;
  }

  private getRoundCouples(teams: string[]) {
    if (teams.length % 2 !== 0) return [];

    let buffer = [...teams];
    const result: [string, string][] = [];

    while (buffer.length > 0) {
      result.push([buffer.at(0), buffer.at(-1)]);
      buffer = buffer.slice(1, -1);
    }

    return result;
  }

  private getSortedTeams(teamIds: string[], schema: string[]) {
    return teamIds
      .map((teamId) => schema.indexOf(teamId))
      .sort()
      .map((teamIndex) => schema[teamIndex]);
  }

  private async createNewRound(
    playoffId: string,
    schema: SeriaDuration[],
    progress: string[][],
    teams: string[],
    session?: ClientSession,
  ) {
    const seriaCouples = this.getRoundCouples(teams);
    const series: string[] = [];

    for (const [upSeedTeamId, downSeedTeamId] of seriaCouples) {
      const { id } = await this.seriesService.create(
        {
          upSeedTeamId,
          downSeedTeamId,
          belongId: playoffId,
          duration: schema[progress.length],
        },
        session,
      );

      series.push(id);
    }

    progress.push(series);

    return this.playoffsDbService.update(playoffId, { progress }, session);
  }

  private async upsertSeries(
    playoff: PlayoffDocument,
    session?: ClientSession,
  ) {
    const { id: playoffId, progress, schema, sortedTeams } = playoff;

    const currentRoundSeries = await this.getCurrentRoundSeries(progress);

    if (currentRoundSeries.every(({ isComplete }) => isComplete)) {
      if (currentRoundSeries.length === 1) {
        const { winnerId, isComplete } = currentRoundSeries[0];
        return this.playoffsDbService.update(
          playoffId,
          { isComplete, winnerId },
          session,
        );
      }

      const newSeriaTeamIds = currentRoundSeries.map(
        ({ winnerId }) => winnerId,
      );
      const newSortedTeams = this.getSortedTeams(newSeriaTeamIds, sortedTeams);

      return this.createNewRound(
        playoffId,
        schema,
        progress,
        newSortedTeams,
        session,
      );
    }

    return playoff;
  }

  getAll(playoffsFilter?: Partial<Playoff>, options?: Options) {
    return this.playoffsDbService.getAll(playoffsFilter, options);
  }

  getById(id: string) {
    return this.playoffsDbService.getById(id);
  }

  getCurrentRoundSeries(progress: string[][]) {
    const currentRoundSeriaIds = progress.at(-1);

    return this.seriesService.getAllByIds(currentRoundSeriaIds);
  }

  create(playoffInfo: Partial<Playoff>, session?: ClientSession) {
    return this.transactionsService.withTransactions(
      session,
      async (session) => {
        const { schema, sortedTeams } = playoffInfo;

        if (!this.isSchemaValid(schema)) {
          return getGraphQLError(
            HttpStatus.BAD_REQUEST,
            PLAYOFF_SCHEMA_NOT_VALID,
          );
        }

        if (!this.isTeamsAmountValid(sortedTeams, schema)) {
          return getGraphQLError(
            HttpStatus.BAD_REQUEST,
            TEAMS_AMOUNT_NOT_VALID,
          );
        }

        const { id } = await this.playoffsDbService.create(
          {
            sortedTeams,
            schema,
            progress: null,
            winnerId: null,
            isComplete: false,
          },
          session,
        );

        return this.createNewRound(id, schema, [], sortedTeams, session);
      },
    );
  }

  playMatch(
    playoffId: string,
    seriaId: string,
    score: [number, number],
    session?: ClientSession,
  ) {
    return this.transactionsService.withTransactions(
      session,
      async (session) => {
        const playoff = await this.getById(playoffId);
        const { progress } = playoff;

        const isSeriaIdValid = progress.at(-1).includes(seriaId);

        if (!isSeriaIdValid) {
          return getGraphQLError(HttpStatus.BAD_REQUEST, INVALID_SERIA_ID);
        }

        await this.seriesService.playMatch(
          seriaId,
          score,
          { belongId: playoffId },
          session,
        );

        return this.upsertSeries(playoff, session);
      },
    );
  }

  changeLastMatch(
    playoffId: string,
    seriaId: string,
    score: [number, number],
    session?: ClientSession,
  ) {
    return this.transactionsService.withTransactions(
      session,
      async (session) => {
        const playoff = await this.getById(playoffId);
        const { progress } = playoff;

        const isSeriaIdValid = progress.at(-1).includes(seriaId);

        if (!isSeriaIdValid) {
          getGraphQLError(HttpStatus.BAD_REQUEST, INVALID_SERIA_ID);
        }

        await this.seriesService.changeLastMatch(
          seriaId,
          score,
          { belongId: playoffId },
          session,
        );

        return this.upsertSeries(playoff, session);
      },
    );
  }

  resetLastMatch(playoffId: string, seriaId: string, session?: ClientSession) {
    return this.transactionsService.withTransactions(
      session,
      async (session) => {
        const playoff = await this.getById(playoffId);
        const { progress } = playoff;

        const isSeriaIdValid = progress.at(-1).includes(seriaId);

        if (!isSeriaIdValid) {
          getGraphQLError(HttpStatus.BAD_REQUEST, INVALID_SERIA_ID);
        }

        await this.seriesService.resetLastMatch(
          seriaId,
          { belongId: playoffId },
          session,
        );

        return this.upsertSeries(playoff, session);
      },
    );
  }

  destroyLastRound(playoffId: string, session?: ClientSession) {
    return this.transactionsService.withTransactions(
      session,
      async (session) => {
        const playoff = await this.getById(playoffId);
        const { progress } = playoff;

        if (progress.length < 2) {
          return getGraphQLError(HttpStatus.CONFLICT, CANNOT_REMOVE_ROUND);
        }

        const currentRoundSeriaIds = progress.at(-1);

        for (const seriaId of currentRoundSeriaIds) {
          await this.seriesService.remove(
            seriaId,
            { belongId: playoffId },
            session,
          );
        }

        const newProgress = progress.slice(0, -1);

        return this.playoffsDbService.update(
          playoffId,
          { progress: newProgress },
          session,
        );
      },
    );
  }

  remove(playoffId: string, session?: ClientSession) {
    return this.transactionsService.withTransactions(
      session,
      async (session) => {
        const series = await this.seriesService.getAll({ belongId: playoffId });

        for (const seria of series) {
          this.seriesService.remove(seria.id, { belongId: playoffId }, session);
        }

        return this.playoffsDbService.remove(playoffId, session);
      },
    );
  }
}
