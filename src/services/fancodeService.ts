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
  private static readonly REFRESH_INTERVAL_MS = 30000; // 30 seconds

  // A list of listeners to notify when new data is available
  private static listeners: ((matches: FancodeMatch[]) => void)[] = [];
  // A variable to hold the interval ID so we can clear it later
  private static intervalId: number | null = null;
  // Cache the last fetched data to serve new listeners immediately
  private static cachedMatches: FancodeMatch[] = [];

  /**
   * Subscribes a listener to receive match data updates every 30 seconds.
   * @param listener The function to call with the updated match list.
   * @returns A function to unsubscribe the listener.
   */
  static subscribe(listener: (matches: FancodeMatch[]) => void): () => void {
    // Add the listener
    this.listeners.push(listener);

    // Immediately call the listener with cached data if available
    if (this.cachedMatches.length > 0) {
      listener(this.cachedMatches);
    }

    // Start the interval if it's not already running
    if (this.intervalId === null) {
      this.startFetching();
    }

    // Return an unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
      // If no more listeners, stop the fetching interval
      if (this.listeners.length === 0 && this.intervalId !== null) {
        clearInterval(this.intervalId);
        this.intervalId = null;
        console.log('Stopped fetching live matches due to no active listeners.');
      }
    };
  }

  /**
   * Starts the automatic fetching process.
   * This is called internally when the first listener is subscribed.
   */
  private static startFetching() {
    console.log('Starting automatic fetching of live matches every 30 seconds.');
    // Fetch data immediately
    this.fetchAndNotify();
    // Set up the interval for subsequent fetches
    this.intervalId = window.setInterval(this.fetchAndNotify.bind(this), this.REFRESH_INTERVAL_MS);
  }

  /**
   * Fetches the data and notifies all active listeners.
   */
  private static async fetchAndNotify() {
    try {
      const matches = await this.fetchLiveMatches();
      // Cache the new data
      this.cachedMatches = matches;
      // Notify all listeners
      this.listeners.forEach(listener => listener(matches));
    } catch (error) {
      console.error('Error during periodic fetch:', error);
      // Optionally notify listeners of an error state or provide the last known data
    }
  }

  /**
   * Fetches live matches from the API with fallback logic.
   * @returns A promise that resolves to an array of FancodeMatch objects.
   */
  static async fetchLiveMatches(): Promise<FancodeMatch[]> {
    try {
      const response = await fetch(`/api/fancode-external?i=1`);

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          try {
            const data = await response.json();
            const transformed = this.transformFancodeData(data);
            if (Array.isArray(transformed) && transformed.length) {
              console.log('Successfully fetched matches from external feed.');
              return transformed;
            }
          } catch (e) {
            console.warn('External FanCode feed returned invalid JSON');
          }
        } else {
          console.warn('External FanCode feed returned non-JSON response');
        }
      } else {
        console.warn('External FanCode feed failed, status:', response.status);
      }

      const fallbackResp = await fetch(`${this.FANCODE_API_BASE}/live-matches`);
      if (fallbackResp.ok) {
        const contentType = fallbackResp.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          try {
            const fallbackData = await fallbackResp.json();
            const transformed = this.transformFancodeData(fallbackData);
            if (Array.isArray(transformed) && transformed.length) {
              console.log('Successfully fetched matches from FanCode API proxy.');
              return transformed;
            }
          } catch (e) {
            console.warn('FanCode API proxy returned invalid JSON');
          }
        } else {
          console.warn('FanCode API proxy returned non-JSON response');
        }
      }

      console.warn('All API feeds failed, using local fallback data');
      return this.getFallbackMatches();
    } catch (error) {
      console.error('Error fetching matches:', error);
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
