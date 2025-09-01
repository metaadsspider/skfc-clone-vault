import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { VideoPlayer } from "@/components/VideoPlayer";
import { FancodeService } from "@/services/fancodeService";
import { Match } from "@/data/matches";

const Play = () => {
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get("id") || "1";
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [otherMatches, setOtherMatches] = useState<Match[]>([]);

  useEffect(() => {
    const fetchMatch = async () => {
      // Try to get match from FanCode service (now async)
      const match = await FancodeService.getMatchById(matchId);
      setCurrentMatch(match || null);
      
      // Fetch other live matches
      const allMatches = await FancodeService.fetchLiveMatches();
      setOtherMatches(allMatches.filter(m => m.id !== matchId));
    };

    fetchMatch();
  }, [matchId]);

  if (!currentMatch) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Match Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The requested match could not be found.
            </p>
            <Link to="/">
              <Button>
                ← Back to Matches
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const matchTitle = `${currentMatch.team1.name} vs ${currentMatch.team2.name} - ${currentMatch.tournament}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline" size="sm">
              ← Back to Matches
            </Button>
          </Link>
        </div>

        {/* Match Info */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={currentMatch.team1.flag} 
                  alt={`${currentMatch.team1.name} flag`}
                  className="w-8 h-6 object-cover rounded"
                />
                <span className="font-semibold">{currentMatch.team1.name}</span>
              </div>
              
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent text-accent-foreground font-bold">
                VS
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="font-semibold">{currentMatch.team2.name}</span>
                <img 
                  src={currentMatch.team2.flag} 
                  alt={`${currentMatch.team2.name} flag`}
                  className="w-8 h-6 object-cover rounded"
                />
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{currentMatch.tournament}</p>
              <p className="text-sm font-medium">{currentMatch.sport}</p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm text-red-500 font-medium">LIVE</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Video Player */}
        <VideoPlayer 
          matchId={matchId}
          matchTitle={matchTitle}
        />

        {/* Other Matches */}
        <Card className="p-6 mt-8">
          <h3 className="text-xl font-bold mb-4">Other Live Matches</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherMatches.slice(0, 6).map((match) => (
              <Link key={match.id} to={`/play?id=${match.id}`}>
                <Card className="p-4 hover:bg-accent/10 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img 
                        src={match.team1.flag} 
                        alt={match.team1.name}
                        className="w-6 h-4 object-cover rounded"
                      />
                      <span className="text-sm">{match.team1.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">vs</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{match.team2.name}</span>
                      <img 
                        src={match.team2.flag} 
                        alt={match.team2.name}
                        className="w-6 h-4 object-cover rounded"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{match.tournament}</p>
                </Card>
              </Link>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Play;