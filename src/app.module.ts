import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';

import { TeamsModule } from './entities/teams/teams.module';
import { MatchesModule } from './entities/matches/matches.module';
import { SeriesModule } from './entities/series/series.module';
import { PlayoffsModule } from './entities/playoffs/playoffs.module';
import { GroupsModule } from './entities/groups/groups.module';

const CONNECTION_STRING = 'mongodb://127.0.0.1:27017/cs'; // create .env var
const PATH = 'api/v1/data';
const REPLICA_SET_NAME = 'rs0';

@Module({
  imports: [
    TeamsModule,
    MatchesModule,
    SeriesModule,
    PlayoffsModule,
    GroupsModule,
    MongooseModule.forRoot(CONNECTION_STRING, {
      replicaSet: REPLICA_SET_NAME,
      directConnection: true,
      readPreference: 'primary',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      sortSchema: true,
      path: PATH,
    }),
  ],
})
export class AppModule {}
