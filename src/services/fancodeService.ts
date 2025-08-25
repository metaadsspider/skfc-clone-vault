export interface Match {
  id: string;
  title: string;
  date: string;
  time: string;
  status: string;
  link?: string; // m3u8 link if available
}

export async function getMatches(): Promise<Match[]> {
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/drmlive/fancode-live-events/refs/heads/main/fancode.json"
    );
    if (!res.ok) throw new Error("Failed to fetch matches");

    const data = await res.json();

    // Map JSON → Match interface
    return data.events.map((item: any) => ({
      id: item.matchId,
      title: `${item.teams[0]} vs ${item.teams[1]}`,
      date: item.date,
      time: item.time,
      status: item.status,
      link: item.m3u8, // stream link if provided
    }));
  } catch (err) {
    console.error("Error fetching fancode.json:", err);
    return [];
  }
}
