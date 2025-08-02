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
  
  // Live match from Hotstar
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
      streamUrl: "https://live12p.hotstar.com/hls/live/2027118/inallow-engvsind5test-2025/hin/1540044677/15mindvrm014e7647051a2a4f13bc1b7f72b763263c02august2025/master_ap_1080_5.m3u8"
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