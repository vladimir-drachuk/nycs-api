import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

import { BaseEntityFindArgs } from '../../../core/graphql/models/base-args.model';
import { SeriaDocument } from '../db/series.schema';
import { Team } from '../../../entities/teams/models/teams.model';
import { MatchResult } from '../../../entities/matches/models/matches.model';

export const BD_FIELD_NAME = 'series';

export enum SeriaDuration {
  BEST_OF_ONE = 1,
  BEST_OF_THREE = 3,
  BEST_OF_FIVE = 5,
  BEST_OF_SEVEN = 7,
}

export interface ParamsOptions {
  belongId?: string;
}

export type SeriaPure = SeriaDocument;

@ObjectType({ description: 'series' })
export class SeriaResult {
  @Field(() => ID)
  id: string;

  @Field(() => Team)
  upSeedTeam: Team;

  @Field(() => Team)
  downSeedTeam: Team;

  @Field(() => [Number])
  score: [number, number];

  @Field(() => [MatchResult])
  matches: MatchResult[];

  @Field(() => ID, { nullable: true })
  belongId: string | null;

  @Field(() => Number)
  duration: number;

  @Field(() => [String], { nullable: true })
  mapPool: string[];

  @Field(() => [ID])
  matchOrder: string[];

  @Field(() => ID, { nullable: true })
  winnerId: string | null;

  @Field(() => Boolean)
  isComplete: boolean;
}

@ArgsType()
export class SeriaFindArgs extends BaseEntityFindArgs {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  upSeedTeamId: string | null;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  downSeedTeamId: string | null;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  belongId: string | null;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  duration: number;

  @Field(() => [String], { nullable: 'itemsAndList' })
  @IsOptional()
  mapPool: string[];

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  matchOrder: string[];

  @Field(() => ID, { nullable: true })
  @IsOptional()
  winnerId: string | null;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isComplete: boolean;
}

@InputType()
export class NewSeriaInput {
  @Field(() => ID)
  upSeedTeamId: string;

  @Field(() => ID)
  downSeedTeamId: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  mapPool: string[];

  @Field(() => Number, { nullable: true })
  @IsOptional()
  duration: number;
}

@InputType()
export class UpdateMapPool {
  @Field(() => [String])
  mapPool: string[];
}

@InputType()
export class UpdateSeriaInput {
  @Field(() => [Number])
  score: [number, number];
}
