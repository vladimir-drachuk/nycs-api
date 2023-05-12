import { Module } from '@nestjs/common';
import { SeriesResolver } from './series.resolver';
import { SeriesService } from './series.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BD_FIELD_NAME } from './models/series.model';
import { SeriaSchema } from './db/series.schema';
import { SeriesDbService } from './db/series.db.service';
import { MatchesModule } from '../matches/matches.module';
import { TeamsModule } from '../teams/teams.module';
import { CoreModule } from 'src/core/core.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BD_FIELD_NAME, schema: SeriaSchema }]),
    MatchesModule,
    TeamsModule,
    CoreModule,
  ],
  providers: [SeriesResolver, SeriesService, SeriesDbService],
  exports: [SeriesService],
})
export class SeriesModule {}
