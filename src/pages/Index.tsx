import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { MatchCard } from "@/components/MatchCard";
import { TelegramPopup } from "@/components/TelegramPopup";
import { FancodeService } from "@/services/fancodeService";
import { Match } from "@/data/matches";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const Index = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsLoading(true);
        const liveMatches = await FancodeService.fetchLiveMatches();
        setMatches(liveMatches);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();

    // Refresh matches every 30 seconds
    const interval = setInterval(fetchMatches, 30000);
    return () => clearInterval(interval);
  }, []);

  // YouTube highlights - add your video IDs and optional titles here
  const highlights: { id: string; title?: string }[] = [
    { id: "VryvrvQfjNw", title: "Three Half Centuries Not Enough To Seal The Win! | Highlights | West Indies v Pakistan | 1st ODI" },
    { id: "mINmI2Tgelg", title: "Ireland v ​Pakistan Women 3rd T20I, 202​5 | Match Highlights" },
    { id: "oyW8MUM39cQ", title: "Australia v South Africa 2025-26 | First T20I" },
    // { id: "AnotherID", title: "Another Highlight" },
  ];

  return (
    <div className="min-h-screen bg-background smooth-scroll">
      <TelegramPopup />
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Live Matches Header */}
        <div className="mb-6 text-center animate-fade-in">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-accent to-fc-cyan bg-clip-text text-transparent">
            Live Sports Streaming
          </h2>
          <p className="text-muted-foreground">
            Watch your favorite sports live in HD quality
          </p>
        </div>

        {/* Live Matches Section */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-card rounded-lg p-4 animate-pulse"
              >
                <div className="h-32 bg-muted rounded mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, index) => (
              <MatchCard
                key={match.id}
                id={match.id}
                tournament={match.tournament}
                sport={match.sport}
                team1={match.team1}
                team2={match.team2}
                image={match.image}
                buttonColor={match.buttonColor}
                sportIcon={match.sportIcon}
                streamUrl={match.streamUrl}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No live matches available at the moment.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Check back soon for live sports streaming!
            </p>
          </div>
        )}


        {/* Footer */}
        <footer className="mt-16 text-center text-muted-foreground animate-fade-in">
          <p className="text-sm">
            © 2025 Crick On Time - Premium Sports Streaming Platform
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
