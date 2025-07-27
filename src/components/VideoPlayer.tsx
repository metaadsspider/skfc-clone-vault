// This is the complete and edited code for your VideoPlayer.tsx file

import { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";

// This lets TypeScript know about the Hls object from the script
declare global {
  interface Window {
    Hls: any;
  }
}

interface VideoPlayerProps {
  matchId: string;
  matchTitle: string;
}

export const VideoPlayer = ({ matchId, matchTitle }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- START OF EDITS ---

  // 1. The original Fancode stream URL
  const streamUrl = "https://in-mc-fdlive.fancode.com/mumbai/131881_english_hls_47240ta-di_h264/index.m3u8";

  // 2. The URL of your Cloudflare proxy worker
  const proxyWorkerUrl = 'https://crickontime-proxy.yashublitzz.workers.dev';

  // 3. The final URL that combines both for the player to use
  const finalPlayerSource = `${proxyWorkerUrl}/?url=${encodeURIComponent(streamUrl)}`;

  // --- END OF EDITS ---

  // This useEffect hook runs once when the component is created
  useEffect(() => {
    // Dynamically load the hls.js script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.async = true;
    // When the script is loaded, initialize the player
    script.onload = () => initPlayer();
    document.head.appendChild(script);

    // Cleanup function: runs when the component is removed from the page
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      // Remove the script tag when we're done
      const existingScript = document.querySelector(`script[src="${script.src}"]`);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  const initPlayer = () => {
    if (!videoRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      // Check if HLS.js is supported
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 10,
          maxBufferLength: 300,
          lowLatencyMode: true,
          backBufferLength: 30,
        });
        hlsRef.current = hls;

        hls.on(window.Hls.Events.ERROR, (event, data) => {
          console.warn('HLS Error:', data);
          if (data.fatal) {
            switch (data.type) {
              case window.Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad(); // Try to recover
                break;
              case window.Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError(); // Try to recover
                break;
              default:
                setError('A fatal stream error occurred. Please refresh.');
                hls.destroy(); // Cannot recover, destroy instance
                break;
            }
          }
        });

        hls.on(window.Hls.Events.MANIFEST_LOADED, () => {
          setIsLoading(false);
          videoRef.current?.play().catch(e => console.error("Autoplay failed", e));
        });

        // Use the proxied URL to load the stream
        hls.loadSource(finalPlayerSource);
        hls.attachMedia(videoRef.current);

      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support for Safari
        setIsLoading(false);
        // Use the proxied URL for native playback
        videoRef.current.src = finalPlayerSource;
        videoRef.current.play().catch(e => console.error("Autoplay failed", e));
      } else {
        setError('HLS streaming is not supported in this browser.');
        setIsLoading(false);
      }

    } catch (err: any) {
      console.error('Player initialization failed:', err);
      setError(`Failed to load stream: ${err.message}`);
      setIsLoading(false);
    }
  };


  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Your existing UI code (Card, Player Controls, etc.) remains unchanged */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-accent">{matchTitle}</h2>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-3 py-1 bg-card rounded-lg border">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-sm font-medium">LIVE</span>
            </div>
          </div>
        </div>

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
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            className="w-full h-full"
            controls
            playsInline
            muted
            autoPlay
            crossOrigin="anonymous"
          >
            Your browser does not support the video tag.
          </video>
        </div>
        
        {/* Your existing UI code for Stream Info remains unchanged */}
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Player: NS Player (HLS.js with Proxy)</p>
          <p>Stream: FanCode Live Stream via Cloudflare Worker</p>
          <p className="flex items-center">
            Status:
            <span className={`ml-1 w-2 h-2 rounded-full ${!error ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="ml-1">{!error ? 'Live' : 'Error'}</span>
          </p>
        </div>
      </Card>
    </div>
  );
};
