import { MatchDocument } from '../../entities/matches/db/matches.schema';
import { TeamStat } from '../models/team-stat';

export const getTeamStatByMatches = (
  teamId: string,
  matches: MatchDocument[],
) => {
  return matches.reduce<TeamStat>(
    (acc, match) => {
      const {
        homeTeamId,
        awayTeamId,
        score: [scoreHomeTeam, scoreAwayTeam],
        isComplete,
        winnerId,
        isOvertime,
      } = match;

      if ((teamId === homeTeamId || teamId === awayTeamId) && isComplete) {
        let totalMatchesIndex: number | null = null;
        let totalGamesIndex: number | null = null;

        switch (true) {
          case winnerId === teamId && !isOvertime:
            totalMatchesIndex = 0;
            totalGamesIndex = 0;
            break;
          case winnerId === teamId && isOvertime:
            totalMatchesIndex = 1;
            totalGamesIndex = 0;
            break;
          case winnerId !== teamId && isOvertime:
            totalMatchesIndex = 3;
            totalGamesIndex = 1;
            break;
          case winnerId !== teamId && !isOvertime:
            totalMatchesIndex = 4;
            totalGamesIndex = 1;
            break;
          case scoreHomeTeam === scoreAwayTeam:
            totalMatchesIndex = 2;
            break;
          default:
            break;
        }

        acc.totalScore[0] +=
          teamId === homeTeamId ? scoreHomeTeam : scoreAwayTeam;
        acc.totalScore[1] +=
          teamId === homeTeamId ? scoreAwayTeam : scoreHomeTeam;
        if (totalMatchesIndex !== null)
          acc.totalMatchesStat[totalMatchesIndex] += 1;
        if (totalGamesIndex !== null) acc.totalGames[totalGamesIndex] += 1;
      }

      return acc;
    },
    {
      totalMatchesStat: [0, 0, 0, 0, 0],
      totalGames: [0, 0],
      totalScore: [0, 0],
    },
  );
};
