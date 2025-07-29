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

  // Get stream URL from FanCode service
  const streamUrl = "https://in-mc-fdlive.fancode.com/mumbai/129731_english_hls_98010ta-di_h264/1080p.m3u8";

  const initNSPlayer = async () => {
    if (!videoRef.current || !window.Hls) return;

    try {
      setIsLoading(true);
      setError(null);

      if (window.Hls.isSupported()) {
        const hls = new window.Hls({
          // Ultra-low latency optimizations
          liveSyncDurationCount: 1, // Keep only 1 segment in sync for minimal delay
          liveMaxLatencyDurationCount: 3, // Max 3 segments latency
          maxBufferLength: 10, // Very small buffer - 10 seconds only
          maxMaxBufferLength: 15, // Maximum buffer length
          maxBufferSize: 5 * 1000 * 1000, // 5MB max buffer size
          maxBufferHole: 0.1, // Minimal gap tolerance
          lowLatencyMode: true, // Enable low latency for live streams
          backBufferLength: 5, // Keep only 5 seconds behind current position
          enableWorker: true, // Use web worker for better performance
          liveDurationInfinity: true, // Handle infinite live streams
          manifestLoadingTimeOut: 2000, // Faster manifest loading
          manifestLoadingMaxRetry: 2, // Quick retry
          levelLoadingTimeOut: 2000, // Faster level loading
          fragLoadingTimeOut: 5000, // Fragment loading timeout
          debug: false
        });

        hlsRef.current = hls;

        // Buffer management - automatically remove old segments
        hls.on(window.Hls.Events.BUFFER_APPENDED, () => {
          const video = videoRef.current;
          if (video && video.buffered.length > 0) {
            const currentTime = video.currentTime;
            const bufferedStart = video.buffered.start(0);
            
            // Aggressive buffer cleanup for ultra-low latency
            if (currentTime - bufferedStart > 10) {
              try {
                // Clear old buffer aggressively to prevent any lag
                const mediaSource = hls.media?.srcObject || hls.media;
                if (mediaSource && mediaSource.sourceBuffers) {
                  for (let i = 0; i < mediaSource.sourceBuffers.length; i++) {
                    const sourceBuffer = mediaSource.sourceBuffers[i];
                    if (!sourceBuffer.updating) {
                      const removeEnd = currentTime - 5; // Keep only last 5 seconds
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
      {/* Premium Player Header */}
      <Card className="p-6 bg-gradient-to-r from-background via-background to-background border-2 border-primary/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 rounded-full bg-primary/10">
              <span className="text-2xl">🏏</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {matchTitle}
              </h2>
              <p className="text-sm text-muted-foreground">World Championship of Legends 2025</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 rounded-full border border-red-500/30">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50"></div>
              <span className="text-sm font-semibold text-red-400">LIVE</span>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">Ultra HD</p>
              <p className="text-xs text-muted-foreground">1080p • 60fps</p>
            </div>
          </div>
        </div>

        {/* Premium Video Player Container */}
        <div className="relative bg-black rounded-xl overflow-hidden aspect-video border-4 border-primary/20 shadow-2xl 
                        mobile-video-container">
          <style dangerouslySetInnerHTML={{
            __html: `
              .mobile-video-container {
                aspect-ratio: 16/9;
              }
              @media (max-width: 768px) {
                .mobile-video-container {
                  aspect-ratio: 16/9 !important;
                  max-height: 60vh;
                  width: 100vw;
                  margin-left: calc(-50vw + 50%);
                  border-radius: 0;
                  border: none;
                }
              }
              @media (orientation: portrait) and (max-width: 768px) {
                .mobile-video-container {
                  aspect-ratio: 16/9 !important;
                  height: auto;
                  max-height: 50vh;
                }
              }
              @media (orientation: landscape) and (max-width: 768px) {
                .mobile-video-container {
                  max-height: 85vh;
                }
              }
            `
          }} />
          {/* Premium Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/90 via-primary/20 to-black/90 z-10 backdrop-blur-sm">
              <div className="text-center">
                <div className="relative">
                  <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4 shadow-lg shadow-primary/50"></div>
                  <div className="absolute inset-0 w-12 h-12 border-4 border-accent/30 rounded-full mx-auto animate-pulse"></div>
                </div>
                <p className="text-white text-lg font-semibold">Loading Premium Stream...</p>
                <p className="text-primary text-sm mt-1">Ultra Low Latency Mode</p>
              </div>
            </div>
          )}

          {/* Premium Error Overlay */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/90 via-red-500/20 to-black/90 z-10 backdrop-blur-sm">
              <div className="text-center max-w-md p-6 bg-black/60 rounded-xl border border-red-500/30">
                <div className="text-red-400 text-4xl mb-4">⚠️</div>
                <p className="text-red-400 text-lg font-semibold mb-2">Stream Interrupted</p>
                <p className="text-white/80 text-sm mb-4">{error}</p>
                <div className="flex items-center justify-center space-x-2 text-xs text-white/60">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>Attempting auto-recovery...</span>
                </div>
              </div>
            </div>
          )}

          {/* Premium Video Element */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            controls
            playsInline
            webkit-playsinline="true"
            muted
            autoPlay
            preload="metadata"
            crossOrigin="anonymous"
            style={{ 
              width: '100%', 
              height: '100%',
              objectFit: 'contain'
            }}
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='grad1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23000;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23333;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1920' height='1080' fill='url(%23grad1)'/%3E%3Ctext x='960' y='540' font-family='Arial,sans-serif' font-size='48' fill='%23fff' text-anchor='middle' opacity='0.8'%3E🏏 Premium Live Stream%3C/text%3E%3C/svg%3E"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Premium Stream Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card/50 rounded-lg p-3 border border-border/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Quality</p>
            <p className="text-lg font-bold text-primary">1080p HD</p>
          </div>
          <div className="bg-card/50 rounded-lg p-3 border border-border/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Latency</p>
            <p className="text-lg font-bold text-green-500">Ultra Low</p>
          </div>
          <div className="bg-card/50 rounded-lg p-3 border border-border/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Player</p>
            <p className="text-lg font-bold text-accent">NS Pro</p>
          </div>
          <div className="bg-card/50 rounded-lg p-3 border border-border/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
            <p className={`text-lg font-bold ${!error ? 'text-green-500' : 'text-red-500'}`}>
              {!error ? 'Live' : 'Error'}
            </p>
          </div>
        </div>

        {/* Premium Features Badge */}
        <div className="mt-4 flex items-center justify-center">
          <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-full px-6 py-2 border border-primary/30">
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ⚡ Premium Live Streaming • Zero Buffer • Real-time Experience
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};