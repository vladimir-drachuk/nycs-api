import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import {
  StageProgress,
  PlacesCriteria,
  PointsKoeffsType,
  GroupTeamStat,
} from '../model/groups.model';

export type GroupDocument = HydratedDocument<Group>;

@Schema()
export class Group {
  @Prop()
  teams: string[];

  @Prop()
  stages: number;

  @Prop()
  placesCriteria: PlacesCriteria[];

  @Prop({ type: [Number] })
  pointKoeffs: PointsKoeffsType;

  @Prop()
  progress: StageProgress[];

  @Prop({ type: Object })
  stats: Record<string, GroupTeamStat>;

  @Prop()
  result: (string[][] | null)[] | null;

  @Prop()
  isComplete: boolean;
}

export const GroupsSchema = SchemaFactory.createForClass(Group);
