import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { MatchCard } from "@/components/MatchCard";
import { TelegramPopup } from "@/components/TelegramPopup";
import { FancodeService } from "@/services/fancodeService";
import { Match } from "@/data/matches";
import { Tv, Zap, Radio } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-background smooth-scroll">
      <TelegramPopup />
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-10 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Radio className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Live Now</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
            <span className="gradient-text">Premium Sports</span>
            <br />
            <span className="text-foreground">Streaming</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Watch your favorite matches live in ultra HD quality with zero buffering
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-10 animate-fade-in">
          {[
            { icon: Tv, label: "Live Matches", value: matches.length || "0" },
            { icon: Zap, label: "HD Quality", value: "4K" },
            { icon: Radio, label: "Latency", value: "<1s" },
          ].map((stat, i) => (
            <div key={i} className="glass rounded-xl p-4 text-center">
              <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Live Matches Section */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="loading-shimmer rounded-2xl p-4 h-64"
              >
                <div className="h-32 bg-muted/50 rounded-xl mb-4"></div>
                <div className="h-4 bg-muted/50 rounded-lg mb-2 w-3/4"></div>
                <div className="h-4 bg-muted/50 rounded-lg w-1/2"></div>
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
          <div className="text-center py-16 glass rounded-2xl">
            <Tv className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground text-xl font-semibold mb-2">
              No Live Matches
            </p>
            <p className="text-muted-foreground">
              Check back soon for live sports streaming!
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Tv className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold gradient-text">CRICK ON TIME</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Crick On Time - Premium Sports Streaming Platform
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;