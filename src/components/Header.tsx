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
    <header className="bg-gradient-to-r from-background via-background to-background border-b border-border/50 px-4 py-4 animate-fade-in backdrop-blur-md sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 
            className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-accent via-fc-cyan to-accent bg-clip-text text-transparent hover:scale-105 transition-all duration-300 cursor-pointer animate-glow"
            onClick={() => navigate('/')}
          >
            Crick On Time
          </h1>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className={`transition-all duration-200 ${location.pathname === '/' ? 'text-accent font-semibold bg-accent/10 border border-accent/30' : 'text-muted-foreground hover:text-foreground hover:bg-accent/5'}`}
              onClick={() => navigate('/')}
            >
              Live Matches
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`transition-all duration-200 ${location.pathname === '/scoreboard' ? 'text-accent font-semibold bg-accent/10 border border-accent/30' : 'text-muted-foreground hover:text-foreground hover:bg-accent/5'}`}
              onClick={() => navigate('/scoreboard')}
            >
              Scoreboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`transition-all duration-200 ${location.pathname === '/highlights' ? 'text-accent font-semibold bg-accent/10 border border-accent/30' : 'text-muted-foreground hover:text-foreground hover:bg-accent/5'}`}
              onClick={() => navigate('/highlights')}
            >
              Highlights
            </Button>
          </nav>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="header-time hidden sm:block">
            {formatTime(currentTime)}
          </div>
          
          {/* Social Links */}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-accent hover:bg-accent/10 hover:scale-110 transition-all duration-200"
            onClick={() => window.open('https://www.instagram.com/crickontime?igsh=bjdzcmVtc3g4czJt', '_blank')}
          >
            <Instagram className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="telegram-btn bg-gradient-to-r from-fc-cyan to-fc-cyan/80 text-white border-0 hover:from-fc-cyan/90 hover:to-fc-cyan/70 shadow-lg hover:shadow-fc-cyan/30 font-semibold"
            onClick={() => window.open('https://t.me/+jWWYoYpYlqgwMWM1', '_blank')}
          >
            <span className="hidden sm:inline">🔵 Join Telegram</span>
            <span className="sm:hidden">🔵</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
