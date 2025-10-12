import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const TelegramPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('telegram-popup-seen');
    if (!hasSeenPopup) {
      setIsOpen(true);
    }
  }, []);

  const handleJoin = () => {
    localStorage.setItem('telegram-popup-seen', 'true');
    window.open('https://t.me/CricketNewsSkull', '_blank');
    setIsOpen(false);
  };

  const handleAlreadyJoined = () => {
    localStorage.setItem('telegram-popup-seen', 'true');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-accent">
            🏏 Welcome to Crick On Time!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Join our Telegram channel for the latest cricket news, live updates, and exclusive content!
          </p>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleJoin}
              className="bg-fc-cyan text-white hover:bg-fc-cyan/90 w-full"
            >
              🔵 Join Telegram Channel
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleAlreadyJoined}
              className="w-full"
            >
              Already Joined ✅
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};