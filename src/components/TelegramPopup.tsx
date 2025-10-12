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
    window.open('https://t.me/+jWWYoYpYlqgwMWM1', '_blank');
    setIsOpen(false);
  };

  const handleAlreadyJoined = () => {
    localStorage.setItem('telegram-popup-seen', 'true');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-card border-accent/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-accent to-fc-cyan bg-clip-text text-transparent">
            🏏 Welcome to Crick On Time!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 text-center">
          <p className="text-muted-foreground text-base leading-relaxed">
            Join our Telegram channel for the latest cricket news, live updates, and exclusive premium content!
          </p>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleJoin}
              className="bg-gradient-to-r from-fc-cyan to-fc-cyan/80 text-white hover:from-fc-cyan/90 hover:to-fc-cyan/70 w-full shadow-lg hover:shadow-fc-cyan/30 font-semibold text-base py-6 transition-all duration-300 hover:scale-[1.02]"
            >
              🔵 Join Telegram Channel
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleAlreadyJoined}
              className="w-full border-accent/30 hover:bg-accent/10 hover:border-accent/50 transition-all duration-300"
            >
              Already Joined ✅
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};