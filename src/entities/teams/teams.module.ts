import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TeamsResolver } from './teams.resolver';
import { TeamsService } from './teams.service';
import { TeamSchema } from './db/teams.schema';
import { TeamsDBService } from './db/teams.db.service';
import { BD_FIELD_NAME } from './models/teams.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BD_FIELD_NAME, schema: TeamSchema }]),
  ],
  providers: [TeamsResolver, TeamsService, TeamsDBService],
  exports: [TeamsService],
})
export class TeamsModule {}
