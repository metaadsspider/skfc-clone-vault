import { getTeamLogo } from '../data/team-logos';

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
      // Fetch from GitHub JSON feed with rich match data
      const response = await fetch('https://raw.githubusercontent.com/Jitendra-unatti/fancode/refs/heads/main/data/fancode.json');

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json') || contentType.includes('text/plain')) {
          try {
            const data = await response.json();
            console.log('Fetched data:', data);
            console.log('Matches array:', data.matches);
            console.log('Matches count:', data.matches?.length);
            
            const transformed = this.transformGithubData(data);
            console.log('Transformed matches:', transformed);
            console.log('Transformed count:', transformed.length);
            
            if (Array.isArray(transformed) && transformed.length > 0) {
              return transformed;
            } else {
              console.warn('No valid matches found in transformed data');
            }
          } catch (e) {
            console.error('Error parsing JSON or transforming data:', e);
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
        id: "136725",
        tournament: "Vitality Blast T20, 2025",
        sport: "cricket",
        team1: {
          code: "HAM",
          name: "Hampshire",
          flag: "https://d13ir53smqqeyp.cloudfront.net/flags/cr-flags/FC-HAMP@2x.png"
        },
        team2: {
          code: "DUR",
          name: "Durham",
          flag: "https://d13ir53smqqeyp.cloudfront.net/flags/cr-flags/FC-DURC@2x.png"
        },
        image: "https://www.fancode.com/skillup-uploads/cms-media/Durham_vs_Hampshire_old_match_card.jpg",
        buttonColor: "blue",
        sportIcon: "🏏",
        status: "live",
        streamUrl: "https://sonydaimenew.akamaized.net/hls/live/2022320/DAI16VB25/hdntl=exp=1757179927~acl=%2f*~id=d484272a-fa1b-42ac-b939-4dd904ee5487~data=hdntl,2022320,DAI16VB25,none~hmac=81561625df8a434c82f3bab7e92dec08c0ac0df0017ce5ec7e07c0d80dc4f85e/master_2000.m3u8?aka_me_session_id=AAAAAAAAAAAXcLxoAAAAAOowTkxQtj+T9FmqIJsnpIudAdC2wJlvlHhA+I%2fT04i+nq2EXinLyQFSkIYpBxk4aCz+6sr+DGf0&aka_media_format_type=hls&originpath=/linear/hls/pb/event/2wNKn5gLSaqxNWiqsz7-vQ/stream/07410240-a5fc-4e78-9728-3f1288aae1e7:SIN/variant/fa166247343a075b40f3e502af4dd961/bandwidth/2310816.m3u8"
      },
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

    return data.matches.map((match: any) => {
      const team1 = match.teams?.[0];
      const team2 = match.teams?.[1];
      
      // Prioritize adfree streams over DAI streams for better compatibility
      let streamUrl = match.adfree_stream || match.STREAMING_CDN?.fancode_cdn || match.STREAMING_CDN?.Primary_Playback_URL;
      
      // Only use DAI as fallback if no other streams available
      if (!streamUrl) {
        streamUrl = match.dai_stream || match.STREAMING_CDN?.dai_google_cdn;
      }
      
      return {
        id: match.match_id?.toString() || `match-${Date.now()}`,
        tournament: match.tournament || 'Live Match',
        sport: match.category?.toLowerCase() || 'cricket',
        team1: {
          code: team1?.shortName || team1?.name?.substring(0, 3).toUpperCase() || 'T1',
          name: team1?.name || 'Team 1',
          flag: team1?.flag?.src || this.getTeamFlag(team1?.name)
        },
        team2: {
          code: team2?.shortName || team2?.name?.substring(0, 3).toUpperCase() || 'T2',
          name: team2?.name || 'Team 2',
          flag: team2?.flag?.src || this.getTeamFlag(team2?.name)
        },
        image: match.image_cdn?.APP || match.image_cdn?.PLAYBACK || match.image || '',
        buttonColor: this.getRandomButtonColor(),
        sportIcon: this.getSportIcon(match.category),
        status: this.mapGithubStatus(match.status),
        streamUrl: streamUrl || undefined
      };
    });
  }

  private static getTeamFlag(teamName: string): string {
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
          // Handle Google DAI URLs specially
          if (urlObj.hostname === 'dai.google.com') {
            return `/api/stream/dai.google.com${urlObj.pathname}${urlObj.search || ''}`;
          }
          // Handle fdlive fancode URLs specially
          if (urlObj.hostname === 'in-mc-fdlive.fancode.com') {
            return `/api/stream/fancode/fdlive${urlObj.pathname}${urlObj.search || ''}`;
          }
          // Handle other fancode URLs
          if (urlObj.hostname.includes('fancode.com')) {
            return `/api/stream/fancode${urlObj.pathname}${urlObj.search || ''}`;
          }
          // Handle other hosts (Sony, Akamai, etc.) - construct proper proxy URL
          const pathAndQuery = urlObj.pathname + (urlObj.search || '');
          return `/api/stream/${urlObj.hostname}${pathAndQuery}`;
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
