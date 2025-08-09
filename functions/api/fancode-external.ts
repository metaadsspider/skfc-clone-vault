export async function onRequest(context: any) {
  const { request } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Expose-Headers': '*',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Content-Type': 'application/json',
  } as const;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(request.url);
    const i = url.searchParams.get('i') || '1';

    const targetUrl = `https://shwe7ank-fc.free.nf/Fancode/?i=${encodeURIComponent(i)}`;

    const upstream = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://shwe7ank-fc.free.nf/',
      },
    });

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: `Upstream error ${upstream.status}` }),
        { status: 502, headers: corsHeaders },
      );
    }

    const html = await upstream.text();

    // Very lightweight HTML parsing to extract match cards
    const matches: any[] = [];
    const cards = html.split('<div class="match-card">').slice(1);

    for (const raw of cards) {
      const imgMatch = raw.match(/<img[^>]+src="([^"]+)"/i);
      const titleMatch = raw.match(/<div class="match-title">([^<]+)<\/div>/i);
      const subtitleMatch = raw.match(/<div class="match-subtitle">([^<]+)<\/div>/i);

      const image = (imgMatch?.[1] || '').trim();
      const title = (titleMatch?.[1] || 'Live Match').trim();
      const sport = (subtitleMatch?.[1] || 'Cricket').trim();

      // Parse title: "Team A vs Team B (Tournament)"
      const titleParts = title.match(/^(.*?)(?:\s*\((.*)\))?$/);
      const main = (titleParts?.[1] || title).trim();
      const tournamentName = (titleParts?.[2] || '').trim();

      let team1Name = 'Team 1';
      let team2Name = 'Team 2';

      const vsSplit = main.split(/\s+vs\s+|\s+VS\s+|\s+Vs\s+/);
      if (vsSplit.length >= 2) {
        team1Name = vsSplit[0].trim();
        team2Name = vsSplit.slice(1).join(' vs ').trim();
      } else {
        team1Name = main;
        team2Name = 'TBD';
      }

      const makeCode = (name: string) =>
        name
          .split(/\s+/)
          .map((w) => w.charAt(0))
          .join('')
          .slice(0, 3)
          .toUpperCase() || 'T1';

      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      matches.push({
        id: id || `match-${Date.now()}-${matches.length}`,
        tournament: { name: tournamentName || title },
        sport,
        team1: { code: makeCode(team1Name), name: team1Name, logo: '' },
        team2: { code: makeCode(team2Name), name: team2Name, logo: '' },
        image,
        status: 'live',
        streamUrl: undefined,
      });
    }

    return new Response(JSON.stringify({ matches }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('External FanCode proxy error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch external FanCode feed' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
