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
  sportIcon,
  index = 0 
}: MatchCardProps & { index?: number }) => {
  const handleWatchLive = (e: React.MouseEvent) => {
    e.preventDefault();
    // Navigate to internal play page
    window.location.href = `/play?id=${id}`;
  };

  const handleCardClick = () => {
    // Navigate to internal play page
    window.location.href = `/play?id=${id}`;
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
    <div 
      className="match-card group cursor-pointer card-stagger"
      style={{ '--stagger': index } as React.CSSProperties}
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden">
        <img 
          src={image} 
          alt={`${team1.name} vs ${team2.name}`}
          className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Tournament banner */}
        <div className="absolute top-0 left-0 right-0 bg-accent text-accent-foreground text-center py-2 text-sm font-bold uppercase">
          {sportIcon} {tournament}
        </div>
        
        {/* Team section at bottom */}
        <div className="absolute bottom-16 left-0 right-0 bg-black/90 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={team1.flag} 
                alt={team1.code}
                className="w-12 h-12 rounded-full border-2 border-white/20"
                loading="lazy"
              />
              <span className="text-white font-bold text-lg">
                {team1.code}
              </span>
            </div>
            
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent text-accent-foreground font-bold text-lg">
              VS
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-white font-bold text-lg">
                {team2.code}
              </span>
              <img 
                src={team2.flag} 
                alt={team2.code}
                className="w-12 h-12 rounded-full border-2 border-white/20"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Watch Live Button */}
      <Button 
        onClick={handleWatchLive}
        className={`w-full py-4 font-bold text-white rounded-none ${getButtonColorClass(buttonColor)} transition-all duration-300 hover:scale-105`}
      >
        WATCH LIVE
      </Button>
    </div>
  );
};