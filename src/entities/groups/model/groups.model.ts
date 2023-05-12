import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

import { SeriaDocument } from '../../../entities/series/db/series.schema';
import { MatchDocument } from '../../../entities/matches/db/matches.schema';
import { Team } from '../../../entities/teams/models/teams.model';
import { GroupDocument } from '../db/groups.schema';
import { BaseEntityFindArgs } from '../../../core/graphql/models/base-args.model';
import { TeamStat } from '../../../core/models/team-stat';
import { NewMatchInput } from '../../../entities/matches/models/matches.model';
import { NewSeriaInput } from 'src/entities/series/models/series.model';

type N = number;

/**
 * Valid values:
 *  [win, lost],
 *  [win, draw, lost],
 *  [win, winOT, lostOT, lost],
 *  [win, winOT, draw, lostOT, lost]
 */
export type PointsKoeffsType =
  | [N, N]
  | [N, N, N]
  | [N, N, N, N]
  | [N, N, N, N, N];

export interface Games {
  matches?: Partial<MatchDocument>[];
  series?: Partial<SeriaDocument>[];
}

export interface StageProgress {
  tables: string[][] | null;
  games: {
    series?: string[];
    matches?: string[];
  };
}

export enum PlacesCriteria {
  POINTS = 'points',
  WINS = 'wins',
  WINS_IN_REG_TIME = 'wins-in-reg-time',
  WINS_IN_OT = 'wins-in-ot',
  WINS_PERECENT = 'wins-percent',
  LOSTS = 'losts',
  LOSTS_IN_REG_TIME = 'losts-in-reg-time',
  LOSTS_IN_OT = 'losts-in-ot',
  LOSTS_PERCENT = 'losts-percent',
  SCORES_EARNED = 'scores-earned',
  SCORES_MISSED = 'scores-missed',
  SCORES_DEIFFERENCE = 'scores-difference',
  DRAWS = 'draws',
  SEED = 'seed',
}

export interface GroupTeamStat extends TeamStat {
  points: number;
  seed: number | null;
  rangeCriteria: number[];
}
export type TeamStatForRanging = Omit<GroupTeamStat, 'rangeCriteria'>;

export const BD_FIELD_NAME = 'groups';

export type GroupPure = GroupDocument;

@ObjectType({ description: 'groups' })
export class GroupResult {
  @Field(() => ID)
  id: string;

  @Field(() => Number)
  stages: number;

  @Field(() => [String])
  placesCriteria: PlacesCriteria[];

  @Field(() => [Number])
  pointKoeffs: PointsKoeffsType;

  @Field(() => [[[Table]]], { nullable: 'items' })
  tables: Table[][][];

  @Field(() => [GamesField], { nullable: true })
  games: Games[];

  @Field(() => [[[String]]], { nullable: 'itemsAndList' })
  result: (string[][] | null)[] | null;

  @Field(() => Boolean)
  isComplete: boolean;
}

@ObjectType()
export class Table {
  @Field(() => Team)
  team: Team;

  @Field(() => Number, { nullable: true })
  points: number;

  @Field(() => Number, { nullable: true })
  seed: number | null;

  @Field(() => [Number], { nullable: true })
  totalMatchesStat: [N, N, N, N, N];

  @Field(() => [Number], { nullable: true })
  totalGames: [N, N];

  @Field(() => [Number], { nullable: true })
  totalScore: [N, N];
}

@ObjectType()
export class GamesField {
  @Field(() => [String], { nullable: true })
  matches: string[] | null;

  @Field(() => [String], { nullable: true })
  series: string[];
}

@ArgsType()
export class GroupFindArgs extends BaseEntityFindArgs {
  @Field(() => Number, { nullable: true })
  @IsOptional()
  stages: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  placesCriteria: PlacesCriteria[];

  @Field(() => [Number], { nullable: true })
  @IsOptional()
  pointKoeffs: PointsKoeffsType;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isComplete: boolean;
}

@InputType()
export class NewGroupInput {
  @Field(() => [String])
  teams: string[];

  @Field(() => [NewMatchInput], { nullable: true })
  @IsOptional()
  matches: NewMatchInput[];

  @Field(() => [NewSeriaInput], { nullable: true })
  @IsOptional()
  series: NewSeriaInput[];

  @Field(() => [[String]], { nullable: true })
  @IsOptional()
  tables: string[][];

  @Field(() => Number, { nullable: true })
  @IsOptional()
  stages: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  placesCriteria: PlacesCriteria[];

  @Field(() => [Number], { nullable: true })
  @IsOptional()
  pointKoeffs: PointsKoeffsType;
}

@InputType()
export class AddStageInput {
  @Field(() => [NewMatchInput], { nullable: true })
  @IsOptional()
  matches: NewMatchInput[];

  @Field(() => [NewSeriaInput], { nullable: true })
  @IsOptional()
  series: NewSeriaInput[];

  @Field(() => [[String]], { nullable: true })
  @IsOptional()
  tables: string[][];
}

@InputType()
export class AddGamesToStageInput {
  @Field(() => [NewMatchInput], { nullable: true })
  @IsOptional()
  matches: NewMatchInput[];

  @Field(() => [NewSeriaInput], { nullable: true })
  @IsOptional()
  series: NewSeriaInput[];
}

@InputType()
export class UpdateGroupInput {
  @Field(() => String)
  gameId: string;

  @Field(() => [Number])
  score: [number, number];
}

@InputType()
export class ResetGroupInput {
  @Field(() => String)
  gameId: string;
}
