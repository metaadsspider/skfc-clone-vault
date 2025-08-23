private static async fetchLiveMatches(): Promise<FancodeMatch[]> {
  try {
    // Step 1: Try FanCode External Proxy
    const res1 = await fetch("/api/fancode-external?i=1");
    if (res1.ok) {
      return await res1.json();
    }
  } catch (err) {
    console.warn("External FanCode fetch failed", err);
  }

  try {
    // Step 2: Try Backup FanCode API
    const res2 = await fetch(`${this.FANCODE_API_BASE}/live-matches`);
    if (res2.ok) {
      return await res2.json();
    }
  } catch (err) {
    console.warn("Backup FanCode API fetch failed", err);
  }

  try {
    // 🔥 Step 3: Try GitHub JSON file
    const githubRes = await fetch(
      "https://raw.githubusercontent.com/drmlive/fancode-live-events/refs/heads/main/fancode.json"
    );
    if (githubRes.ok) {
      const githubMatches = await githubRes.json();

      // 🔄 Map GitHub JSON → FancodeMatch format
      return githubMatches.map((m: any) => {
        return {
          id: m.id || `${m.team1?.code}_vs_${m.team2?.code}`,
          tournament: m.tournament || "Unknown Tournament",
          sport: m.sport || "cricket",
          team1: {
            code: m.team1?.code || "T1",
            name: m.team1?.name || "Team 1",
            flag: m.team1?.flag || "https://via.placeholder.com/40"
          },
          team2: {
            code: m.team2?.code || "T2",
            name: m.team2?.name || "Team 2",
            flag: m.team2?.flag || "https://via.placeholder.com/40"
          },
          image: m.image || "https://via.placeholder.com/600x300",
          buttonColor: (m.buttonColor as "red" | "purple" | "green" | "blue") || "red",
          sportIcon: m.sportIcon || "🏏",
          status: (m.status as "live" | "upcoming" | "completed") || "upcoming",
          streamUrl: m.streamUrl || ""
        } as FancodeMatch;
      });
    }
  } catch (err) {
    console.warn("GitHub JSON fetch failed", err);
  }

  // Step 4: Final Fallback - Hardcoded Matches
  return this.getFallbackMatches();
}
