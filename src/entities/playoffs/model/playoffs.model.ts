import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

import { BaseEntityFindArgs } from '../../../core/graphql/models/base-args.model';
import {
  SeriaDuration,
  SeriaResult,
} from '../../../entities/series/models/series.model';
import { PlayoffDocument } from '../db/playoffs.schema';
import { Team } from '../../../entities/teams/models/teams.model';

export const BD_FIELD_NAME = 'playoffs';

export type PlayoffPure = PlayoffDocument;

@ObjectType({ description: 'playoffs' })
export class PlayoffResult {
  @Field(() => ID)
  id: string;

  @Field(() => [Team])
  sortedTeams: Team[];

  @Field(() => Number)
  currentRound: number;

  @Field(() => [SeriaResult])
  series: SeriaResult[];

  @Field(() => [SeriaResult])
  currentSeries: SeriaResult[];

  @Field(() => [[String]])
  progress: string[][];

  @Field(() => [Number])
  schema: SeriaDuration[];

  @Field(() => ID, { nullable: true })
  winnerId: string | null;

  @Field(() => Boolean)
  isComplete: boolean;
}

@ArgsType()
export class PlayoffFindArgs extends BaseEntityFindArgs {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  sortedTeams: string[];

  @Field(() => [[String]], { nullable: 'itemsAndList' })
  @IsOptional()
  progress: string[][];

  @Field(() => [Number], { nullable: 'itemsAndList' })
  @IsOptional()
  schema: SeriaDuration[];

  @Field(() => ID, { nullable: true })
  @IsOptional()
  winnerId: string | null;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isComplete: boolean;
}

@InputType()
export class NewPlayoffInput {
  @Field(() => [String])
  sortedTeams: string[];

  @Field(() => [Number])
  schema: SeriaDuration[];
}

@InputType()
export class UpdatePlayoffInput {
  @Field(() => String)
  seriaId: string;

  @Field(() => [Number])
  score: [number, number];
}

@InputType()
export class ResetLastPlayoffMatchInput {
  @Field(() => String)
  seriaId: string;
}
