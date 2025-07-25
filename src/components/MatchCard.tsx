import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Team {
  code: string;
  name: string;
  flag: string;
}

interface MatchCardProps {
  id: string;
  tournament: string;
  sport: string;
  team1: Team;
  team2: Team;
  image: string;
  buttonColor: 'red' | 'purple' | 'green' | 'blue';
  sportIcon: string;
}

export const MatchCard = ({ 
  id, 
  tournament, 
  sport, 
  team1, 
  team2, 
  image, 
  buttonColor,
  sportIcon 
}: MatchCardProps) => {
  const handleWatchLive = () => {
    // In the original site, this would navigate to play.html?id=${id}
    window.open(`/play?id=${id}`, '_blank');
  };

  const getButtonColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'bg-fc-red hover:bg-fc-red/90';
      case 'purple': return 'bg-fc-purple hover:bg-fc-purple/90';
      case 'green': return 'bg-fc-green hover:bg-fc-green/90';
      case 'blue': return 'bg-fc-cyan hover:bg-fc-cyan/90';
      default: return 'bg-fc-red hover:bg-fc-red/90';
    }
  };

  return (
    <Card className="match-card group">
      <div className="relative">
        <img 
          src={image} 
          alt={`${team1.name} vs ${team2.name}`}
          className="w-full h-48 object-cover"
        />
        <div className="sport-badge">
          {sportIcon} {tournament}
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Teams section */}
        <div className="absolute bottom-0 left-0 right-0 team-vs">
          <div className="flex items-center space-x-3">
            <img 
              src={team1.flag} 
              alt={team1.code}
              className="team-logo"
            />
            <span className="text-white font-bold text-lg">{team1.code}</span>
          </div>
          
          <div className="vs-divider">VS</div>
          
          <div className="flex items-center space-x-3">
            <span className="text-white font-bold text-lg">{team2.code}</span>
            <img 
              src={team2.flag} 
              alt={team2.code}
              className="team-logo"
            />
          </div>
        </div>
      </div>
      
      <div className="p-0">
        <Button 
          onClick={handleWatchLive}
          className={`watch-live-btn rounded-none rounded-b-xl ${getButtonColorClass(buttonColor)}`}
        >
          WATCH LIVE
        </Button>
      </div>
    </Card>
  );
};