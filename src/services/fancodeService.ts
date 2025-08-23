private static async getMatches(): Promise<FancodeMatch[]> {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/drmlive/fancode-live-events/main/fancode.json",
      { cache: "no-store" }
    );

    if (!response.ok) {
      console.warn("⚠️ Failed to fetch remote JSON, returning fallback matches");
      return this.getFallbackMatches(); // keep fallback as backup
    }

    const data = await response.json();

    // map JSON → FancodeMatch model
    return data.map((m: any) => ({
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
  } catch (err) {
    console.error("❌ Error fetching matches JSON:", err);
    return this.getFallbackMatches();
  }
}
