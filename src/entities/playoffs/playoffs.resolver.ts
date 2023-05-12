import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { PlayoffsService } from './playoffs.service';
import { getSearchParams } from '../../core/graphql/utils/get-search-params';
import { TeamsService } from '../teams/teams.service';
import {
  PlayoffPure,
  PlayoffResult,
  NewPlayoffInput,
  PlayoffFindArgs,
  ResetLastPlayoffMatchInput,
  UpdatePlayoffInput,
} from './model/playoffs.model';
import { SeriesService } from '../series/series.service';

@Resolver(() => PlayoffResult)
export class PlayoffsResolver {
  constructor(
    private playoffsService: PlayoffsService,
    private seriesService: SeriesService,
    private teamsService: TeamsService,
  ) {}

  @Query(() => [PlayoffResult])
  playoffs(@Args() params: PlayoffFindArgs) {
    const { args, options } = getSearchParams(params);
    return this.playoffsService.getAll(args, options);
  }

  @Query(() => PlayoffResult, { nullable: true })
  playoffById(@Args({ name: 'id', type: () => String }) id: string) {
    return this.playoffsService.getById(id);
  }

  @ResolveField()
  sortedTeams(@Parent() playoff: PlayoffPure) {
    const { sortedTeams } = playoff;
    return this.teamsService.getAllByIds(sortedTeams);
  }

  @ResolveField()
  currentRound(@Parent() playoff: PlayoffPure) {
    return playoff.progress.length;
  }

  @ResolveField()
  series(@Parent() playoff: PlayoffPure) {
    const { id: belongId } = playoff;
    return this.seriesService.getAll({ belongId });
  }

  @ResolveField()
  currentSeries(@Parent() playoff: PlayoffPure) {
    const { progress } = playoff;
    return this.playoffsService.getCurrentRoundSeries(progress);
  }

  @Mutation(() => PlayoffResult)
  createPlayoff(@Args('input') props: NewPlayoffInput) {
    return this.playoffsService.create(props);
  }

  @Mutation(() => PlayoffResult)
  playPlayoffMatch(
    @Args({ name: 'id', type: () => String }) id: string,
    @Args('input') { seriaId, score }: UpdatePlayoffInput,
  ) {
    return this.playoffsService.playMatch(id, seriaId, score);
  }

  @Mutation(() => PlayoffResult)
  changeLastPlayoffMatch(
    @Args({ name: 'id', type: () => String }) id: string,
    @Args('input') { seriaId, score }: UpdatePlayoffInput,
  ) {
    return this.playoffsService.changeLastMatch(id, seriaId, score);
  }

  @Mutation(() => PlayoffResult)
  resetLastPlayoffMatch(
    @Args({ name: 'id', type: () => String }) id: string,
    @Args('input') { seriaId }: ResetLastPlayoffMatchInput,
  ) {
    return this.playoffsService.resetLastMatch(id, seriaId);
  }

  @Mutation(() => PlayoffResult)
  destroyLastPlayoffRound(
    @Args({ name: 'id', type: () => String }) id: string,
  ) {
    return this.playoffsService.destroyLastRound(id);
  }

  @Mutation(() => PlayoffResult)
  removePlayoff(@Args({ name: 'id', type: () => String }) id: string) {
    return this.playoffsService.remove(id);
  }
}
