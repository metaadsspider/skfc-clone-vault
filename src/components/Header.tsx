import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export const Header = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

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
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-accent hover:scale-105 transition-transform duration-300 cursor-pointer">
            Crick On Time
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="header-time">
            {formatTime(currentTime)}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="telegram-btn bg-fc-cyan text-white border-fc-cyan hover:bg-fc-cyan/90"
            onClick={() => window.open('https://t.me/CricketNewsSkull', '_blank')}
          >
            🔵 Join Telegram
          </Button>
        </div>
      </div>
    </header>
  );
};