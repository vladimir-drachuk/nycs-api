import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PlayoffsService } from './playoffs.service';
import { PlayoffsResolver } from './playoffs.resolver';
import { PlayoffsDbService } from './db/playoffs.db.service';
import { PlayoffSchema } from './db/playoffs.schema';
import { BD_FIELD_NAME } from './model/playoffs.model';
import { SeriesModule } from '../series/series.module';
import { TeamsModule } from '../teams/teams.module';
import { CoreModule } from 'src/core/core.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BD_FIELD_NAME, schema: PlayoffSchema }]),
    SeriesModule,
    TeamsModule,
    CoreModule,
  ],
  providers: [PlayoffsService, PlayoffsResolver, PlayoffsDbService],
  exports: [PlayoffsService],
})
export class PlayoffsModule {}
