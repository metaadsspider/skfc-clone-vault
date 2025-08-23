import type { Match } from "./match";

// Fetch matches dynamically from FanCode JSON
export async function fetchMatches(): Promise<Match[]> {
  try {
    const response = await fetch("https://raw.githubusercontent.com/drmlive/fancode-live-events/refs/heads/main/fancode.json");
    const data = await response.json();

    return data.map((m: any) => ({
      id: m.match_id,
      tournament: m.event_category,
      sport: "cricket",
      team1: {
        code: m.team_code1,
        name: m.team_1,
        flag: m.team_img1,
      },
      team2: {
        code: m.team_code2,
        name: m.team_2,
        flag: m.team_img2,
      },
      image: m.src,
      buttonColor: "red", // or map dynamically if JSON provides
      sportIcon: "🏏",
      status: m.status === "Live" ? "live" : "upcoming",
      streamUrl: m.adfree_url,
    }));
  } catch (err) {
    console.error("Error fetching matches:", err);
    return [];
  }
}
