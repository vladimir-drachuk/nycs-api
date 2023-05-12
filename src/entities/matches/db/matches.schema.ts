import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MatchDocument = HydratedDocument<Match>;

@Schema()
export class Match {
  @Prop()
  homeTeamId: string;

  @Prop()
  awayTeamId: string;

  @Prop()
  belongId: string | null;

  @Prop()
  map: string;

  @Prop()
  roundsAmount: number;

  @Prop()
  winnerId: string | null;

  @Prop()
  score: [number, number] | [null, null];

  @Prop()
  isComplete: boolean;

  @Prop()
  isOvertime: boolean | null;
}

export const MatchSchema = SchemaFactory.createForClass(Match);
