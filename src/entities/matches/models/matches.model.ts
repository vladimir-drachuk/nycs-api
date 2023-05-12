import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

import { BaseEntityFindArgs } from '../../../core/graphql/models/base-args.model';
import { MatchDocument } from '../db/matches.schema';
import { Team } from '../../teams/models/teams.model';

export const BD_FIELD_NAME = 'matches';

export interface ParamsOptions {
  belongId: string;
}

export type MatchPure = MatchDocument;

@ObjectType({ description: 'matches' })
export class MatchResult {
  @Field(() => ID)
  id: string;

  @Field(() => Team, { nullable: true })
  homeTeam: Team;

  @Field(() => Team, { nullable: true })
  awayTeam: Team;

  @Field(() => ID, { nullable: true })
  belongId: string | null;

  @Field(() => String)
  map: string;

  @Field(() => Number)
  roundsAmount: number;

  @Field(() => String, { nullable: true })
  winnerId: string | null;

  @Field(() => [Number], { nullable: 'itemsAndList' })
  score: [number, number] | [null, null];

  @Field(() => Boolean)
  isComplete: boolean;

  @Field(() => Boolean, { nullable: true })
  isOvertime: boolean;
}

@ArgsType()
export class MatchFindArgs extends BaseEntityFindArgs {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  homeTeamId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  awayTeamId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  belongId: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  map: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  roundsAmount: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  winnerId: string | null;

  @Field(() => [Number], { nullable: 'itemsAndList' })
  @IsOptional()
  score: [number, number] | [null, null];

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isComplete: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isOvertime: boolean;
}

@InputType()
export class NewMatchInput {
  @Field(() => ID)
  homeTeamId: string;

  @Field(() => ID)
  awayTeamId: string;

  @Field(() => String)
  map: string;
}

@InputType()
export class UpdateMatchInput {
  @Field(() => [Number], { nullable: 'items' })
  score: [number, number] | [null, null];
}
