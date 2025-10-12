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
        <div className="mb-8 text-center animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-accent via-fc-cyan to-accent bg-clip-text text-transparent animate-glow">
            Live Sports Streaming
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Watch your favorite sports live in premium HD quality
          </p>
        </div>

        {/* Live Matches Section */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-4 animate-pulse shadow-lg"
              >
                <div className="h-40 md:h-48 bg-muted rounded-xl mb-4"></div>
                <div className="h-5 bg-muted rounded-lg mb-3"></div>
                <div className="h-5 bg-muted rounded-lg w-3/4"></div>
              </div>
            ))}
          </div>
        ) : matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
          <div className="text-center py-16 md:py-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-muted/20 rounded-full flex items-center justify-center">
              <span className="text-4xl">🏏</span>
            </div>
            <p className="text-muted-foreground text-lg md:text-xl font-medium mb-2">
              No live matches available at the moment.
            </p>
            <p className="text-sm md:text-base text-muted-foreground">
              Check back soon for live sports streaming!
            </p>
          </div>
        )}


        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-border/30 text-center text-muted-foreground animate-fade-in">
          <p className="text-sm md:text-base font-medium mb-2">
            © 2025 Crick On Time - Premium Sports Streaming Platform
          </p>
          <p className="text-xs text-muted-foreground/60">
            Experience sports like never before
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
