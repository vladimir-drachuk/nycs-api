import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
  NewTeamInput,
  Team,
  TeamFindArgs,
  UpdateTeamInput,
} from './models/teams.model';
import { TeamsService } from './teams.service';
import { getSearchParams } from 'src/core/graphql/utils/get-search-params';

@Resolver()
export class TeamsResolver {
  constructor(private teamsService: TeamsService) {}

  @Query(() => [Team])
  teams(@Args() params: TeamFindArgs) {
    const { args, options } = getSearchParams(params);
    return this.teamsService.getAll(args, options);
  }

  @Query(() => Team, { nullable: true })
  teamById(@Args({ name: 'id', type: () => String }) id: string) {
    return this.teamsService.getById(id);
  }

  @Mutation(() => Team)
  createTeam(@Args('input') props: NewTeamInput) {
    return this.teamsService.create(props);
  }

  @Mutation(() => Team)
  updateTeam(
    @Args({ name: 'id', type: () => String }) id: string,
    @Args('input') props: UpdateTeamInput,
  ) {
    return this.teamsService.update(id, props);
  }

  @Mutation(() => Team)
  removeTeam(@Args({ name: 'id', type: () => String }) id: string) {
    return this.teamsService.remove(id);
  }
}
