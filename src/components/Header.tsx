import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tv, Clock, Zap } from "lucide-react";

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
    <header className="bg-card/80 backdrop-blur-xl border-b border-border/50 px-4 py-3 sticky top-0 z-50 animate-fade-in">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all duration-300">
                <Tv className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight gradient-text">
                CRICK ON TIME
              </h1>
              <p className="text-[10px] text-muted-foreground font-medium -mt-0.5">LIVE STREAMING</p>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-lg font-medium transition-all duration-300 ${
                location.pathname === '/' 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
              onClick={() => navigate('/')}
            >
              <Zap className="w-4 h-4 mr-1.5" />
              Live Matches
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-lg font-medium transition-all duration-300 ${
                location.pathname === '/highlights' 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
              onClick={() => navigate('/highlights')}
            >
              Highlights
            </Button>
          </nav>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="header-time flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="text-foreground">{formatTime(currentTime)}</span>
          </div>
          
          <Button 
            size="sm"
            className="telegram-btn text-white border-0 font-semibold rounded-lg px-4"
            onClick={() => window.open('https://t.me/+jWWYoYpYlqgwMWM1', '_blank')}
          >
            <span className="mr-1.5">📢</span> Join Telegram
          </Button>
        </div>
      </div>
    </header>
  );
};