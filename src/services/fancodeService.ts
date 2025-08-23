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
      return githubMatches;
    }
  } catch (err) {
    console.warn("GitHub JSON fetch failed", err);
  }

  // Step 4: Final Fallback - Hardcoded Matches
  return this.getFallbackMatches();
}
