export const EMPTY_TEAM_ID = {
  error: 'Empty Team Id',
  description: 'Team id cannot be empty. PLease, fill all team Ids',
};

export const TEAM_NOT_EXIST = (id: string) => ({
  error: 'Team not exist',
  description: `team with id ${id} not exist`,
});

export const EQUAL_TEAM_IDS = {
  error: 'Equal IDs',
  description: 'You must provide different team IDs',
};

export const READONLY_SERIA = {
  error: 'Match of seria is readonly',
  description:
    'You cannot update or remove match belong to seria, if you want to change this match you have to use updateSeria() mutation',
};

export const WRONG_SERIA_DURATION = {
  error: 'Wrong seria duration',
  description: 'Please enter correct seria duration',
};

export const MAPS_NOT_MATCH = {
  error: 'Mismatch of maps and seria duration',
  description: 'Map pool amount must be equal to seria duration',
};

export const READONLY_PLAYOFF = {
  error: 'Seria of playoff is readonly',
  description:
    'You cannot update or remove seria belong to playoff, if you want to change this seria you have to use updatePlayoff() mutation',
};

export const SERIA_IS_COMPLETE = {
  error: 'Seria is complete',
  description:
    'You cannot update seria due to completion. There are no match to play',
};

export const SERIA_IS_EMPTY = {
  error: 'Seria without completed matches',
  description: 'There are no previous matches in this seria',
};

export const MAP_POOL_IS_EMPTY = {
  error: 'Map pool is empty',
  description: 'It is forbidden to start a seria without map pool',
};

export const MAP_POOL_UPDATE_DISALLOWED = {
  error: 'Seria have already in progress',
  description: 'It is forbidden to change seria',
};

export const EQUAL_SCORE_IN_SERIA_MATCH = {
  error: 'Equal Score',
  description: 'Draw is not allowed in seria match',
};

export const PLAYOFF_SCHEMA_NOT_VALID = {
  error: 'Playoff schema is invalid',
  description: 'Playoff schema must be an array with bo items',
};

export const TEAMS_AMOUNT_NOT_VALID = {
  error: 'Teams amount is invalid',
  description: 'Teams amount  doesn`t matches to a playoff schema',
};

export const INVALID_SERIA_ID = {
  error: 'Seria Id is invalid',
  description:
    'This seria Id doesn`t exist in this playoff or this seria can not be changed at the moment',
};

export const CANNOT_REMOVE_ROUND = {
  error: 'Can not remove round',
  description: 'Playoff must conntain at least one round',
};

export const GROUP_WITHOUT_TEAMS = {
  error: 'Teams is absent',
  description: 'Disallowed to create group without teams',
};

export const INCORRECT_GROUP_TABLES = {
  error: 'Tables not match',
  description: 'You can add only teams existing in current group',
};

export const INCORRECT_GROUP_MATHES = {
  error: 'Matches not match',
  description: 'You can add only matches with teams existing in current group',
};

export const INCORRECT_GROUP_SERIES = {
  error: 'Series not match',
  description: 'You can add only series with teams existing in current group',
};

export const INCORRECT_GROUP_GAME = (id: string) => ({
  error: 'Incorrect group game',
  description: `Game with id: ${id} don't belong to seria or was played in previous stage`,
});

export const LAST_GROUP_STAGE = {
  error: 'This is the last group stage',
  description: 'You can not add new stage due to last stage',
};

export const INCOMPLETE_GROUP_STAGE = {
  error: 'Current group stage has not comleted',
  description: 'Complete all games on current stage and then try again',
};

export const CANNOT_REMOVE_STAGE = {
  error: 'Can not remove stage',
  description: 'Group must conntain at least one stage',
};
