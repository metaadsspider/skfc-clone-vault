import { Header } from "@/components/Header";
import { MatchCard } from "@/components/MatchCard";
import { matches } from "@/data/matches";

const Index = () => {
  return (
    <div className="min-h-screen bg-background smooth-scroll">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 text-center animate-fade-in">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-accent to-fc-cyan bg-clip-text text-transparent">
            Live Sports Streaming
          </h2>
          <p className="text-muted-foreground">
            Watch your favorite sports live in HD quality
          </p>
        </div>

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
              index={index}
            />
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-muted-foreground animate-fade-in">
          <p className="text-sm">
            © 2025 FC LIVE - Premium Sports Streaming Platform
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
