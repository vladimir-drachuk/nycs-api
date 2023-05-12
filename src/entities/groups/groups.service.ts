import { HttpStatus, Injectable } from '@nestjs/common';
import { ClientSession } from 'mongoose';

import { GroupsDbService } from './db/groups.db.service';
import { Options } from '../../core/models/base-options.model';
import { GroupDocument } from './db/groups.schema';
import { TransactionsService } from '../../core/db/transaction.service';
import { getGraphQLError } from '../../core/graphql/error-handling/handler';
import { TeamsService } from '../teams/teams.service';
import { MatchesService } from '../matches/matches.service';
import { MatchDocument } from '../matches/db/matches.schema';
import { SeriaDocument } from '../series/db/series.schema';
import { SeriesService } from '../series/series.service';
import { TeamStat } from '../../core/models/team-stat';
import { getTeamStatByMatches } from '../../core/utils/get-team-stats';
import {
  Games,
  StageProgress,
  PlacesCriteria,
  GroupTeamStat,
  PointsKoeffsType,
  TeamStatForRanging,
} from './model/groups.model';
import {
  CANNOT_REMOVE_STAGE,
  GROUP_WITHOUT_TEAMS,
  INCOMPLETE_GROUP_STAGE,
  INCORRECT_GROUP_GAME,
  INCORRECT_GROUP_MATHES,
  INCORRECT_GROUP_SERIES,
  INCORRECT_GROUP_TABLES,
  LAST_GROUP_STAGE,
  TEAM_NOT_EXIST,
} from '../../core/graphql/error-handling/messages';

@Injectable()
export class GroupsService {
  constructor(
    private transactionsService: TransactionsService,
    private groupsDbService: GroupsDbService,
    private teamsService: TeamsService,
    private matchesService: MatchesService,
    private seriesService: SeriesService,
  ) {}

  private transformPointKoeffsToStat(pointKoeffs: PointsKoeffsType) {
    switch (pointKoeffs.length) {
      case 2:
        return [
          pointKoeffs[0],
          pointKoeffs[0],
          0,
          pointKoeffs[1],
          pointKoeffs[1],
        ];
      case 3:
        return [
          pointKoeffs[0],
          pointKoeffs[0],
          pointKoeffs[1],
          pointKoeffs[2],
          pointKoeffs[2],
        ];
      case 4:
        return [
          pointKoeffs[0],
          pointKoeffs[1],
          0,
          pointKoeffs[2],
          pointKoeffs[3],
        ];
      default:
        return pointKoeffs;
    }
  }

  private getRangeCriteria(criteria: PlacesCriteria, stat: TeamStatForRanging) {
    const {
      points,
      seed,
      totalGames: [winGames],
    } = stat;

    switch (criteria) {
      case PlacesCriteria.POINTS:
        return points;
      case PlacesCriteria.WINS:
        return winGames;
      default:
        return seed;
    }
  }

  private getPointsAmount(
    pointKoeffs: PointsKoeffsType,
    stat: TeamStat['totalMatchesStat'],
  ) {
    const pointsMatrix = this.transformPointKoeffsToStat(pointKoeffs);
    return stat.reduce((acc, amount, index) => {
      const point = amount * pointsMatrix[index];
      return acc + point;
    }, 0);
  }

  private getRangeCriteries(
    stat: TeamStatForRanging,
    placesCriteria: PlacesCriteria[],
  ) {
    return placesCriteria.map((criteria) =>
      this.getRangeCriteria(criteria, stat),
    );
  }

  private async addGames(
    group: GroupDocument,
    games: Games,
    sessionId?: ClientSession,
  ) {
    const { id: groupId, progress } = group;
    const { games: allGames } = progress.at(-1);
    const { matches: newMatches, series: newSeries } = games;

    if (!newMatches && !newSeries) return group;

    if (newMatches?.length) {
      for (const match of newMatches) {
        const { id } = await this.matchesService.create(
          {
            ...match,
            belongId: groupId,
          },
          sessionId,
        );

        if (!allGames.matches) allGames.matches = [];

        allGames.matches.push(id);
      }
    }

    if (newSeries?.length) {
      for (const seria of newSeries) {
        const { id } = await this.seriesService.create(
          {
            ...seria,
            belongId: groupId,
          },
          sessionId,
        );

        if (!allGames.series) allGames.series = [];

        allGames.series.push(id);
      }
    }

    return this.groupsDbService.update(groupId, group, sessionId);
  }

  private createStartingStats(teams: string[]) {
    return teams.reduce<Record<string, GroupTeamStat>>((acc, teamId, index) => {
      acc[teamId] = {
        seed: index + 1,
        points: 0,
        totalMatchesStat: [0, 0, 0, 0, 0],
        totalScore: [0, 0],
        totalGames: [0, 0],
        rangeCriteria: [0],
      };

      return acc;
    }, {});
  }

  private checkTables(teams: string[], tables: string[][]) {
    return (
      tables.length &&
      tables.flat().every((teamId) => teams.includes(teamId)) &&
      tables.flat().length === [...new Set(tables.flat())].length
    );
  }

  private checkMatches(teams: string[], matches: Partial<MatchDocument>[]) {
    return matches.every(
      ({ homeTeamId, awayTeamId }) =>
        teams.includes(homeTeamId) && teams.includes(awayTeamId),
    );
  }

  private checkSeries(teams: string[], series: Partial<SeriaDocument>[]) {
    return series.every(
      ({ upSeedTeamId, downSeedTeamId }) =>
        teams.includes(upSeedTeamId) && teams.includes(downSeedTeamId),
    );
  }

  private checkCurrentStageCompletion(
    group: GroupDocument,
    allMatches: MatchDocument[],
    allSeries: SeriaDocument[],
  ) {
    const { progress } = group;
    const {
      games: { matches = [], series = [] },
    } = this.getStageProgressInfo(progress);

    const isMatchesComplete = !allMatches.filter(
      ({ id, isComplete }) => matches.includes(id) && !isComplete,
    ).length;
    const isSeriesComplete = !allSeries.filter(
      ({ id, isComplete }) => series.includes(id) && !isComplete,
    ).length;

    return isMatchesComplete && isSeriesComplete;
  }

  private sortTeamsCallback(
    teamIdA: string,
    teamIdB: string,
    stats: GroupDocument['stats'],
  ) {
    return stats[teamIdB].rangeCriteria
      .map((val, index) => val - stats[teamIdA].rangeCriteria[index])
      .find((diff) => diff);
  }

  private getStageProgressInfo(progress: StageProgress[]) {
    const { tables: stageTables, games } = progress.at(-1);
    let tables = stageTables;

    if (!stageTables) {
      tables = [...progress].reverse().find(({ tables }) => tables).tables;
    }

    return { tables, games };
  }

  private statsConvolution(...statsByMatches: TeamStat[]) {
    return statsByMatches.reduce((acc, stat) => {
      Object.keys(stat).forEach((key) => {
        acc[key] = acc[key].map((item, index) => item + stat[key][index]);
      });

      return acc;
    });
  }

  private async getNewStatsAndStatus(group: GroupDocument, teams?: string[]) {
    const {
      id: groupId,
      stats: prevStats,
      pointKoeffs,
      placesCriteria,
      teams: allTeams,
    } = group;
    const newStat = { ...prevStats };
    const teamIds = teams ?? allTeams;

    const matches = await this.matchesService.getAll({ belongId: groupId });
    const series = await this.seriesService.getAll({ belongId: groupId });

    for (const teamId of teamIds) {
      const teamStatByMatches = getTeamStatByMatches(teamId, matches);
      const teamStatBySeries = [];

      for (const seria of series) {
        const teamStatBySeria = await this.seriesService.getTeamStatByMatches(
          seria.id,
          teamId,
        );
        teamStatBySeries.push(teamStatBySeria);
      }

      const newTeamMatchesStat = this.statsConvolution(
        teamStatByMatches,
        ...teamStatBySeries,
      );
      const { totalMatchesStat } = newTeamMatchesStat;
      const newTeamStat = {
        ...prevStats[teamId],
        ...newTeamMatchesStat,
        points: this.getPointsAmount(pointKoeffs, totalMatchesStat),
      };

      newStat[teamId] = {
        ...newTeamStat,
        rangeCriteria: this.getRangeCriteries(newTeamStat, placesCriteria),
      };
    }

    return {
      stats: newStat,
      isStageComplete: this.checkCurrentStageCompletion(group, matches, series),
    };
  }

  private getCompletionResults(
    progress: GroupDocument['progress'],
    stats: GroupDocument['stats'],
  ) {
    return progress.map(({ tables }) =>
      tables
        ? tables.map((table) =>
            table.sort((teamIdA, teamIdB) =>
              this.sortTeamsCallback(teamIdA, teamIdB, stats),
            ),
          )
        : tables,
    );
  }

  private async updateGroup(
    group: GroupDocument,
    teams?: string[],
    session?: ClientSession,
  ) {
    const { id: groupId, progress, stages } = group;
    const { stats, isStageComplete } = await this.getNewStatsAndStatus(
      group,
      teams,
    );
    const isComplete = isStageComplete && stages === progress.length;

    const result = isComplete
      ? this.getCompletionResults(progress, stats)
      : null;

    return this.groupsDbService.update(
      groupId,
      { ...group.toObject(), stats, isComplete, result },
      session,
    );
  }

  async getSortingTables(group: GroupDocument) {
    const { progress, stats } = group;
    const teamIds = progress
      .map(({ tables }) => tables)
      .flat()
      .filter((tables) => !!tables)
      .flat();

    const teams = await this.teamsService.getAllByIds(teamIds);

    return progress.map(({ tables }) =>
      tables
        ? tables.map((table) =>
            table
              .map((teamId) => ({
                team: teams.find(({ id }) => teamId === id),
                points: stats[teamId].points,
                seed: stats[teamId].seed,
                totalMatchesStat: stats[teamId].totalMatchesStat,
                totalScore: stats[teamId].totalScore,
                totalGames: stats[teamId].totalGames,
              }))
              .sort((a, b) =>
                this.sortTeamsCallback(a.team.id, b.team.id, stats),
              ),
          )
        : tables,
    );
  }

  getAll(matchFilter?: Partial<GroupDocument>, options?: Options) {
    return this.groupsDbService.getAll(matchFilter, options);
  }

  getById(id: string) {
    return this.groupsDbService.getById(id);
  }

  create(
    groupsInfo: Partial<GroupDocument>,
    games: Games = {},
    tables: string[][] | null = null,
    session?: ClientSession,
  ) {
    return this.transactionsService.withTransactions(
      session,
      async (session) => {
        const { teams } = groupsInfo;
        const { matches = [], series = [] } = games;

        if (!teams.length) {
          getGraphQLError(HttpStatus.BAD_REQUEST, GROUP_WITHOUT_TEAMS);
        }

        for (const teamId of teams) {
          const team = await this.teamsService.getById(teamId);

          if (!team) {
            getGraphQLError(HttpStatus.BAD_REQUEST, TEAM_NOT_EXIST(teamId));
          }
        }

        if (tables && !this.checkTables(teams, tables)) {
          getGraphQLError(HttpStatus.BAD_REQUEST, INCORRECT_GROUP_TABLES);
        }

        if (matches.length && !this.checkMatches(teams, matches)) {
          getGraphQLError(HttpStatus.BAD_REQUEST, INCORRECT_GROUP_MATHES);
        }

        if (series.length && !this.checkSeries(teams, series)) {
          getGraphQLError(HttpStatus.BAD_REQUEST, INCORRECT_GROUP_SERIES);
        }

        const group = await this.groupsDbService.create(
          {
            stages: 1,
            placesCriteria: [PlacesCriteria.POINTS],
            pointKoeffs: [1, 0],
            progress: [{ tables, games: {} }],
            stats: this.createStartingStats(teams),
            result: null,
            isComplete: false,
            ...groupsInfo,
          },
          session,
        );

        return this.addGames(group, games, session);
      },
    );
  }

  addStage(
    groupId: string,
    games: Games,
    tables: string[][] | null = null,
    session?: ClientSession,
  ) {
    return this.transactionsService.withTransactions(
      session,
      async (session) => {
        const group = await this.groupsDbService.getById(groupId);
        const { progress, stages } = group;

        if (progress.length === stages) {
          return getGraphQLError(HttpStatus.CONFLICT, LAST_GROUP_STAGE);
        }

        const matches = await this.matchesService.getAll({ belongId: groupId });
        const series = await this.seriesService.getAll({ belongId: groupId });

        if (!this.checkCurrentStageCompletion(group, matches, series)) {
          return getGraphQLError(HttpStatus.CONFLICT, INCOMPLETE_GROUP_STAGE);
        }

        group.progress.push({ tables, games: {} });

        return this.addGames(group, games, session);
      },
    );
  }

  addGamesToStage(groupId: string, games: Games, session?: ClientSession) {
    return this.transactionsService.withTransactions(
      session,
      async (session) => {
        const group = await this.groupsDbService.getById(groupId);
        const { teams } = group;
        const { matches = [], series = [] } = games;

        if (matches.length && !this.checkMatches(teams, matches)) {
          getGraphQLError(HttpStatus.BAD_REQUEST, INCORRECT_GROUP_MATHES);
        }

        if (series.length && !this.checkSeries(teams, series)) {
          getGraphQLError(HttpStatus.BAD_REQUEST, INCORRECT_GROUP_SERIES);
        }

        return this.addGames(group, { matches, series }, session);
      },
    );
  }

  destroyLastStage(groupId: string, session?: ClientSession) {
    return this.transactionsService.withTransactions(
      session,
      async (session) => {
        const group = await this.groupsDbService.getById(groupId);
        const { progress } = group;

        if (progress.length < 2) {
          return getGraphQLError(HttpStatus.CONFLICT, CANNOT_REMOVE_STAGE);
        }

        const {
          games: { matches = [], series = [] },
        } = this.getStageProgressInfo(progress);

        for (const matchId of matches) {
          await this.matchesService.remove(
            matchId,
            { belongId: groupId },
            session,
          );
        }

        for (const seriaId of series) {
          await this.seriesService.remove(
            seriaId,
            { belongId: groupId },
            session,
          );
        }

        progress.splice(-1, 1);

        return this.updateGroup(group, undefined, session);
      },
    );
  }

  playGroupGame(
    groupId: string,
    gameId: string,
    score: [number, number],
    session?: ClientSession,
  ) {
    return this.transactionsService.withTransactions(
      session,
      async (session) => {
        const group = await this.groupsDbService.getById(groupId);
        const { progress } = group;
        const {
          games: { matches, series },
        } = this.getStageProgressInfo(progress);

        if (matches?.includes(gameId)) {
          const { homeTeamId, awayTeamId } = await this.matchesService.update(
            gameId,
            { score },
            { belongId: groupId },
            session,
          );
          await session.commitTransaction();

          return this.updateGroup(group, [homeTeamId, awayTeamId], session);
        }

        if (series?.includes(gameId)) {
          const { upSeedTeamId, downSeedTeamId } =
            await this.seriesService.playMatch(
              gameId,
              score,
              { belongId: groupId },
              session,
            );
          await session.commitTransaction();

          return this.updateGroup(
            group,
            [upSeedTeamId, downSeedTeamId],
            session,
          );
        }

        return getGraphQLError(
          HttpStatus.BAD_REQUEST,
          INCORRECT_GROUP_GAME(gameId),
        );
      },
    );
  }

  resetGroupGame(groupId: string, gameId: string, session?: ClientSession) {
    return this.transactionsService.withTransactions(
      session,
      async (session) => {
        const group = await this.groupsDbService.getById(groupId);
        const { progress } = group;
        const {
          games: { matches, series },
        } = this.getStageProgressInfo(progress);

        if (matches?.includes(gameId)) {
          const { homeTeamId, awayTeamId } = await this.matchesService.update(
            gameId,
            { score: [null, null] },
            { belongId: groupId },
            session,
          );
          await session.commitTransaction();

          return this.updateGroup(group, [homeTeamId, awayTeamId], session);
        }

        if (series?.includes(gameId)) {
          const { upSeedTeamId, downSeedTeamId } =
            await this.seriesService.resetLastMatch(
              gameId,
              { belongId: groupId },
              session,
            );
          await session.commitTransaction();

          return this.updateGroup(
            group,
            [upSeedTeamId, downSeedTeamId],
            session,
          );
        }

        return getGraphQLError(
          HttpStatus.BAD_REQUEST,
          INCORRECT_GROUP_GAME(gameId),
        );
      },
    );
  }

  remove(groupId: string, session?: ClientSession) {
    return this.transactionsService.withTransactions(
      session,
      async (session) => {
        const matches = await this.matchesService.getAll({ belongId: groupId });

        for (const match of matches) {
          await this.matchesService.remove(
            match.id,
            { belongId: groupId },
            session,
          );
        }

        const series = await this.seriesService.getAll({ belongId: groupId });

        for (const seria of series) {
          await this.seriesService.remove(
            seria.id,
            { belongId: groupId },
            session,
          );
        }

        return this.groupsDbService.remove(groupId, session);
      },
    );
  }
}
