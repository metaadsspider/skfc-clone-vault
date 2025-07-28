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
  
  // Mock data based on FanCode structure - In a real implementation, you'd scrape or use their API
  private static mockLiveMatches: FancodeMatch[] = [
    {
      id: "zimbabwe-women-vs-ireland-women-128766",
      tournament: "Zimbabwe Women tour of Ireland, 2025",
      sport: "cricket",
      team1: {
        code: "ZIM-W",
        name: "Zimbabwe Women",
        flag: "https://images.dream11.com/eyJrZXkiOiJmbGFncy9jci1mbGFncy9GQy1aSU1AMngucG5nIiwiZWRpdHMiOnsicmVzaXplIjp7ImZpdCI6ImNvdmVyIiwid2lkdGgiOjMyLCJoZWlnaHQiOjMyfSwid2VicCI6eyJxdWFsaXR5Ijo2MCwibG9zc2xlc3MiOmZhbHNlfX0sIm91dHB1dEZvcm1hdCI6IndlYnAifQ=="
      },
      team2: {
        code: "IRE-W",
        name: "Ireland Women",
        flag: "https://images.dream11.com/eyJrZXkiOiJmbGFncy9jci1mbGFncy9GQy1JUkVAMngucG5nIiwiZWRpdHMiOnsicmVzaXplIjp7ImZpdCI6ImNvdmVyIiwid2lkdGgiOjMyLCJoZWlnaHQiOjMyfSwid2VicCI6eyJxdWFsaXR5Ijo2MCwibG9zc2xlc3MiOmZhbHNlfX0sIm91dHB1dEZvcm1hdCI6IndlYnAifQ=="
      },
      image: "https://images.fancode.com/skillup-uploads/cms-media/Zimbabwe-Women's-tour-of-Ireland-old-match-card.png",
      buttonColor: "red",
      sportIcon: "🏏",
      status: "live",
      streamUrl: "https://fancode.com/cricket/tour/zimbabwe-women-tour-of-ireland-2025-18690063/matches/zimbabwe-women-vs-ireland-women-128766/live-match-info"
    },
    {
      id: "speen-ghar-vs-mis-e-ainak-130803",
      tournament: "Shpageeza Cricket League, 2025",
      sport: "cricket",
      team1: {
        code: "SG",
        name: "Speen Ghar Tigers",
        flag: "https://d13ir53smqqeyp.cloudfront.net/flags/cr-flags/FC-ST@2x.png"
      },
      team2: {
        code: "MAK",
        name: "Mis-e-Ainak Knights",
        flag: "https://d13ir53smqqeyp.cloudfront.net/flags/cr-flags/FC-MAK@2x.png"
      },
      image: "https://images.fancode.com/skillup-uploads/cms-media/130803_5425_SG_MAK_fc-Web.jpg",
      buttonColor: "green",
      sportIcon: "🏏",
      status: "live"
    },
    {
      id: "west-indies-vs-australia-live",
      tournament: "Australia Tour of West Indies, 2025",
      sport: "cricket",
      team1: {
        code: "WI",
        name: "West Indies",
        flag: "https://images.dream11.com/eyJrZXkiOiJmbGFncy9jci1mbGFncy9GQy1XSUAyeC5wbmciLCJlZGl0cyI6eyJyZXNpemUiOnsiZml0IjoiY292ZXIiLCJ3aWR0aCI6MzIsImhlaWdodCI6MzJ9LCJ3ZWJwIjp7InF1YWxpdHkiOjYwLCJsb3NzbGVzcyI6ZmFsc2V9fSwib3V0cHV0Rm9ybWF0Ijoid2VicCJ9"
      },
      team2: {
        code: "AUS",
        name: "Australia",
        flag: "https://images.dream11.com/eyJrZXkiOiJmbGFncy9jci1mbGFncy9GQy1BVVNAMngucG5nIiwiZWRpdHMiOnsicmVzaXplIjp7ImZpdCI6ImNvdmVyIiwid2lkdGgiOjMyLCJoZWlnaHQiOjMyfSwid2VicCI6eyJxdWFsaXR5Ijo2MCwibG9zc2xlc3MiOmZhbHNlfX0sIm91dHB1dEZvcm1hdCI6IndlYnAifQ=="
      },
      image: "https://images.fancode.com/skillup-uploads/cms-media/Australia-Tour-of-West-Indies-2025_match-card.jpg",
      buttonColor: "blue",
      sportIcon: "🏏",
      status: "upcoming"
    },
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
      status: "live"
    },
    {
      id: "barcelona-vs-real-madrid-champions",
      tournament: "UEFA Champions League",
      sport: "football",
      team1: {
        code: "BAR",
        name: "Barcelona",
        flag: "https://d13ir53smqqeyp.cloudfront.net/flags/fb-flags/FC-BAR@2x.png"
      },
      team2: {
        code: "RMA",
        name: "Real Madrid",
        flag: "https://d13ir53smqqeyp.cloudfront.net/flags/fb-flags/FC-RMA@2x.png"
      },
      image: "https://images.fancode.com/skillup-uploads/cms-media/UEFA-Champions-League_match-card.jpg",
      buttonColor: "blue",
      sportIcon: "⚽",
      status: "upcoming"
    },
    {
      id: "f1-british-gp-2025",
      tournament: "Formula 1 British Grand Prix 2025",
      sport: "formula1",
      team1: {
        code: "F1",
        name: "Formula 1",
        flag: "https://d13ir53smqqeyp.cloudfront.net/flags/gl-flags/FC-F1@2x.png"
      },
      team2: {
        code: "UK",
        name: "Silverstone",
        flag: "https://d13ir53smqqeyp.cloudfront.net/flags/gl-flags/FC-UK@2x.png"
      },
      image: "https://images.fancode.com/skillup-uploads/cms-media/F1-British-GP-2025_match-card.jpg",
      buttonColor: "red",
      sportIcon: "🏎️",
      status: "upcoming"
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
    // In a real implementation, this would extract the actual stream URL
    // For now, return a mock stream URL
    const match = this.mockLiveMatches.find(m => m.id === matchId);
    return match?.streamUrl || `${this.FANCODE_BASE_URL}/live/${matchId}`;
  }

  static getMatchById(matchId: string): FancodeMatch | undefined {
    return this.mockLiveMatches.find(match => match.id === matchId);
  }
}