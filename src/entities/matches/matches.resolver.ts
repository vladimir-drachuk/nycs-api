import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { MatchesService } from './matches.service';
import {
  MatchPure,
  MatchResult,
  MatchFindArgs,
  NewMatchInput,
  UpdateMatchInput,
} from './models/matches.model';
import { getSearchParams } from 'src/core/graphql/utils/get-search-params';
import { TeamsService } from '../teams/teams.service';

@Resolver(() => MatchResult)
export class MatchesResolver {
  constructor(
    private matchesService: MatchesService,
    private teamsService: TeamsService,
  ) {}

  @Query(() => [MatchResult])
  matches(@Args() params: MatchFindArgs) {
    const { args, options } = getSearchParams(params);
    return this.matchesService.getAll(args, options);
  }

  @Query(() => MatchResult, { nullable: true })
  matchById(@Args({ name: 'id', type: () => String }) id: string) {
    return this.matchesService.getById(id);
  }

  @ResolveField()
  homeTeam(@Parent() match: MatchPure) {
    const { homeTeamId } = match;
    return this.teamsService.getById(homeTeamId);
  }

  @ResolveField()
  awayTeam(@Parent() match: MatchPure) {
    const { awayTeamId } = match;
    return this.teamsService.getById(awayTeamId);
  }

  @Mutation(() => MatchResult)
  createMatch(@Args('input') props: NewMatchInput) {
    return this.matchesService.create(props);
  }

  @Mutation(() => MatchResult)
  updateMatch(
    @Args({ name: 'id', type: () => String }) id: string,
    @Args('input') props: UpdateMatchInput,
  ) {
    return this.matchesService.update(id, props);
  }

  @Mutation(() => MatchResult)
  removeMatch(@Args({ name: 'id', type: () => String }) id: string) {
    return this.matchesService.remove(id);
  }

  @Mutation(() => MatchResult)
  resetMatch(@Args({ name: 'id', type: () => String }) id: string) {
    return this.matchesService.reset(id);
  }
}
