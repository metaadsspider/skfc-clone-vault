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
  private static readonly FANCODE_BASE_URL = 'https://fancode.com';
  
  // Live matches for Indian audience
  private static mockLiveMatches: FancodeMatch[] = [
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
      id: "india-vs-australia-odi",
      tournament: "India vs Australia ODI Series - Match 3",
      sport: "cricket",
      team1: {
        code: "IND",
        name: "India",
        flag: "https://d13ir53smqqeyp.cloudfront.net/flags/cr-flags/FC-IND@2x.png"
      },
      team2: {
        code: "AUS",
        name: "Australia",
        flag: "https://d13ir53smqqeyp.cloudfront.net/flags/cr-flags/FC-AUS@2x.png"
      },
      image: "https://img.hotstar.com/image/upload/f_auto,q_90,w_1920/sources/r1/cms/prod/5432/1753874075432-i",
      buttonColor: "green",
      sportIcon: "🏏",
      status: "upcoming",
      streamUrl: "/api/stream/hotstar/in-mc-pdlive/d3/cricket/odi/ind-vs-aus/master.m3u8"
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

  static async fetchLiveMatches(): Promise<FancodeMatch[]> {
    // In a real implementation, this would make actual API calls to FanCode
    // For now, we return mock data that simulates live FanCode matches
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter to show only live and upcoming matches
      const activeMatches = this.mockLiveMatches.filter(
        match => match.status === 'live' || match.status === 'upcoming'
      );
      
      return activeMatches;
    } catch (error) {
      console.error('Error fetching matches from FanCode:', error);
      return [];
    }
  }

  static async fetchMatchStreamUrl(matchId: string): Promise<string | null> {
    const match = this.mockLiveMatches.find(m => m.id === matchId);
    return match?.streamUrl || null;
  }

  static getMatchById(matchId: string): FancodeMatch | undefined {
    return this.mockLiveMatches.find(match => match.id === matchId);
  }
}