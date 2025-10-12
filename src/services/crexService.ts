export interface ScoreboardMatch {
  id: string;
  tournament: string;
  sport: string;
  team1: {
    name: string;
    code: string;
    flag: string;
    score?: string;
    overs?: string;
  };
  team2: {
    name: string;
    code: string;
    flag: string;
    score?: string;
    overs?: string;
  };
  status: 'live' | 'upcoming' | 'completed';
  result?: string;
  venue?: string;
  startTime?: string;
  matchFormat?: string;
  tossInfo?: string;
  playerOfMatch?: string;
  lastUpdate?: string;
}

export interface MatchSchedule {
  id: string;
  tournament: string;
  team1: { name: string; code: string; flag: string };
  team2: { name: string; code: string; flag: string };
  dateTime: string;
  venue?: string;
  matchFormat?: string;
  status: 'upcoming' | 'live' | 'completed';
}

export class CrexService {
  private static readonly BASE_URL = '/api/crex';

  static async fetchScoreboard(): Promise<ScoreboardMatch[]> {
    try {
      // Fetch from JSON file similar to fancode service
      const response = await fetch('https://raw.githubusercontent.com/Jitendra-unatti/fancode/refs/heads/main/data/fancode.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.transformScoreboardData(data) || this.getFallbackScoreboard();
    } catch (error) {
      console.error('Error fetching scoreboard:', error);
      return this.getFallbackScoreboard();
    }
  }

  private static transformScoreboardData(data: any): ScoreboardMatch[] {
    if (!data || !Array.isArray(data.matches)) {
      return this.getFallbackScoreboard();
    }

    return data.matches.map((match: any) => {
      const team1 = match.teams?.[0];
      const team2 = match.teams?.[1];
      
      const getScore = (team: any) => {
        const cricketScore = team?.cricketScore?.[0];
        if (cricketScore) {
          return `${cricketScore.runs}/${cricketScore.wickets}`;
        }
        return undefined;
      };

      const getOvers = (team: any) => {
        const cricketScore = team?.cricketScore?.[0];
        return cricketScore?.overs || undefined;
      };

      return {
        id: match.match_id?.toString() || `match-${Date.now()}`,
        tournament: match.tournament || 'Live Match',
        sport: match.category || 'Cricket',
        team1: {
          name: team1?.name || 'Team 1',
          code: team1?.shortName || 'T1',
          flag: team1?.flag?.src || '🏏',
          score: getScore(team1),
          overs: getOvers(team1)
        },
        team2: {
          name: team2?.name || 'Team 2',
          code: team2?.shortName || 'T2',
          flag: team2?.flag?.src || '🏏',
          score: getScore(team2),
          overs: getOvers(team2)
        },
        status: this.mapMatchStatus(match.status),
        venue: `${match.tournament}`,
        startTime: match.startTime,
        matchFormat: 'T20',
        lastUpdate: new Date().toISOString()
      };
    }).filter((match: ScoreboardMatch) => match.status === 'live' || match.status === 'completed');
  }

  private static mapMatchStatus(status: string): 'live' | 'upcoming' | 'completed' {
    if (!status) return 'upcoming';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('live')) return 'live';
    if (lowerStatus.includes('completed') || lowerStatus.includes('finished')) return 'completed';
    return 'upcoming';
  }

  static async fetchSchedule(days: number = 7): Promise<MatchSchedule[]> {
    try {
      // Fetch from JSON file for upcoming matches
      const response = await fetch('https://raw.githubusercontent.com/Jitendra-unatti/fancode/refs/heads/main/data/fancode.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.transformScheduleData(data) || this.getFallbackSchedule();
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return this.getFallbackSchedule();
    }
  }

  private static transformScheduleData(data: any): MatchSchedule[] {
    if (!data || !Array.isArray(data.matches)) {
      return this.getFallbackSchedule();
    }

    return data.matches
      .filter((match: any) => {
        const status = match.status?.toLowerCase();
        return status === 'upcoming' || status === 'scheduled';
      })
      .map((match: any) => {
        const team1 = match.teams?.[0];
        const team2 = match.teams?.[1];

        return {
          id: match.match_id?.toString() || `match-${Date.now()}`,
          tournament: match.tournament || 'Live Match',
          team1: {
            name: team1?.name || 'Team 1',
            code: team1?.shortName || 'T1',
            flag: team1?.flag?.src || '🏏'
          },
          team2: {
            name: team2?.name || 'Team 2',
            code: team2?.shortName || 'T2',
            flag: team2?.flag?.src || '🏏'
          },
          dateTime: match.startTime || new Date().toISOString(),
          venue: match.tournament,
          matchFormat: 'T20',
          status: 'upcoming' as const
        };
      });
  }

  private static getFallbackScoreboard(): ScoreboardMatch[] {
    return [
      {
        id: '1',
        tournament: 'Indian Premier League 2025',
        sport: 'Cricket',
        team1: {
          name: 'Mumbai Indians',
          code: 'MI',
          flag: '🏏',
          score: '185/6',
          overs: '20.0'
        },
        team2: {
          name: 'Chennai Super Kings',
          code: 'CSK',
          flag: '🏏',
          score: '178/8',
          overs: '20.0'
        },
        status: 'completed',
        result: 'Mumbai Indians won by 7 runs',
        venue: 'Wankhede Stadium, Mumbai',
        matchFormat: 'T20',
        tossInfo: 'CSK won the toss and chose to bowl',
        playerOfMatch: 'Rohit Sharma',
        lastUpdate: new Date().toISOString()
      },
      {
        id: '2',
        tournament: 'Big Bash League 2025',
        sport: 'Cricket',
        team1: {
          name: 'Sydney Sixers',
          code: 'SIX',
          flag: '🏏',
          score: '142/5',
          overs: '15.2'
        },
        team2: {
          name: 'Melbourne Stars',
          code: 'STA',
          flag: '🏏',
          score: '140/7',
          overs: '20.0'
        },
        status: 'live',
        venue: 'Sydney Cricket Ground',
        matchFormat: 'T20',
        tossInfo: 'Sixers won the toss and chose to bowl',
        lastUpdate: new Date().toISOString()
      }
    ];
  }

  private static getFallbackSchedule(): MatchSchedule[] {
    return [
      {
        id: '3',
        tournament: 'Indian Premier League 2025',
        team1: { name: 'Royal Challengers Bangalore', code: 'RCB', flag: '🏏' },
        team2: { name: 'Delhi Capitals', code: 'DC', flag: '🏏' },
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        venue: 'M. Chinnaswamy Stadium, Bangalore',
        matchFormat: 'T20',
        status: 'upcoming'
      },
      {
        id: '4',
        tournament: 'Pakistan Super League 2025',
        team1: { name: 'Karachi Kings', code: 'KK', flag: '🏏' },
        team2: { name: 'Lahore Qalandars', code: 'LQ', flag: '🏏' },
        dateTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        venue: 'National Stadium, Karachi',
        matchFormat: 'T20',
        status: 'upcoming'
      }
    ];
  }

  static getTeamFlag(teamName: string): string {
    const flagMap: { [key: string]: string } = {
      'india': '🇮🇳',
      'australia': '🇦🇺',
      'england': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'south africa': '🇿🇦',
      'new zealand': '🇳🇿',
      'pakistan': '🇵🇰',
      'sri lanka': '🇱🇰',
      'bangladesh': '🇧🇩',
      'west indies': '🌴',
      'afghanistan': '🇦🇫'
    };
    
    const country = teamName.toLowerCase();
    return flagMap[country] || '🏏';
  }

  static formatDateTime(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}