import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import {
  InOption,
  NinOption,
  LikeOption,
} from '../../models/base-options.model';

@InputType()
export class InArgType {
  @Field(() => String)
  fieldName: string;

  @Field(() => [String])
  values: string[];
}

@InputType()
export class NinArgType {
  @Field(() => String)
  fieldName: string;

  @Field(() => [String])
  values: string[];
}

@InputType()
export class LikeArgType {
  @Field(() => String)
  fieldName: string;

  @Field(() => [String])
  regExpStr: string[];
}

@ArgsType()
export class BaseEntityFindArgs {
  @Field(() => Number, { nullable: true })
  @IsOptional()
  _skip: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  _sort: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  _limit: number;

  @Field(() => InArgType, { nullable: true })
  @IsOptional()
  _in: InOption;

  @Field(() => NinArgType, { nullable: true })
  @IsOptional()
  _nin: NinOption;

  @Field(() => InArgType, { nullable: true })
  @IsOptional()
  _like: LikeOption;
}
