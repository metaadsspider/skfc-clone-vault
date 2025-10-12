import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Instagram } from "lucide-react";

export const Header = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <header className="bg-background border-b border-border px-4 py-3 animate-fade-in">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 
            className="text-2xl font-bold text-accent hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={() => navigate('/')}
          >
            Crick On Time
          </h1>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className={location.pathname === '/' ? 'text-accent font-medium' : 'text-muted-foreground hover:text-foreground'}
              onClick={() => navigate('/')}
            >
              Live Matches
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={location.pathname === '/scoreboard' ? 'text-accent font-medium' : 'text-muted-foreground hover:text-foreground'}
              onClick={() => navigate('/scoreboard')}
            >
              Scoreboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={location.pathname === '/highlights' ? 'text-accent font-medium' : 'text-muted-foreground hover:text-foreground'}
              onClick={() => navigate('/highlights')}
            >
              Highlights
            </Button>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="header-time">
            {formatTime(currentTime)}
          </div>
          
          {/* Social Links */}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => window.open('https://www.instagram.com/crickontime?igsh=bjdzcmVtc3g4czJt', '_blank')}
          >
            <Instagram className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="telegram-btn bg-fc-cyan text-white border-fc-cyan hover:bg-fc-cyan/90"
            onClick={() => window.open('https://t.me/CricketNewsOnTime', '_blank')}
          >
            🔵 Join Telegram
          </Button>
        </div>
      </div>
    </header>
  );
};
