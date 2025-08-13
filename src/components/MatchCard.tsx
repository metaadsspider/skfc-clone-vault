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
  // New prop for the M3U8 link
  m3u8Url?: string | null;
  // New prop for the live time
  liveTime?: string | null;
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
  m3u8Url,
  liveTime, // Now accepting the liveTime prop
  index = 0
}: MatchCardProps & { index?: number }) => {
  // Check if the m3u8Url exists AND if the current time is past the liveTime.
  const isLive = m3u8Url && m3u8Url.trim() !== '' && liveTime && new Date(liveTime) <= new Date();

  const handleWatchLive = (e: React.MouseEvent) => {
    e.preventDefault();
    // Only navigate if the match is live.
    if (isLive) {
      window.location.href = `/play?id=${id}`;
    }
  };

  const handleCardClick = () => {
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

  // Define a disabled button style for "Upcoming" matches.
  const disabledButtonClass = 'bg-gray-700 text-gray-400 cursor-not-allowed';

  return (
    <div
      className="match-card group cursor-pointer card-stagger"
      style={{ '--stagger': index } as React.CSSProperties}
      onClick={handleCardClick}
    >
      <div className="relative">
        <img
          src={image}
          alt={`${team1.name} vs ${team2.name}`}
          className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="sport-badge">
          {sportIcon} {tournament}
        </div>
        
        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />
        
        {/* Teams section with enhanced styling */}
        <div className="absolute bottom-0 left-0 right-0 team-vs">
          <div className="flex items-center space-x-3 group">
            <img
              src={team1.flag}
              alt={team1.code}
              className="team-logo"
              loading="lazy"
            />
            <span className="text-white font-bold text-lg transition-all duration-300 group-hover:text-accent">
              {team1.code}
            </span>
          </div>
          
          <div className="vs-divider">VS</div>
          
          <div className="flex items-center space-x-3 group">
            <span className="text-white font-bold text-lg transition-all duration-300 group-hover:text-accent">
              {team2.code}
            </span>
            <img
              src={team2.flag}
              alt={team2.code}
              className="team-logo"
              loading="lazy"
            />
          </div>
        </div>

        {/* Conditionally render the "LIVE" indicator */}
        {isLive && (
          <div className="absolute top-3 right-3 bg-fc-red text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse-slow">
            🔴 LIVE
          </div>
        )}
      </div>
      
      <div className="p-0">
        {/* Conditionally render the button based on live status */}
        <Button
          onClick={handleWatchLive}
          disabled={!isLive}
          className={`watch-live-btn rounded-none rounded-b-xl ${isLive ? getButtonColorClass(buttonColor) : disabledButtonClass}`}
        >
          <span className="relative z-10">
            {isLive ? 'WATCH LIVE' : 'UPCOMING'}
          </span>
        </Button>
      </div>
    </div>
  );
};
