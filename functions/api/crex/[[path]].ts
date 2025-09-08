interface Env {
  [key: string]: any;
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request } = context;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const endpoint = pathSegments[pathSegments.length - 1];

    if (endpoint === 'scoreboard') {
      return handleScoreboard(corsHeaders);
    } else if (endpoint === 'schedule') {
      const days = parseInt(url.searchParams.get('days') || '7');
      return handleSchedule(days, corsHeaders);
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Crex API Error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

async function handleScoreboard(corsHeaders: Record<string, string>): Promise<Response> {
  try {
    // In production, this would scrape from crex.com
    // For now, returning structured mock data
    const scoreboardData = {
      matches: [
        {
          id: 'live-1',
          tournament: 'Big Bash League 2025',
          sport: 'Cricket',
          team1: {
            name: 'Sydney Sixers',
            code: 'SIX',
            flag: '🇦🇺',
            score: '156/4',
            overs: '17.3'
          },
          team2: {
            name: 'Melbourne Stars',
            code: 'STA',
            flag: '🇦🇺',
            score: '140/7',
            overs: '20.0'
          },
          status: 'live',
          venue: 'Sydney Cricket Ground',
          matchFormat: 'T20',
          tossInfo: 'Sixers won the toss and chose to bowl',
          lastUpdate: new Date().toISOString()
        },
        {
          id: 'comp-1',
          tournament: 'Indian Premier League 2025',
          sport: 'Cricket',
          team1: {
            name: 'Mumbai Indians',
            code: 'MI',
            flag: '🇮🇳',
            score: '195/6',
            overs: '20.0'
          },
          team2: {
            name: 'Chennai Super Kings',
            code: 'CSK',
            flag: '🇮🇳',
            score: '188/9',
            overs: '20.0'
          },
          status: 'completed',
          result: 'Mumbai Indians won by 7 runs',
          venue: 'Wankhede Stadium, Mumbai',
          matchFormat: 'T20',
          tossInfo: 'CSK won the toss and chose to bowl',
          playerOfMatch: 'Rohit Sharma',
          lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ]
    };

    return new Response(JSON.stringify(scoreboardData), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Error in handleScoreboard:', error);
    throw error;
  }
}

async function handleSchedule(days: number, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const now = new Date();
    const scheduleData = {
      schedule: [
        {
          id: 'sch-1',
          tournament: 'Indian Premier League 2025',
          team1: { name: 'Royal Challengers Bangalore', code: 'RCB', flag: '🇮🇳' },
          team2: { name: 'Delhi Capitals', code: 'DC', flag: '🇮🇳' },
          dateTime: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
          venue: 'M. Chinnaswamy Stadium, Bangalore',
          matchFormat: 'T20',
          status: 'upcoming' as const
        },
        {
          id: 'sch-2',
          tournament: 'Big Bash League 2025',
          team1: { name: 'Perth Scorchers', code: 'SCO', flag: '🇦🇺' },
          team2: { name: 'Adelaide Strikers', code: 'STR', flag: '🇦🇺' },
          dateTime: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
          venue: 'Perth Stadium',
          matchFormat: 'T20',
          status: 'upcoming' as const
        },
        {
          id: 'sch-3',
          tournament: 'Pakistan Super League 2025',
          team1: { name: 'Karachi Kings', code: 'KK', flag: '🇵🇰' },
          team2: { name: 'Lahore Qalandars', code: 'LQ', flag: '🇵🇰' },
          dateTime: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(), // 2 days from now
          venue: 'National Stadium, Karachi',
          matchFormat: 'T20',
          status: 'upcoming' as const
        }
      ]
    };

    return new Response(JSON.stringify(scheduleData), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Error in handleSchedule:', error);
    throw error;
  }
}