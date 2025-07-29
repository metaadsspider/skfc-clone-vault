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
  
  // Live matches with real stream URLs
  private static mockLiveMatches: FancodeMatch[] = [
    {
      id: "pakistan-champions-vs-australia-champions",
      tournament: "World Championship of Legends, 2025",
      sport: "cricket",
      team1: {
        code: "PAK-C",
        name: "Pakistan Champions",
        flag: "https://images.dream11.com/eyJrZXkiOiJmbGFncy9jci1mbGFncy9GQy1QQUtAMngucG5nIiwiZWRpdHMiOnsicmVzaXplIjp7ImZpdCI6ImNvdmVyIiwid2lkdGgiOjMyLCJoZWlnaHQiOjMyfSwid2VicCI6eyJxdWFsaXR5Ijo2MCwibG9zc2xlc3MiOmZhbHNlfX0sIm91dHB1dEZvcm1hdCI6IndlYnAifQ=="
      },
      team2: {
        code: "AUS-C",
        name: "Australia Champions",
        flag: "https://images.dream11.com/eyJrZXkiOiJmbGFncy9jci1mbGFncy9GQy1BVVNAMngucG5nIiwiZWRpdHMiOnsicmVzaXplIjp7ImZpdCI6ImNvdmVyIiwid2lkdGgiOjMyLCJoZWlnaHQiOjMyfSwid2VicCI6eyJxdWFsaXR5Ijo2MCwibG9zc2xlc3MiOmZhbHNlfX0sIm91dHB1dEZvcm1hdCI6IndlYnAifQ=="
      },
      image: "https://images.fancode.com/skillup-uploads/cms-media/World-Championship-of-Legends-2025_match-card.jpg",
      buttonColor: "purple",
      sportIcon: "🏏",
      status: "live",
      streamUrl: "https://in-mc-fdlive.fancode.com/mumbai/129731_english_hls_98010ta-di_h264/1080p.m3u8"
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