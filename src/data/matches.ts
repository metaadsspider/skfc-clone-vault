import { matches as fallbackMatches, Match } from "./matches";

export async function fetchMatches(): Promise<Match[]> {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/drmlive/fancode-live-events/refs/heads/main/fancode.json"
    );

    if (!response.ok) {
      console.warn("Remote fetch failed, using fallback data");
      return fallbackMatches;
    }

    const data = await response.json();

    // Map JSON to Match[]
    const mapped: Match[] = data.map((m: any) => ({
      id: m.id,
      tournament: m.tournament,
      sport: m.sport,
      team1: {
        code: m.team1.code,
        name: m.team1.name,
        flag: m.team1.flag,
      },
      team2: {
        code: m.team2.code,
        name: m.team2.name,
        flag: m.team2.flag,
      },
      image: m.image,
      buttonColor: m.buttonColor || "blue",
      sportIcon: m.sportIcon || "🏏",
      status: m.status || "upcoming",
      streamUrl: m.streamUrl,
    }));

    return mapped;
  } catch (err) {
    console.error("Error fetching remote JSON:", err);
    return fallbackMatches; // fallback to matches.ts
  }
}
