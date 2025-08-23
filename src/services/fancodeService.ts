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
  startTime?: string; // ⬅ added for countdown
}

export class FancodeService {
  private static readonly FANCODE_API_BASE = '/api/fancode';
  private static readonly CUSTOM_JSON_URL = 'https://raw.githubusercontent.com/drmlive/fancode-live-events/refs/heads/main/fancode.json'; // ⬅ your JSON

  static async fetchLiveMatches(): Promise<FancodeMatch[]> {
    try {
      // 🔥 1. First try your custom GitHub JSON
      const customResp = await fetch(this.CUSTOM_JSON_URL);
      if (customResp.ok) {
        const customData = await customResp.json();
        if (Array.isArray(customData)) {
          const transformed = this.transformCustomJson(customData);
          if (transformed.length) return transformed;
        }
      }

      // 🔥 2. Then try external FanCode feed
      const response = await fetch(`/api/fancode-external?i=1`);

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          try {
            const data = await response.json();
            const transformed = this.transformFancodeData(data);
            if (Array.isArray(transformed) && transformed.length) {
              return transformed;
            }
          } catch (e) {
            console.warn('External FanCode feed returned invalid JSON');
          }
        }
      }

      // 🔥 3. Fallback to official FanCode proxy
      const fallbackResp = await fetch(`${this.FANCODE_API_BASE}/live-matches`);
      if (fallbackResp.ok) {
        const contentType = fallbackResp.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          try {
            const fallbackData = await fallbackResp.json();
            const transformed = this.transformFancodeData(fallbackData);
            if (Array.isArray(transformed) && transformed.length) {
              return transformed;
            }
          } catch (e) {
            console.warn('FanCode API proxy returned invalid JSON');
          }
        }
      }

      // 🔥 4. Final fallback: static data
      return this.getFallbackMatches();
    } catch (error) {
      console.error('Error fetching matches from FanCode:', error);
      return this.getFallbackMatches();
    }
  }

  // ⬅ NEW: Transform your GitHub JSON format to FancodeMatch[]
  private static transformCustomJson(data: any[]): FancodeMatch[] {
    return data.map((match: any) => ({
      id: String(match.match_id || match.id || `match-${Date.now()}`),
      tournament: match.event_name || match.tournament || "Unknown Tournament",
      sport: match.event_category?.toLowerCase() || "cricket",
      team1: {
        code: match.team_1?.substring(0, 3).toUpperCase() || "T1",
        name: match.team_1 || "Team 1",
        flag: "" // no flag in your JSON
      },
      team2: {
        code: match.team_2?.substring(0, 3).toUpperCase() || "T2",
        name: match.team_2 || "Team 2",
        flag: ""
      },
      image: match.src || "",
      buttonColor: this.getRandomButtonColor(),
      sportIcon: this.getSportIcon(match.event_category),
      status: this.mapMatchStatus(match.status),
      streamUrl: match.adfree_url || match.dai_url || undefined,
      startTime: match.startTime // ⬅ used for countdown
    }));
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
        streamUrl: "/api/stream/mumbai/132785_english_hls_16220ta-di_h264/index.m3u8"
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
      streamUrl: (() => {
        const u = match.streamUrl;
        if (!u) return undefined;
        try {
          const s = String(u);
          if (s.startsWith('http')) {
            const urlObj = new URL(s);
            return `/api/stream/${urlObj.pathname.replace(/^\//, '')}`;
          }
          return `/api/stream/${s.replace(/^\//, '')}`;
        } catch {
          return undefined;
        }
      })()
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
      motogp: '🏍️'
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
      const s = String(data.streamUrl || '');
      if (!s) return null;
      try {
        if (s.startsWith('http')) {
          const urlObj = new URL(s);
          return `/api/stream/${urlObj.pathname.replace(/^\//, '')}`;
        }
        return `/api/stream/${s.replace(/^\//, '')}`;
      } catch {
        return null;
      }
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
