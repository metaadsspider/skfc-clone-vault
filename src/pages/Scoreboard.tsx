import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { TelegramPopup } from "@/components/TelegramPopup";
import { ScoreCard } from "@/components/ScoreCard";
import { ScheduleCard } from "@/components/ScheduleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrexService, ScoreboardMatch, MatchSchedule } from "@/services/crexService";

const Scoreboard = () => {
  const [scoreboardMatches, setScoreboardMatches] = useState<ScoreboardMatch[]>([]);
  const [scheduleMatches, setScheduleMatches] = useState<MatchSchedule[]>([]);
  const [isLoadingScoreboard, setIsLoadingScoreboard] = useState(true);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchScoreboardData();
    fetchScheduleData();
    
    // Refresh every 30 seconds for live scores
    const interval = setInterval(() => {
      fetchScoreboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchScoreboardData = async () => {
    try {
      const data = await CrexService.fetchScoreboard();
      setScoreboardMatches(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching scoreboard:', error);
    } finally {
      setIsLoadingScoreboard(false);
    }
  };

  const fetchScheduleData = async () => {
    try {
      const data = await CrexService.fetchSchedule(7);
      setScheduleMatches(data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  const handleRefresh = () => {
    setIsLoadingScoreboard(true);
    fetchScoreboardData();
  };

  const liveMatches = scoreboardMatches.filter(match => match.status === 'live');
  const completedMatches = scoreboardMatches.filter(match => match.status === 'completed');

  return (
    <div className="min-h-screen bg-background">
      <TelegramPopup />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Live Sports <span className="text-accent">Scoreboard</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay updated with real-time scores, match results, and upcoming fixtures from top cricket tournaments
          </p>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-lg border border-border">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-accent text-accent">
              🔴 {liveMatches.length} Live Matches
            </Badge>
            <span className="text-sm text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoadingScoreboard}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingScoreboard ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="scoreboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="scoreboard" className="text-base">
              Live Scoreboard
            </TabsTrigger>
            <TabsTrigger value="schedule" className="text-base">
              Upcoming Matches
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="scoreboard" className="space-y-6">
            {/* Live Matches */}
            {liveMatches.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                  🔴 Live Matches
                  <Badge className="bg-fc-red text-white animate-pulse">
                    {liveMatches.length}
                  </Badge>
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {liveMatches.map((match) => (
                    <ScoreCard key={match.id} match={match} />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Results */}
            {completedMatches.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                  ✅ Recent Results
                  <Badge variant="secondary">
                    {completedMatches.length}
                  </Badge>
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {completedMatches.map((match) => (
                    <ScoreCard key={match.id} match={match} />
                  ))}
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoadingScoreboard && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4 p-6 border border-border rounded-lg">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="space-y-2">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-8 w-16 mx-auto" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            )}

            {/* No Matches */}
            {!isLoadingScoreboard && scoreboardMatches.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏏</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No matches available
                </h3>
                <p className="text-muted-foreground">
                  Check back later for live scores and match updates
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              📅 Upcoming Matches
              <Badge variant="secondary">
                Next 7 days
              </Badge>
            </h2>

            {/* Schedule Grid */}
            {!isLoadingSchedule && scheduleMatches.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {scheduleMatches.map((match) => (
                  <ScheduleCard key={match.id} match={match} />
                ))}
              </div>
            )}

            {/* Loading State */}
            {isLoadingSchedule && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4 p-6 border border-border rounded-lg">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-8 w-16 mx-auto" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            )}

            {/* No Schedule */}
            {!isLoadingSchedule && scheduleMatches.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No upcoming matches
                </h3>
                <p className="text-muted-foreground">
                  Schedule will be updated as new matches are announced
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2025 Crick On Time. Real-time cricket scores and updates.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Scoreboard;