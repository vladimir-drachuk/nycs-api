import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { TeamStat } from '../models/teams.model';

@Schema()
export class Team {
  @Prop()
  name: string;

  @Prop()
  tagname: string;

  @Prop()
  division: string | null;

  @Prop()
  description: string | null;

  @Prop()
  stats: TeamStat;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
