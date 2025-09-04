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
      // Fetch from GitHub JSON feed
      const response = await fetch('https://raw.githubusercontent.com/drmlive/fancode-live-events/refs/heads/main/fancode.json');

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json') || contentType.includes('text/plain')) {
          try {
            const data = await response.json();
            const transformed = this.transformGithubData(data);
            if (Array.isArray(transformed) && transformed.length) {
              return transformed;
            }
          } catch (e) {
            console.warn('GitHub JSON feed returned invalid data');
          }
        } else {
          console.warn('GitHub JSON feed returned unexpected content type');
        }
      } else {
        console.warn('GitHub JSON feed failed, status:', response.status);
      }

      console.warn('GitHub JSON feed failed, using local fallback data');
      return this.getFallbackMatches();
    } catch (error) {
      console.error('Error fetching matches from GitHub:', error);
      return this.getFallbackMatches();
    }
  }

  private static getFallbackMatches(): FancodeMatch[] {
    return [
      {
        id: "Gulbarga Mystics VS Mangaluru Dragons",
        tournament: "Maharaja T20 Trophy, 2025",
        sport: "cricket",
        team1: {
          code: "GMY",
          name: "Gulbarga Mystics",
          flag: "https://pbs.twimg.com/profile_images/1552595996219408385/YQzPKFjQ_400x400.jpg"
        },
        team2: {
          code: "MD",
          name: "Mangaluru Dragons",
          flag: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmeqoGxwDzYUtusnrRKLTMvyjj4Ah8vzNixA&s"
        },
        image: "https://www.fancode.com/skillup-uploads/cms-media/132785_5530_GMY_MD_fc-Web.jpg",
        buttonColor: "red",
        sportIcon: "🏏",
        status: "live",
        streamUrl: "/api/stream/mumbai/132810_english_hls_da5a863a4485513ta-di_h264/index.m3u8"
      },
      {
        id: "Kalyani Bengaluru Blasters VS Mysore Warriors",
        tournament: "Maharaja T20 Trophy, 2025",
        sport: "cricket",
        team1: {
          code: "BB",
          name: "Kalyani Bengaluru Blasters",
          flag: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSB2ux3G0gGimrv_-CyIxI7vGsZMXfLZRMb-w&s"
        },
        team2: {
          code: "MW",
          name: "Mysore Warriors",
          flag: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrWtyJr9G17RymOfo2nfX47DhOGXz5m5tHOw&s"
        },
        image: "https://www.fancode.com/skillup-uploads/cms-media/132786_5530_BB_MW_fc-Web.jpg",
        buttonColor: "blue",
        sportIcon: "🏏",
        status: "upcoming",
        streamUrl: "/api/stream/hotstar/in-mc-pdlive/d2/cricket/ipl/mi-vs-csk/master.m3u8"
      },
      {
        id: "NA",
        tournament: "NA",
        sport: "Cricket",
        team1: {
          code: "NA",
          name: "NA",
          flag: "NA"
        },
        team2: {
          code: "NA",
          name: "NA",
          flag: "NA"
        },
        image: "NA",
        buttonColor: "purple",
        sportIcon: "🤼",
        status: "upcoming",
        streamUrl: "NA"
      }
    ];
  }

  private static transformGithubData(data: any): FancodeMatch[] {
    if (!data || !Array.isArray(data.matches)) {
      return this.getFallbackMatches();
    }

    return data.matches.map((match: any) => ({
      id: match.match_id?.toString() || `match-${Date.now()}`,
      tournament: match.event_name || 'Live Match',
      sport: match.event_category?.toLowerCase() || 'cricket',
      team1: {
        code: match.team_1?.substring(0, 3).toUpperCase() || 'T1',
        name: match.team_1 || 'Team 1',
        flag: this.getTeamFlag(match.team_1)
      },
      team2: {
        code: match.team_2?.substring(0, 3).toUpperCase() || 'T2',
        name: match.team_2 || 'Team 2',
        flag: this.getTeamFlag(match.team_2)
      },
      image: match.src || '',
      buttonColor: this.getRandomButtonColor(),
      sportIcon: this.getSportIcon(match.event_category),
      status: this.mapGithubStatus(match.status),
      streamUrl: match.adfree_url || match.dai_url || undefined
    }));
  }

  private static getTeamFlag(teamName: string): string {
    // Import the centralized team logo mapping
    const { getTeamLogo } = require('../data/team-logos');
    return getTeamLogo(teamName);
  }

  private static mapGithubStatus(status: string): 'live' | 'upcoming' | 'completed' {
    if (!status) return 'upcoming';
    
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('live')) return 'live';
    if (lowerStatus.includes('completed') || lowerStatus.includes('finished')) return 'completed';
    return 'upcoming';
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
      // First get the match data which contains the stream URL
      const match = await this.getMatchById(matchId);
      
      if (match && match.streamUrl) {
        // If it's already a proxied URL, return it directly
        if (match.streamUrl.startsWith('/api/stream/')) {
          return match.streamUrl;
        }
        
        // If it's a direct URL, proxy it through our API
        if (match.streamUrl.startsWith('http')) {
          const urlObj = new URL(match.streamUrl);
          // Handle fdlive fancode URLs specially
          if (urlObj.hostname === 'in-mc-fdlive.fancode.com') {
            return `/api/stream/fancode/fdlive${urlObj.pathname}`;
          }
          // Handle other fancode URLs
          if (urlObj.hostname.includes('fancode.com')) {
            return `/api/stream/fancode${urlObj.pathname}`;
          }
          // Handle other hosts
          return `/api/stream/${urlObj.host}${urlObj.pathname}`;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching stream URL:', error);
      return null;
    }
  }

  static async getMatchById(matchId: string): Promise<FancodeMatch | undefined> {
    // First try to fetch live matches from API
    const liveMatches = await this.fetchLiveMatches();
    const match = liveMatches.find(match => match.id === matchId || match.id === parseInt(matchId).toString());
    
    if (match) {
      return match;
    }
    
    // Fallback to local matches if not found in live data
    const fallbackMatches = this.getFallbackMatches();
    return fallbackMatches.find(match => match.id === matchId);
  }
}
