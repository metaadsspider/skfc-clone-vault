import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

declare global {
  interface Window {
    shaka: any;
  }
}

interface VideoPlayerProps {
  matchId: string;
  matchTitle: string;
}

export const VideoPlayer = ({ matchId, matchTitle }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerType, setPlayerType] = useState<'shaka' | 'ns'>('shaka');

  // Sample streaming URLs (replace with your actual streaming URLs)
  const streamUrls = {
    hls: `https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8`,
    dash: `https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd`,
    mp4: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`
  };

  useEffect(() => {
    // Load Shaka Player script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/shaka-player@4.7.0/dist/shaka-player.compiled.js';
    script.onload = () => {
      if (playerType === 'shaka') {
        initShakaPlayer();
      }
    };
    document.head.appendChild(script);

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [playerType]);

  const initShakaPlayer = async () => {
    if (!videoRef.current || !window.shaka) return;

    try {
      setIsLoading(true);
      setError(null);

      // Check if browser is supported
      if (!window.shaka.Player.isBrowserSupported()) {
        setError('Browser not supported for Shaka Player');
        return;
      }

      // Create player
      const player = new window.shaka.Player(videoRef.current);
      playerRef.current = player;

      // Configure player
      player.configure({
        streaming: {
          rebufferingGoal: 2,
          bufferingGoal: 10,
          bufferBehind: 30,
        },
        drm: {
          retryParameters: {
            timeout: 30000,
            maxAttempts: 2,
            baseDelay: 1000,
            backoffFactor: 2,
            fuzzFactor: 0.5
          }
        }
      });

      // Set up error handling
      player.addEventListener('error', (event: any) => {
        console.error('Shaka Player Error:', event.detail);
        setError(`Playback Error: ${event.detail.message || 'Unknown error'}`);
        setIsLoading(false);
      });

      // Load the stream
      await player.load(streamUrls.dash);
      setIsLoading(false);

    } catch (err: any) {
      console.error('Failed to initialize Shaka Player:', err);
      setError(`Failed to load stream: ${err.message}`);
      setIsLoading(false);
    }
  };

  const initNSPlayer = () => {
    if (!videoRef.current) return;

    setIsLoading(true);
    setError(null);

    // Simple HLS/MP4 player using native HTML5 video
    const video = videoRef.current;
    
    // Try HLS first, fallback to MP4
    video.src = streamUrls.hls;
    
    video.addEventListener('loadstart', () => setIsLoading(true));
    video.addEventListener('canplay', () => setIsLoading(false));
    video.addEventListener('error', (e) => {
      console.error('NS Player Error:', e);
      // Fallback to MP4
      video.src = streamUrls.mp4;
    });

    video.load();
  };

  const switchPlayer = (type: 'shaka' | 'ns') => {
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
    
    setPlayerType(type);
    
    if (type === 'ns') {
      setTimeout(() => initNSPlayer(), 100);
    }
  };

  const refreshStream = () => {
    if (playerType === 'shaka') {
      initShakaPlayer();
    } else {
      initNSPlayer();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Player Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-accent">{matchTitle}</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant={playerType === 'shaka' ? 'default' : 'outline'}
              size="sm"
              onClick={() => switchPlayer('shaka')}
            >
              Shaka Player
            </Button>
            <Button
              variant={playerType === 'ns' ? 'default' : 'outline'}
              size="sm"
              onClick={() => switchPlayer('ns')}
            >
              NS Player
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshStream}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-white text-sm">Loading stream...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <div className="text-center max-w-md p-4">
                <div className="text-red-400 text-lg mb-2">⚠️</div>
                <p className="text-red-400 text-sm mb-4">{error}</p>
                <Button size="sm" onClick={refreshStream}>
                  Try Again
                </Button>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            className="w-full h-full"
            controls
            playsInline
            crossOrigin="anonymous"
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23000'/%3E%3Ctext x='400' y='225' font-family='Arial' font-size='24' fill='%23fff' text-anchor='middle'%3ELive Stream%3C/text%3E%3C/svg%3E"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Stream Info */}
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Player: {playerType === 'shaka' ? 'Shaka Player (DASH/HLS)' : 'NS Player (HLS/MP4)'}</p>
          <p>Quality: Auto (adaptive bitrate)</p>
          <p className="flex items-center">
            Status: 
            <span className={`ml-1 w-2 h-2 rounded-full ${!error ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="ml-1">{!error ? 'Connected' : 'Error'}</span>
          </p>
        </div>
      </Card>

      {/* Stream Options */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Stream Quality Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button variant="outline" size="sm" className="justify-start">
            🔴 Auto Quality
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            📺 HD (720p)
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            🎬 Full HD (1080p)
          </Button>
        </div>
      </Card>
    </div>
  );
};