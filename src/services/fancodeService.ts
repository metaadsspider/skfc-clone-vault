import { Match } from "../models/match";

export default class FancodeService {
  private static FAN_CODE_URL =
    "https://raw.githubusercontent.com/drmlive/fancode-live-events/refs/heads/main/fancode.json";

  // Main fetch function
  public static async fetchMatches(): Promise<Match[]> {
    try {
      const response = await fetch(this.FAN_CODE_URL);
      if (!response.ok) throw new Error("Network error");

      const data = await response.json();

      // Map JSON → Match[]
      return data.map((item: any): Match => ({
        id: item.id || `${item.team1?.code}-vs-${item.team2?.code}`,
        tournament: item.tournament || "Unknown Tournament",
        sport: item.sport || "cricket",
        team1: {
          code: item.team1?.code || "T1",
          name: item.team1?.name || "Team 1",
          flag: item.team1?.flag || "",
        },
        team2: {
          code: item.team2?.code || "T2",
          name: item.team2?.name || "Team 2",
          flag: item.team2?.flag || "",
        },
        image: item.image || "",
        buttonColor: item.buttonColor || "red",
        sportIcon: item.sportIcon || "🏏",
        status: item.status || "upcoming",
        streamUrl: item.streamUrl || "",
      }));
    } catch (error) {
      console.error("Failed to fetch from FanCode JSON, using fallback:", error);
      return this.getFallbackMatches();
    }
  }

  // Fallback matches
  private static getFallbackMatches(): Match[] {
    return [
      {
        id: "Gulbarga Mystics VS Mangaluru Dragons",
        tournament: "Maharaja T20 Trophy, 2025",
        sport: "cricket",
        team1: {
          code: "GMY",
          name: "Gulbarga Mystics",
          flag: "https://pbs.twimg.com/profile_images/1552595996219408385/YQzPKFjQ_400x400.jpg",
        },
        team2: {
          code: "MD",
          name: "Mangaluru Dragons",
          flag: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmeqoGxwDzYUtusnrRKLTMvyjj4Ah8vzNixA&s",
        },
        image:
          "https://www.fancode.com/skillup-uploads/cms-media/132785_5530_GMY_MD_fc-Web.jpg",
        buttonColor: "red",
        sportIcon: "🏏",
        status: "live",
        streamUrl:
          "/api/stream/mumbai/132785_english_hls_16220ta-di_h264/index.m3u8",
      },
      {
        id: "Kalyani Bengaluru Blasters VS Mysore Warriors",
        tournament: "Maharaja T20 Trophy, 2025",
        sport: "cricket",
        team1: {
          code: "BB",
          name: "Kalyani Bengaluru Blasters",
          flag: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSB2ux3G0gGimrv_-CyIxI7vGsZMXfLZRMb-w&s",
        },
        team2: {
          code: "MW",
          name: "Mysore Warriors",
          flag: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrWtyJr9G17RymOfo2nfX47DhOGXz5m5tHOw&s",
        },
        image:
          "https://www.fancode.com/skillup-uploads/cms-media/132786_5530_BB_MW_fc-Web.jpg",
        buttonColor: "blue",
        sportIcon: "🏏",
        status: "upcoming",
        streamUrl:
          "/api/stream/hotstar/in-mc-pdlive/d2/cricket/ipl/mi-vs-csk/master.m3u8",
      },
    ];
  }
}
