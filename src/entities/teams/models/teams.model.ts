import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { BaseEntityFindArgs } from 'src/core/graphql/models/base-args.model';

export const BD_FIELD_NAME = 'teams';

@Object({ description: 'team statistics' })
export class TeamStat {
  @Field(() => Number)
  wins: number;

  @Field(() => Number)
  losts: number;
}

@ObjectType({ description: 'teams' })
export class Team {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  tagname: string;

  @Field(() => String, { nullable: true })
  division: string;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => TeamStat, { nullable: true })
  stats: TeamStat;
}

@ArgsType()
export class TeamFindArgs extends BaseEntityFindArgs {
  @Field(() => String, { nullable: true })
  @IsOptional()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  tagname: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  division: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  description: string;
}

@InputType()
export class NewTeamInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  tagname: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  division: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  description: string;
}

@InputType()
export class UpdateTeamInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  tagname: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  division: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  description: string;
}
