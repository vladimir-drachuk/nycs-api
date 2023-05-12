import {
  Resolver,
  Query,
  Args,
  Mutation,
  ResolveField,
  Parent,
} from '@nestjs/graphql';

import { SeriesService } from './series.service';
import { getSearchParams } from '../../core/graphql/utils/get-search-params';
import { TeamsService } from '../teams/teams.service';
import { MatchesService } from '../matches/matches.service';
import {
  NewSeriaInput,
  SeriaPure,
  SeriaResult,
  SeriaFindArgs,
  UpdateSeriaInput,
  UpdateMapPool,
} from './models/series.model';

@Resolver(() => SeriaResult)
export class SeriesResolver {
  constructor(
    private seriesService: SeriesService,
    private teamsService: TeamsService,
    private matchesService: MatchesService,
  ) {}

  @Query(() => [SeriaResult])
  series(@Args() params: SeriaFindArgs) {
    const { args, options } = getSearchParams(params);
    return this.seriesService.getAll(args, options);
  }

  @Query(() => SeriaResult, { nullable: true })
  seriaById(@Args({ name: 'id', type: () => String }) id: string) {
    return this.seriesService.getById(id);
  }

  @ResolveField()
  upSeedTeam(@Parent() seria: SeriaPure) {
    const { upSeedTeamId } = seria;
    return this.teamsService.getById(upSeedTeamId);
  }

  @ResolveField()
  downSeedTeam(@Parent() seria: SeriaPure) {
    const { downSeedTeamId } = seria;
    return this.teamsService.getById(downSeedTeamId);
  }

  @ResolveField()
  async score(@Parent() seria: SeriaPure) {
    const { id: belongId } = seria;
    const matches = await this.matchesService.getAll({ belongId });
    return this.seriesService.getScore(matches);
  }

  @ResolveField()
  matches(@Parent() seria: SeriaPure) {
    return this.seriesService.getSortedMatches(seria);
  }

  @Mutation(() => SeriaResult)
  createSeria(@Args('input') props: NewSeriaInput) {
    return this.seriesService.create(props);
  }

  @Mutation(() => SeriaResult)
  updateSeriaMapPool(
    @Args({ name: 'id', type: () => String }) id: string,
    @Args('input') { mapPool }: UpdateMapPool,
  ) {
    return this.seriesService.updateMapPool(id, mapPool);
  }

  @Mutation(() => SeriaResult)
  playSeriaMatch(
    @Args({ name: 'id', type: () => String }) id: string,
    @Args('input') { score }: UpdateSeriaInput,
  ) {
    return this.seriesService.playMatch(id, score);
  }

  @Mutation(() => SeriaResult)
  changeLastSeriaMatch(
    @Args({ name: 'id', type: () => String }) id: string,
    @Args('input') { score }: UpdateSeriaInput,
  ) {
    return this.seriesService.changeLastMatch(id, score);
  }

  @Mutation(() => SeriaResult)
  resetLastSeriaMatch(@Args({ name: 'id', type: () => String }) id: string) {
    return this.seriesService.resetLastMatch(id);
  }

  @Mutation(() => SeriaResult)
  removeSeria(@Args({ name: 'id', type: () => String }) id: string) {
    return this.seriesService.remove(id);
  }
}
