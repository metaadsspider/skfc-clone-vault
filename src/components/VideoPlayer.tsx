import { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { FancodeService } from '@/services/fancodeService';
import { CustomVideoControls } from './CustomVideoControls';

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
  
  // Video control states
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [qualityLevels, setQualityLevels] = useState<Array<{level: number, height: number, bitrate: number}>>([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Video control handlers
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      videoRef.current.muted = newMuted;
    }
  };

  const handleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (container) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        container.requestFullscreen();
      }
    }
  };

  const handleQualityChange = (level: number) => {
    setCurrentQuality(level);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
    }
  };

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChangeEvent = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChangeEvent);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChangeEvent);
    };
  }, []);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

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
          // Set quality levels
          const levels = hls.levels.map((level: any, index: number) => ({
            level: index,
            height: level.height,
            bitrate: level.bitrate
          }));
          // Add auto quality option
          levels.unshift({ level: -1, height: 0, bitrate: 0 });
          setQualityLevels(levels);
          setCurrentQuality(-1); // Auto quality by default
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

  // Block right-click and inspect element
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
          (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Simple Video Player Container */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video shadow-lg">
        <style dangerouslySetInnerHTML={{
          __html: `
            .video-container {
              aspect-ratio: 16/9;
              position: relative;
            }
            .video-container video {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            .video-container video::-webkit-media-controls-timeline {
              display: none !important;
            }
            .video-container video::-webkit-media-controls-current-time-display,
            .video-container video::-webkit-media-controls-time-remaining-display {
              display: none !important;
            }
            /* Fullscreen styles */
            .video-container:fullscreen {
              width: 100vw !important;
              height: 100vh !important;
              aspect-ratio: unset;
              border-radius: 0;
              max-width: none;
              background: black;
            }
            .video-container:fullscreen video {
              width: 100% !important;
              height: 100% !important;
            }
            @media (max-width: 768px) {
              .video-container {
                border-radius: 0;
                width: 100vw;
                margin-left: calc(-50vw + 50%);
              }
            }
          `
        }} />
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-white text-sm">Loading...</p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="text-center p-4">
              <p className="text-red-400 text-sm mb-2">Stream Error</p>
              <p className="text-white/60 text-xs">{error}</p>
            </div>
          </div>
        )}

        {/* Video Element */}
        <video
          ref={videoRef}
          className="video-container w-full h-full"
          playsInline
          webkit-playsinline="true"
          muted
          autoPlay
          preload="metadata"
          crossOrigin="anonymous"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          style={{ 
            width: '100%', 
            height: '100%',
            objectFit: 'contain'
          }}
        >
          Your browser does not support the video tag.
        </video>

        {/* Custom Netflix-style Controls */}
        {!isLoading && !error && (
          <div className={isFullscreen ? 'fixed inset-0 z-[999999]' : 'absolute inset-0 z-20'}>
            <CustomVideoControls
              videoRef={videoRef}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              volume={volume}
              onVolumeChange={handleVolumeChange}
              isMuted={isMuted}
              onMuteToggle={handleMuteToggle}
              onFullscreen={handleFullscreen}
              qualityLevels={qualityLevels}
              currentQuality={currentQuality}
              onQualityChange={handleQualityChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};