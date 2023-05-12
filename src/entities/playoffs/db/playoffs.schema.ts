import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { SeriaDuration } from '../../../entities/series/models/series.model';

export type PlayoffDocument = HydratedDocument<Playoff>;

@Schema()
export class Playoff {
  @Prop()
  sortedTeams: string[];

  @Prop()
  schema: SeriaDuration[];

  @Prop()
  progress: string[][];

  @Prop()
  winnerId: string | null;

  @Prop()
  isComplete: boolean;
}

export const PlayoffSchema = SchemaFactory.createForClass(Playoff);
