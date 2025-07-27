import { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";

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

  // Live streaming URL
  const streamUrl = "https://in-mc-fdlive.fancode.com/mumbai/131881_english_hls_47240ta-di_h264/index.m3u8";

  const initNSPlayer = async () => {
    if (!videoRef.current || !window.Hls) return;

    try {
      setIsLoading(true);
      setError(null);

      if (window.Hls.isSupported()) {
        const hls = new window.Hls({
          // Live streaming optimizations for 5-minute buffer
          liveSyncDurationCount: 3, // Keep only 3 segments in sync
          liveMaxLatencyDurationCount: 10, // Max 10 segments latency
          maxBufferLength: 300, // 5 minutes buffer (300 seconds)
          maxMaxBufferLength: 300, // Maximum buffer length
          maxBufferSize: 60 * 1000 * 1000, // 60MB max buffer size
          maxBufferHole: 0.5, // Max gap to fill
          lowLatencyMode: true, // Enable low latency for live streams
          backBufferLength: 30, // Keep only 30 seconds behind current position
          enableWorker: true, // Use web worker for better performance
          debug: false
        });

        hlsRef.current = hls;

        // Buffer management - automatically remove old segments
        hls.on(window.Hls.Events.BUFFER_APPENDED, () => {
          const video = videoRef.current;
          if (video && video.buffered.length > 0) {
            const currentTime = video.currentTime;
            const bufferedStart = video.buffered.start(0);
            
            // Remove buffer older than 5 minutes
            if (currentTime - bufferedStart > 300) {
              try {
                // Clear old buffer to prevent lag
                const mediaSource = hls.media?.srcObject || hls.media;
                if (mediaSource && mediaSource.sourceBuffers) {
                  for (let i = 0; i < mediaSource.sourceBuffers.length; i++) {
                    const sourceBuffer = mediaSource.sourceBuffers[i];
                    if (!sourceBuffer.updating) {
                      const removeEnd = currentTime - 300; // Keep only last 5 minutes
                      if (removeEnd > bufferedStart) {
                        sourceBuffer.remove(bufferedStart, removeEnd);
                      }
                    }
                  }
                }
              } catch (e) {
                console.log('Buffer cleanup skipped:', e);
              }
            }
          }
        });

        // Error handling with automatic recovery
        hls.on(window.Hls.Events.ERROR, (event, data) => {
          console.warn('HLS Error:', data);
          if (data.fatal) {
            switch (data.type) {
              case window.Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Network error, trying to recover...');
                hls.startLoad();
                break;
              case window.Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error, trying to recover...');
                hls.recoverMediaError();
                break;
              default:
                console.log('Fatal error, cannot recover');
                setError('Stream error occurred. Refreshing...');
                setTimeout(() => initNSPlayer(), 3000);
                break;
            }
          }
        });

        hls.on(window.Hls.Events.MANIFEST_LOADED, () => {
          setIsLoading(false);
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);

      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        initNativePlayer();
      } else {
        setError('HLS not supported in this browser');
      }

    } catch (err: any) {
      console.error('NS Player failed:', err);
      setError(`Failed to load stream: ${err.message}`);
      setIsLoading(false);
    }
  };

  const initNativePlayer = () => {
    if (!videoRef.current) return;

    setIsLoading(true);
    setError(null);

    // Native HLS support (Safari)
    const video = videoRef.current;
    video.src = streamUrl;
    
    video.addEventListener('loadstart', () => setIsLoading(true));
    video.addEventListener('canplay', () => setIsLoading(false));
    video.addEventListener('error', (e) => {
      console.error('Native Player Error:', e);
      setError('Failed to load stream. Please try refreshing.');
      setIsLoading(false);
    });

    video.load();
  };

  useEffect(() => {
    // Load HLS.js script for NS Player
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.onload = () => {
      initNSPlayer();
    };
    script.onerror = () => {
      // Fallback to native HLS if HLS.js fails to load
      initNativePlayer();
    };
    document.head.appendChild(script);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Player Controls */}
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
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23000'/%3E%3Ctext x='400' y='225' font-family='Arial' font-size='24' fill='%23fff' text-anchor='middle'%3ELive Stream%3C/text%3E%3C/svg%3E"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Stream Info */}
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Player: NS Player (HLS.js with 5-minute buffer management)</p>
          <p>Stream: FanCode Live Stream</p>
          <p className="flex items-center">
            Status: 
            <span className={`ml-1 w-2 h-2 rounded-full ${!error ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="ml-1">{!error ? 'Live' : 'Error'}</span>
          </p>
          <p className="text-xs mt-1 text-muted-foreground/70">
            Auto-removes old buffer to prevent lag • Optimized for live streaming
          </p>
        </div>
      </Card>
    </div>
  );
};