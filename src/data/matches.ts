export interface Team {
  code: string;
  name: string;
  flag: string;
}

export interface Match {
  id: string;
  tournament: string;
  sport: string;
  team1: Team;
  team2: Team;
  image: string;
  buttonColor: 'red' | 'purple' | 'green' | 'blue';
  sportIcon: string;
  status?: 'live' | 'upcoming' | 'completed';
  streamUrl?: string;
}

// This file now serves as a fallback - live matches are fetched from FanCode
export const matches: Match[] = [];
