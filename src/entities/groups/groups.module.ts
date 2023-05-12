import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

import { GroupsResolver } from './groups.resolver';
import { GroupsService } from './groups.service';
import { BD_FIELD_NAME } from './model/groups.model';
import { GroupsSchema } from './db/groups.schema';
import { GroupsDbService } from './db/groups.db.service';
import { CoreModule } from '../../core/core.module';
import { TeamsModule } from '../teams/teams.module';
import { SeriesModule } from '../series/series.module';
import { MatchesModule } from '../matches/matches.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BD_FIELD_NAME, schema: GroupsSchema }]),
    TeamsModule,
    SeriesModule,
    MatchesModule,
    CoreModule,
  ],
  providers: [GroupsResolver, GroupsService, GroupsDbService],
  exports: [GroupsService],
})
export class GroupsModule {}
