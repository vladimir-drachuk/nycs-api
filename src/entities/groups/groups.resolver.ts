import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import {
  AddGamesToStageInput,
  AddStageInput,
  GroupFindArgs,
  GroupPure,
  GroupResult,
  NewGroupInput,
  ResetGroupInput,
  UpdateGroupInput,
} from './model/groups.model';
import { GroupsService } from './groups.service';
import { getSearchParams } from '../../core/graphql/utils/get-search-params';

@Resolver(() => GroupResult)
export class GroupsResolver {
  constructor(private groupsService: GroupsService) {}

  @Query(() => [GroupResult])
  groups(@Args() params: GroupFindArgs) {
    const { args, options } = getSearchParams(params);
    return this.groupsService.getAll(args, options);
  }

  @Query(() => GroupResult, { nullable: true })
  groupById(@Args({ name: 'id', type: () => String }) id: string) {
    return this.groupsService.getById(id);
  }

  @ResolveField()
  tables(@Parent() group: GroupPure) {
    return this.groupsService.getSortingTables(group);
  }

  @ResolveField()
  games(@Parent() group: GroupPure) {
    return group.progress.map(({ games }) => games);
  }

  @Mutation(() => GroupResult)
  createGroup(@Args('input') props: NewGroupInput) {
    const { matches, series, tables, ...groupProps } = props;
    return this.groupsService.create(groupProps, { matches, series }, tables);
  }

  @Mutation(() => GroupResult)
  addGroupStage(
    @Args({ name: 'id', type: () => String }) id: string,
    @Args('input') { tables, matches, series }: AddStageInput,
  ) {
    return this.groupsService.addStage(id, { matches, series }, tables);
  }

  @Mutation(() => GroupResult)
  addGamesToGroupStage(
    @Args({ name: 'id', type: () => String }) id: string,
    @Args('input') { matches, series }: AddGamesToStageInput,
  ) {
    return this.groupsService.addGamesToStage(id, { matches, series });
  }

  @Mutation(() => GroupResult)
  playGroupGame(
    @Args({ name: 'id', type: () => String }) id: string,
    @Args('input') { gameId, score }: UpdateGroupInput,
  ) {
    return this.groupsService.playGroupGame(id, gameId, score);
  }

  @Mutation(() => GroupResult)
  resetGroupGame(
    @Args({ name: 'id', type: () => String }) id: string,
    @Args('input') { gameId }: ResetGroupInput,
  ) {
    return this.groupsService.resetGroupGame(id, gameId);
  }

  @Mutation(() => GroupResult)
  destroyLastGroupStage(@Args({ name: 'id', type: () => String }) id: string) {
    return this.groupsService.destroyLastStage(id);
  }

  @Mutation(() => GroupResult)
  removeGroup(@Args({ name: 'id', type: () => String }) id: string) {
    return this.groupsService.remove(id);
  }
}
