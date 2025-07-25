import { Header } from "@/components/Header";
import { MatchCard } from "@/components/MatchCard";
import { matches } from "@/data/matches";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
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
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
