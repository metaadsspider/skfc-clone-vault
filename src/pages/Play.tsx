import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Play = () => {
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('id');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Matches
          </Button>
        </div>

        <Card className="p-6">
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-4">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">📺</div>
              <h2 className="text-2xl font-bold mb-2">Live Stream</h2>
              <p className="text-muted-foreground">
                Match ID: {matchId || 'Unknown'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Video player would be integrated here with the streaming service
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Live Sports Streaming</h3>
            <p className="text-muted-foreground">
              Enjoy high-quality live sports streaming with FC LIVE
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Play;