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
    <header className="bg-background sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-accent">
              FC LIVE
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="header-time text-accent">
              {formatTime(currentTime)}
            </div>
            
            <Button 
              size="sm"
              className="bg-fc-cyan hover:bg-fc-cyan/90 text-white telegram-btn rounded-full px-4 py-2"
              onClick={() => window.open('https://t.me/sktechsports', '_blank')}
            >
              🔔 Join Telegram
            </Button>
          </div>
        </div>
        
        {/* Telegram channel alert banner */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center bg-destructive/10 text-destructive px-4 py-2 rounded-full text-sm">
            🚨 Join our Telegram channel for more updates: @SKtechsports ➡️
          </div>
        </div>
      </div>
    </header>
  );
};