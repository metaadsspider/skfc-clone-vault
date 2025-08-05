import { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { FancodeService } from '@/services/fancodeService';

declare global {
  interface Window {
    Hls: any;
    shaka: any;
  }
}

interface VideoPlayerProps {
  matchId: string;
  matchTitle: string;
}

export const VideoPlayer = ({ matchId, matchTitle }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const shakaRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string>("");
  const [showExtensionOption, setShowExtensionOption] = useState(false);

  // Fetch stream URL from service
  useEffect(() => {
    const fetchStreamUrl = async () => {
      try {
        const url = await FancodeService.fetchMatchStreamUrl(matchId);
        console.log('Fetched stream URL:', url);
        if (url) {
          setStreamUrl(url);
        } else {
          setError('Stream URL not found');
        }
      } catch (err) {
        console.error('Error fetching stream URL:', err);
        setError('Failed to get stream URL');
      }
    };
    fetchStreamUrl();
  }, [matchId]);

  const openInExtension = () => {
    // Get the original stream URL without proxy
    const originalUrl = streamUrl.replace('/api/stream/bbc/', 'https://');
    const extensionUrl = `chrome-extension://opmeopcambhfimffbomjgemehjkbbmji/pages/player.html#${originalUrl}`;
    window.open(extensionUrl, '_blank');
  };

  const initDashPlayer = async () => {
    if (!videoRef.current || !window.shaka || !streamUrl) return;

    try {
      console.log('Initializing DASH player with URL:', streamUrl);
      setIsLoading(true);
      setError(null);

      // Destroy existing instance
      if (shakaRef.current) {
        await shakaRef.current.destroy();
      }

      const player = new window.shaka.Player(videoRef.current);
      shakaRef.current = player;

      // Configure player for low latency
      player.configure({
        streaming: {
          lowLatencyMode: true,
          inaccurateManifestTolerance: 0,
          rebufferingGoal: 1,
          bufferingGoal: 3,
          bufferBehind: 5,
          retryParameters: {
            timeout: 10000,
            maxAttempts: 4,
            baseDelay: 1000,
            backoffFactor: 2,
            fuzzFactor: 0.5
          }
        },
        abr: {
          enabled: true,
          useNetworkInformation: true,
          defaultBandwidthEstimate: 1000000
        },
        manifest: {
          retryParameters: {
            timeout: 10000,
            maxAttempts: 4,
            baseDelay: 1000,
            backoffFactor: 2,
            fuzzFactor: 0.5
          }
        }
      });

      player.addEventListener('error', (event: any) => {
        console.error('DASH Player Error:', event.detail);
        setError('Stream error occurred. Try the extension player below.');
        setShowExtensionOption(true);
      });

      player.addEventListener('buffering', (event: any) => {
        setIsLoading(event.buffering);
      });

      await player.load(streamUrl);
      setIsLoading(false);

    } catch (err: any) {
      console.error('DASH Player failed:', err);
      setError(`Failed to load stream: ${err.message}`);
      setIsLoading(false);
    }
  };

  const initHlsPlayer = async () => {
    if (!videoRef.current || !window.Hls || !streamUrl) return;

    try {
      console.log('Initializing HLS player with URL:', streamUrl);
      setIsLoading(true);
      setError(null);

      if (window.Hls.isSupported()) {
        // Destroy existing instance
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        const hls = new window.Hls({
          // Optimized settings for better reliability
          enableWorker: true,
          lowLatencyMode: false, // Disable for better stability
          backBufferLength: 90, // Increase for better buffering
          maxBufferLength: 30, // Standard buffer length
          maxMaxBufferLength: 600, // Increase max buffer
          maxBufferSize: 60 * 1000 * 1000, // 60MB buffer
          maxBufferHole: 0.5, // Increase gap tolerance
          manifestLoadingTimeOut: 10000, // Increase timeout
          manifestLoadingMaxRetry: 4, // More retries
          levelLoadingTimeOut: 10000, // Increase timeout
          fragLoadingTimeOut: 20000, // Increase fragment timeout
          xhrSetup: function(xhr, url) {
            // Add custom headers for better compatibility
            xhr.setRequestHeader('Cache-Control', 'no-cache');
          },
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
                setError('Stream error occurred. Try the extension player below.');
                setShowExtensionOption(true);
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
      console.error('HLS Player failed:', err);
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
    console.log('VideoPlayer useEffect triggered, streamUrl:', streamUrl);
    
    if (!streamUrl) {
      console.log('No stream URL available yet');
      return;
    }

    const loadPlayer = async () => {
      const isDashStream = streamUrl.includes('.mpd');
      
      if (isDashStream) {
        // Load Shaka Player for DASH streams
        if (!window.shaka) {
          try {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/shaka-player@latest/dist/shaka-player.compiled.js';
            script.onload = () => {
              console.log('Shaka Player loaded successfully');
              window.shaka.polyfill.installAll();
              if (window.shaka.Player.isBrowserSupported()) {
                initDashPlayer();
              } else {
                setError('DASH not supported in this browser');
              }
            };
            script.onerror = () => {
              console.error('Failed to load Shaka Player');
              setError('Failed to load video player');
            };
            document.head.appendChild(script);
          } catch (error) {
            console.error('Error loading Shaka Player:', error);
            setError('Failed to initialize video player');
          }
        } else {
          if (window.shaka.Player.isBrowserSupported()) {
            initDashPlayer();
          } else {
            setError('DASH not supported in this browser');
          }
        }
      } else {
        // Load HLS.js for HLS streams
        if (!window.Hls) {
          try {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
            script.onload = () => {
              console.log('HLS.js loaded successfully');
              if (window.Hls.isSupported()) {
                initHlsPlayer();
              } else {
                initNativePlayer();
              }
            };
            script.onerror = () => {
              console.error('Failed to load HLS.js');
              setError('Failed to load video player');
            };
            document.head.appendChild(script);
          } catch (error) {
            console.error('Error loading HLS script:', error);
            setError('Failed to initialize video player');
          }
        } else {
          if (window.Hls.isSupported()) {
            initHlsPlayer();
          } else {
            initNativePlayer();
          }
        }
      }
    };

    loadPlayer();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      if (shakaRef.current) {
        shakaRef.current.destroy();
      }
    };
  }, [streamUrl]);

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
                {showExtensionOption && (
                  <button
                    onClick={openInExtension}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mb-4"
                  >
                    🔗 Open in Extension Player
                  </button>
                )}
                <div className="flex items-center justify-center space-x-2 text-xs text-white/60">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>Try the extension player above</span>
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
        <div className="mt-4 flex items-center justify-center space-x-4">
          <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-full px-6 py-2 border border-primary/30">
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ⚡ Premium Live Streaming • Zero Buffer • Real-time Experience
            </span>
          </div>
          {streamUrl && (
            <button
              onClick={openInExtension}
              className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg transition-colors text-sm"
            >
              🔗 Extension Player
            </button>
          )}
        </div>
      </Card>
    </div>
  );
};