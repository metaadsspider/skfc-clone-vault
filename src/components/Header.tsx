import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="bg-background border-b border-border px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-accent">FC LIVE</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground font-mono">
            08:07:26 AM
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-fc-cyan text-white border-fc-cyan hover:bg-fc-cyan/90"
          >
            🔵 Join Telegram
          </Button>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-3">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2 text-center">
          <span className="text-destructive text-sm font-medium">
            🚨 Join our Telegram channel for more updates: @SKtechsports ➡️
          </span>
        </div>
      </div>
    </header>
  );
};