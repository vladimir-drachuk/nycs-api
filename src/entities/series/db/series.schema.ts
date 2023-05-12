import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { SeriaDuration } from '../models/series.model';

export type SeriaDocument = HydratedDocument<Seria>;

@Schema()
export class Seria {
  @Prop()
  upSeedTeamId: string;

  @Prop()
  downSeedTeamId: string;

  @Prop()
  belongId: string | null;

  @Prop()
  duration: SeriaDuration;

  @Prop()
  mapPool: string[];

  @Prop()
  matchOrder: string[];

  @Prop()
  winnerId: string | null;

  @Prop()
  isComplete: boolean;
}

export const SeriaSchema = SchemaFactory.createForClass(Seria);
