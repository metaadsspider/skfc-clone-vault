<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fancode Live Matches</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.production.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.24.0/babel.min.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body {
      font-family: 'Inter', sans-serif;
      background-color: #0f172a;
    }
  </style>
</head>
<body class="bg-slate-900 text-white min-h-screen p-8">
  <div id="root"></div>

  <script type="text/babel">
    const { useEffect, useState } = React;

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

    class FancodeService {
      private static readonly FANCODE_API_BASE = '/api/fancode';
      private static readonly REFRESH_INTERVAL_MS = 30000;
      private static listeners: ((matches: FancodeMatch[]) => void)[] = [];
      private static intervalId: number | null = null;
      private static cachedMatches: FancodeMatch[] = [];

      static subscribe(listener: (matches: FancodeMatch[]) => void): () => void {
        this.listeners.push(listener);
        if (this.cachedMatches.length > 0) {
          listener(this.cachedMatches);
        }
        if (this.intervalId === null) {
          this.startFetching();
        }
        return () => {
          this.listeners = this.listeners.filter(l => l !== listener);
          if (this.listeners.length === 0 && this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
          }
        };
      }

      private static startFetching() {
        this.fetchAndNotify();
        this.intervalId = window.setInterval(this.fetchAndNotify.bind(this), this.REFRESH_INTERVAL_MS);
      }

      private static async fetchAndNotify() {
        try {
          const matches = await this.fetchLiveMatches();
          this.cachedMatches = matches;
          this.listeners.forEach(listener => listener(matches));
        } catch (error) {
          console.error('Error during periodic fetch:', error);
        }
      }

      static async fetchLiveMatches(): Promise<FancodeMatch[]> {
        try {
          const response = await fetch(`/api/fancode-external?i=1`);
          if (response.ok) {
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              try {
                const data = await response.json();
                const transformed = this.transformFancodeData(data);
                if (Array.isArray(transformed) && transformed.length) {
                  return transformed;
                }
              } catch (e) {
                console.warn('External FanCode feed returned invalid JSON');
              }
            } else {
              console.warn('External FanCode feed returned non-JSON response');
            }
          } else {
            console.warn('External FanCode feed failed, status:', response.status);
          }

          const fallbackResp = await fetch(`${this.FANCODE_API_BASE}/live-matches`);
          if (fallbackResp.ok) {
            const contentType = fallbackResp.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              try {
                const fallbackData = await fallbackResp.json();
                const transformed = this.transformFancodeData(fallbackData);
                if (Array.isArray(transformed) && transformed.length) {
                  return transformed;
                }
              } catch (e) {
                console.warn('FanCode API proxy returned invalid JSON');
              }
            } else {
              console.warn('FanCode API proxy returned non-JSON response');
            }
          }

          console.warn('All API feeds failed, using local fallback data');
          return this.getFallbackMatches();
        } catch (error) {
          console.error('Error fetching matches:', error);
          return this.getFallbackMatches();
        }
      }

      private static getFallbackMatches(): FancodeMatch[] {
        return [
          {
            id: "Gulbarga Mystics VS Mangaluru Dragons",
            tournament: "Maharaja T20 Trophy, 2025",
            sport: "cricket",
            team1: {
              code: "GMY",
              name: "Gulbarga Mystics",
              flag: "https://pbs.twimg.com/profile_images/1552595996219408385/YQzPKFjQ_400x400.jpg"
            },
            team2: {
              code: "MD",
              name: "Mangaluru Dragons",
              flag: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmeqoGxwDzYUtusnrRKLTMvyjj4Ah8vzNixA&s"
            },
            image: "https://www.fancode.com/skillup-uploads/cms-media/132785_5530_GMY_MD_fc-Web.jpg",
            buttonColor: "red",
            sportIcon: "🏏",
            status: "live",
            streamUrl: "/api/stream/mumbai/132785_english_hls_16220ta-di_h264/index.m3u8"
          },
          {
            id: "Kalyani Bengaluru Blasters VS Mysore Warriors",
            tournament: "Maharaja T20 Trophy, 2025",
            sport: "cricket",
            team1: {
              code: "BB",
              name: "Kalyani Bengaluru Blasters",
              flag: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSB2ux3G0gGimrv_-CyIxI7vGsZMXfLZRMb-w&s"
            },
            team2: {
              code: "MW",
              name: "Mysore Warriors",
              flag: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrWtyJr9G17RymOfo2nfX47DhOGXz5m5tHOw&s"
            },
            image: "https://www.fancode.com/skillup-uploads/cms-media/132786_5530_BB_MW_fc-Web.jpg",
            buttonColor: "blue",
            sportIcon: "🏏",
            status: "upcoming",
            streamUrl: "/api/stream/hotstar/in-mc-pdlive/d2/cricket/ipl/mi-vs-csk/master.m3u8"
          },
          {
            id: "NA",
            tournament: "NA",
            sport: "Cricket",
            team1: {
              code: "NA",
              name: "NA",
              flag: "NA"
            },
            team2: {
              code: "NA",
              name: "NA",
              flag: "NA"
            },
            image: "NA",
            buttonColor: "purple",
            sportIcon: "🤼",
            status: "upcoming",
            streamUrl: "NA"
          }
        ];
      }

      private static transformFancodeData(data: any): FancodeMatch[] {
        if (!data || !Array.isArray(data.matches)) {
          return this.getFallbackMatches();
        }

        return data.matches.map((match: any) => ({
          id: match.id || `match-${Date.now()}`,
          tournament: match.tournament?.name || match.series?.name || 'Live Match',
          sport: match.sport?.toLowerCase() || 'cricket',
          team1: {
            code: match.team1?.code || match.team1?.shortName || 'T1',
            name: match.team1?.name || 'Team 1',
            flag: match.team1?.logo || match.team1?.flag || ''
          },
          team2: {
            code: match.team2?.code || match.team2?.shortName || 'T2',
            name: match.team2?.name || 'Team 2',
            flag: match.team2?.logo || match.team2?.flag || ''
          },
          image: match.image || match.banner || '',
          buttonColor: this.getRandomButtonColor(),
          sportIcon: this.getSportIcon(match.sport),
          status: this.mapMatchStatus(match.status),
          streamUrl: (() => {
            const u = match.streamUrl;
            if (!u) return undefined;
            try {
              const s = String(u);
              if (s.startsWith('http')) {
                const urlObj = new URL(s);
                return `/api/stream/${urlObj.pathname.replace(/^\//, '')}`;
              }
              return `/api/stream/${s.replace(/^\//, '')}`;
            } catch {
              return undefined;
            }
          })()
        }));
      }

      private static getRandomButtonColor(): 'red' | 'purple' | 'green' | 'blue' {
        const colors: ('red' | 'purple' | 'green' | 'blue')[] = ['red', 'purple', 'green', 'blue'];
        return colors[Math.floor(Math.random() * colors.length)];
      }

      private static getSportIcon(sport: string): string {
        const sportIcons: { [key: string]: string } = {
          cricket: '🏏',
          football: '⚽',
          kabaddi: '🤼',
          basketball: '🏀',
          tennis: '🎾',
          hockey: '🏑',
        };
        return sportIcons[sport?.toLowerCase()] || '🏏';
      }

      private static mapMatchStatus(status: string): 'live' | 'upcoming' | 'completed' {
        if (!status) return 'upcoming';
        const lowerStatus = status.toLowerCase();
        if (lowerStatus.includes('live') || lowerStatus.includes('playing')) return 'live';
        if (lowerStatus.includes('completed') || lowerStatus.includes('finished')) return 'completed';
        return 'upcoming';
      }

      static async fetchMatchStreamUrl(matchId: string): Promise<string | null> {
        try {
          const response = await fetch(`${this.FANCODE_API_BASE}/match/${matchId}/stream`);
          if (!response.ok) {
            const fallbackMatch = this.getFallbackMatches().find(m => m.id === matchId);
            return fallbackMatch?.streamUrl || null;
          }
          const data = await response.json();
          const s = String(data.streamUrl || '');
          if (!s) return null;
          try {
            if (s.startsWith('http')) {
              const urlObj = new URL(s);
              return `/api/stream/${urlObj.pathname.replace(/^\//, '')}`;
            }
            return `/api/stream/${s.replace(/^\//, '')}`;
          } catch {
            return null;
          }
        } catch (error) {
          const fallbackMatch = this.getFallbackMatches().find(m => m.id === matchId);
          return fallbackMatch?.streamUrl || null;
        }
      }

      static getMatchById(matchId: string): FancodeMatch | undefined {
        const fallbackMatches = this.getFallbackMatches();
        return fallbackMatches.find(match => match.id === matchId);
      }
    }

    const App = () => {
      const [liveMatches, setLiveMatches] = useState([]);
      const [loading, setLoading] = useState(true);

      const fallbackMatches = FancodeService.getFallbackMatches();
      const liveMatchesMessage = "This data is automatically fetched from the Fancode API every 30 seconds.";
      const fallbackMatchesMessage = "This is static, hardcoded fallback data used when the API is unavailable.";

      useEffect(() => {
        const unsubscribe = FancodeService.subscribe((newMatches) => {
          setLiveMatches(newMatches);
          setLoading(false);
        });

        return () => unsubscribe();
      }, []);

      const getMatchStatusColor = (status) => {
        switch (status) {
          case 'live': return 'bg-red-500 text-white';
          case 'upcoming': return 'bg-blue-500 text-white';
          case 'completed': return 'bg-gray-500 text-white';
          default: return 'bg-gray-500 text-white';
        }
      };

      const MatchCard = ({ match, isFallback = false }) => (
        <div class="relative bg-slate-800 rounded-xl p-4 shadow-xl border border-slate-700 flex flex-col items-center text-center">
          <img src={match.image} alt="Match thumbnail" class="w-full h-auto rounded-lg mb-3 shadow-md"/>
          <div class="flex items-center space-x-2 mb-2">
            <img src={match.team1.flag} alt={`${match.team1.name} flag`} class="w-8 h-8 rounded-full border-2 border-slate-600"/>
            <span class="text-xl font-bold">{match.team1.code}</span>
            <span class="text-gray-400 font-semibold">vs</span>
            <span class="text-xl font-bold">{match.team2.code}</span>
            <img src={match.team2.flag} alt={`${match.team2.name} flag`} class="w-8 h-8 rounded-full border-2 border-slate-600"/>
          </div>
          <h3 class="text-md font-semibold text-gray-200 mb-1">{match.tournament}</h3>
          <p class="text-sm text-gray-400 mb-2">{match.team1.name} vs {match.team2.name}</p>
          <div class={`absolute top-2 left-2 px-3 py-1 text-xs font-bold rounded-full ${getMatchStatusColor(match.status)}`}>
            {match.status.toUpperCase()}
          </div>
          {isFallback && (
            <p class="mt-2 text-xs text-yellow-400 bg-yellow-900/50 px-2 py-1 rounded-full">Fallback Data</p>
          )}
        </div>
      );

      return (
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-4xl font-bold text-center mb-12 text-blue-400">
            Fancode Live & Fallback Matches
          </h1>

          <div className="bg-slate-800 p-6 rounded-xl mb-8 shadow-inner">
            <h2 className="text-2xl font-semibold mb-4 text-blue-300">Live Matches</h2>
            <p className="text-slate-400 mb-4">{liveMatchesMessage}</p>
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                <p className="ml-4 text-lg text-blue-300">Fetching live data...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveMatches.map(match => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl shadow-inner">
            <h2 className="text-2xl font-semibold mb-4 text-yellow-400">Fallback Data</h2>
            <p className="text-slate-400 mb-4">{fallbackMatchesMessage}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {fallbackMatches.map(match => (
                <MatchCard key={match.id} match={match} isFallback={true} />
              ))}
            </div>
          </div>
        </div>
      );
    };

    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</body>
</html>
