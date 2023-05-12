import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MatchesResolver } from './matches.resolver';
import { MatchesService } from './matches.service';
import { BD_FIELD_NAME } from './models/matches.model';
import { MatchSchema } from './db/matches.schema';
import { MatchesDbService } from './db/matches.db.service';
import { TeamsModule } from '../teams/teams.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BD_FIELD_NAME, schema: MatchSchema }]),
    TeamsModule,
  ],
  providers: [MatchesResolver, MatchesService, MatchesDbService],
  exports: [MatchesService],
})
export class MatchesModule {}
