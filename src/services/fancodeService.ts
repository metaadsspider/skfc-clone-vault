interface FancodeMatch {
  id: string;
  tournament: string;
  sport: string;
  team1: {
    code: string;
    name: string;
    flag: string;
  };
  team2: {
    code: string;
    name: string;
    flag: string;
  };
  image: string;
  buttonColor: 'red' | 'purple' | 'green' | 'blue';
  sportIcon: string;
  status: 'live' | 'upcoming' | 'completed';
  streamUrl?: string;
}

export class FancodeService {
  private static readonly FANCODE_API_BASE = '/api/fancode';
  
  static async fetchLiveMatches(): Promise<FancodeMatch[]> {
    try {
      // Fetch live matches from FanCode API
      const response = await fetch(`${this.FANCODE_API_BASE}/live-matches`);
      
      if (!response.ok) {
        console.warn('Failed to fetch from FanCode API, using fallback data');
        return this.getFallbackMatches();
      }
      
      const data = await response.json();
      
      // Transform FanCode API response to our format
      return this.transformFancodeData(data);
    } catch (error) {
      console.error('Error fetching matches from FanCode:', error);
      // Return fallback matches for Indian audience
      return this.getFallbackMatches();
    }
  }

  private static getFallbackMatches(): FancodeMatch[] {
    return [
      {
        id: "india-vs-england-5th-test",
        tournament: "India vs England 5th Test - Day 1",
        sport: "cricket",
        team1: {
          code: "IND",
          name: "India",
          flag: "https://d13ir53smqqeyp.cloudfront.net/flags/cr-flags/FC-IND@2x.png"
        },
        team2: {
          code: "ENG",
          name: "England",
          flag: "https://d13ir53smqqeyp.cloudfront.net/flags/cr-flags/FC-ENG@2x.png"
        },
        image: "https://img.hotstar.com/image/upload/f_auto,q_90,w_1920/sources/r1/cms/prod/3627/1753874073627-i",
        buttonColor: "red",
        sportIcon: "🏏",
        status: "live",
        streamUrl: "/api/stream/hotstar/in-mc-pdlive/d1/cricket/live/india-vs-england/master.m3u8"
      },
      {
        id: "mumbai-vs-chennai-ipl",
        tournament: "IPL 2024 - Mumbai Indians vs Chennai Super Kings",
        sport: "cricket",
        team1: {
          code: "MI",
          name: "Mumbai Indians",
          flag: "https://d13ir53smqqeyp.cloudfront.net/flags/cr-flags/FC-MI@2x.png"
        },
        team2: {
          code: "CSK",
          name: "Chennai Super Kings",
          flag: "https://d13ir53smqqeyp.cloudfront.net/flags/cr-flags/FC-CSK@2x.png"
        },
        image: "https://img.hotstar.com/image/upload/f_auto,q_90,w_1920/sources/r1/cms/prod/9876/1753874079876-i",
        buttonColor: "blue",
        sportIcon: "🏏",
        status: "live",
        streamUrl: "/api/stream/hotstar/in-mc-pdlive/d2/cricket/ipl/mi-vs-csk/master.m3u8"
      },
      {
        id: "kabaddi-india-league",
        tournament: "Pro Kabaddi League - Patna Pirates vs Bengal Warriors",
        sport: "kabaddi",
        team1: {
          code: "PAT",
          name: "Patna Pirates",
          flag: "https://d13ir53smqqeyp.cloudfront.net/flags/kab-flags/FC-PAT@2x.png"
        },
        team2: {
          code: "BEN",
          name: "Bengal Warriors",
          flag: "https://d13ir53smqqeyp.cloudfront.net/flags/kab-flags/FC-BEN@2x.png"
        },
        image: "https://img.hotstar.com/image/upload/f_auto,q_90,w_1920/sources/r1/cms/prod/2468/1753874072468-i",
        buttonColor: "purple",
        sportIcon: "🤼",
        status: "live",
        streamUrl: "/api/stream/hotstar/in-mc-pdlive/d4/kabaddi/pkl/pat-vs-ben/master.m3u8"
      }
    ];
  }

  private static transformFancodeData(data: any): FancodeMatch[] {
    if (!data || !Array.isArray(data.matches)) {
      return this.getFallbackMatches();
    }

    return data.matches.map((match: any) => ({
      id: match.id || `match-${Date.now()}`,
      tournament: match.tournament?.name || match.series?.name || 'Live Match',
      sport: match.sport?.toLowerCase() || 'cricket',
      team1: {
        code: match.team1?.code || match.team1?.shortName || 'T1',
        name: match.team1?.name || 'Team 1',
        flag: match.team1?.logo || match.team1?.flag || ''
      },
      team2: {
        code: match.team2?.code || match.team2?.shortName || 'T2',
        name: match.team2?.name || 'Team 2',
        flag: match.team2?.logo || match.team2?.flag || ''
      },
      image: match.image || match.banner || '',
      buttonColor: this.getRandomButtonColor(),
      sportIcon: this.getSportIcon(match.sport),
      status: this.mapMatchStatus(match.status),
      streamUrl: match.streamUrl ? `/api/stream/fancode/${match.streamUrl}` : undefined
    }));
  }

  private static getRandomButtonColor(): 'red' | 'purple' | 'green' | 'blue' {
    const colors: ('red' | 'purple' | 'green' | 'blue')[] = ['red', 'purple', 'green', 'blue'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private static getSportIcon(sport: string): string {
    const sportIcons: { [key: string]: string } = {
      cricket: '🏏',
      football: '⚽',
      kabaddi: '🤼',
      basketball: '🏀',
      tennis: '🎾',
      hockey: '🏑',
    };
    return sportIcons[sport?.toLowerCase()] || '🏏';
  }

  private static mapMatchStatus(status: string): 'live' | 'upcoming' | 'completed' {
    if (!status) return 'upcoming';
    
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('live') || lowerStatus.includes('playing')) return 'live';
    if (lowerStatus.includes('completed') || lowerStatus.includes('finished')) return 'completed';
    return 'upcoming';
  }

  static async fetchMatchStreamUrl(matchId: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.FANCODE_API_BASE}/match/${matchId}/stream`);
      
      if (!response.ok) {
        const fallbackMatch = this.getFallbackMatches().find(m => m.id === matchId);
        return fallbackMatch?.streamUrl || null;
      }
      
      const data = await response.json();
      return data.streamUrl ? `/api/stream/fancode/${data.streamUrl}` : null;
    } catch (error) {
      console.error('Error fetching stream URL:', error);
      const fallbackMatch = this.getFallbackMatches().find(m => m.id === matchId);
      return fallbackMatch?.streamUrl || null;
    }
  }

  static getMatchById(matchId: string): FancodeMatch | undefined {
    const fallbackMatches = this.getFallbackMatches();
    return fallbackMatches.find(match => match.id === matchId);
  }
}