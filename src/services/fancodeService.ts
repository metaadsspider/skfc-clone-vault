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
  
  // Today's live matches from FanCode
  private static mockLiveMatches: FancodeMatch[] = [
    {
      id: "zimbabwe-vs-new-zealand",
      tournament: "New Zealand tour of Zimbabwe, 2025",
      sport: "cricket",
      team1: {
        code: "ZIM",
        name: "Zimbabwe",
        flag: "https://d13ir53smqqeyp.cloudfront.net/flags/cr-flags/FC-ZIM@2x.png"
      },
      team2: {
        code: "NZ",
        name: "New Zealand",
        flag: "https://d13ir53smqqeyp.cloudfront.net/flags/cr-flags/FC-NZC@2x.png"
      },
      image: "https://www.fancode.com/skillup-uploads/cms-media/New-Zealand-Tour-of-Zimbabwe-(Tests)Sporty-match-card-.jpg",
      buttonColor: "red",
      sportIcon: "🏏",
      status: "live",
      streamUrl: "/api/stream/mumbai/128760_english_hls_67071ta-di_h264/index.m3u8"
    },
    {
      id: "team-k-league-vs-newcastle-united",
      tournament: "Club Friendlies 2025",
      sport: "football",
      team1: {
        code: "TKL",
        name: "Team K League",
        flag: "https://d13ir53smqqeyp.cloudfront.net/flags/ft-flags/FC-TKL@2x.png"
      },
      team2: {
        code: "NEW",
        name: "Newcastle United",
        flag: "https://d13ir53smqqeyp.cloudfront.net/flags/ft-flags/FC-NEW@2x.png"
      },
      image: "https://www.fancode.com/skillup-uploads/cms-media/Team-K-League-vs-Newcastle-United_Sporty.jpg",
      buttonColor: "blue",
      sportIcon: "⚽",
      status: "live",
      streamUrl: "/api/stream/mumbai/131253_english_hls_65758ta-di_h264/index.m3u8"
    },
    {
      id: "speen-ghar-tigers-vs-boost-defenders",
      tournament: "Shpageeza Cricket League, 2025",
      sport: "cricket",
      team1: {
        code: "SG",
        name: "Speen Ghar Tigers",
        flag: "https://d13ir53smqqeyp.cloudfront.net/flags/cr-flags/FC-ST@2x.png"
      },
      team2: {
        code: "BOS",
        name: "Boost Defenders",
        flag: "https://d13ir53smqqeyp.cloudfront.net/flags/cr-flags/FC-BOD@2x.png"
      },
      image: "https://www.fancode.com/skillup-uploads/cms-media/130808_5425_SG_BOS_fc-App.jpg",
      buttonColor: "purple",
      sportIcon: "🏏",
      status: "live",
      streamUrl: "/api/stream/mumbai/130808_english_hls_72161ta-di_h264/index.m3u8"
    },
    {
      id: "twickenham-vs-spencer",
      tournament: "ECS England, Wimbledon, 2025",
      sport: "cricket",
      team1: {
        code: "TWI",
        name: "Twickenham",
        flag: "https://d13ir53smqqeyp.cloudfront.net/flags/cr-flags/DEF-CR8@2x.png"
      },
      team2: {
        code: "SPE",
        name: "Spencer",
        flag: "https://d13ir53smqqeyp.cloudfront.net/flags/cr-flags/DEF-CR6@2x.png"
      },
      image: "https://www.fancode.com/skillup-uploads/cms-media/ECS-England,-Wimbledon,-2025-old-match-card-op-2.jpg",
      buttonColor: "green",
      sportIcon: "🏏",
      status: "live",
      streamUrl: "/api/stream/mumbai/132038_english_hls_55648ta-di_h264/index.m3u8"
    },
    {
      id: "india-vs-england-5th-test",
      tournament: "India vs England 5th Test Match",
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
      streamUrl: "/api/stream/mumbai/130796_english_hls_98010ta-di_h264/1080p.m3u8"
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