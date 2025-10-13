import { useEffect, useRef, useState } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<any>(null);
  const shakaRef = useRef<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string>("");
  
  // Video control states
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [qualityLevels, setQualityLevels] = useState<Array<{level: number, height: number, bitrate: number}>>([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch stream URL
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

  // Video control handlers
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => console.error('Play error:', err));
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      // Auto-unmute if volume is increased
      if (newVolume > 0 && isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const handleQualityChange = (level: number) => {
    setCurrentQuality(level);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
    }
  };

  // Sync video events with state
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
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Initialize HLS player
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
          // Optimized settings for smooth playback
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 30,
          maxBufferLength: 20,
          maxMaxBufferLength: 300,
          maxBufferSize: 30 * 1000 * 1000,
          maxBufferHole: 0.3,
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 3,
          levelLoadingTimeOut: 10000,
          fragLoadingTimeOut: 20000,
          debug: false
        });

        hlsRef.current = hls;

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
                setError('Stream error occurred');
                break;
            }
          }
        });

        hls.on(window.Hls.Events.MANIFEST_PARSED, (event, data) => {
          setIsLoading(false);
          console.log('Manifest loaded, quality levels:', data.levels);
          
          // Set quality levels
          const levels = data.levels.map((level: any, index: number) => ({
            level: index,
            height: level.height,
            bitrate: level.bitrate
          }));
          
          // Add auto quality option at the beginning
          levels.unshift({ level: -1, height: 0, bitrate: 0 });
          setQualityLevels(levels);
          setCurrentQuality(-1);
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);

      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        videoRef.current.src = streamUrl;
        setIsLoading(false);
      } else {
        setError('HLS not supported in this browser');
      }

    } catch (err: any) {
      console.error('HLS Player failed:', err);
      setError(`Failed to load stream: ${err.message}`);
      setIsLoading(false);
    }
  };

  // Initialize DASH player
  const initDashPlayer = async () => {
    if (!videoRef.current || !window.shaka || !streamUrl) return;

    try {
      console.log('Initializing DASH player with URL:', streamUrl);
      setIsLoading(true);
      setError(null);

      if (shakaRef.current) {
        await shakaRef.current.destroy();
      }

      const player = new window.shaka.Player(videoRef.current);
      shakaRef.current = player;

      player.configure({
        streaming: {
          lowLatencyMode: false,
          bufferingGoal: 20,
          rebufferingGoal: 2,
          bufferBehind: 30
        }
      });

      player.addEventListener('error', (event: any) => {
        console.error('DASH Player Error:', event.detail);
        setError('Stream error occurred');
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

  // Load player when stream URL is available
  useEffect(() => {
    if (!streamUrl) return;

    const loadPlayer = async () => {
      const isDashStream = streamUrl.includes('.mpd');
      
      if (isDashStream) {
        if (!window.shaka) {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/shaka-player@latest/dist/shaka-player.compiled.js';
          script.onload = () => {
            window.shaka.polyfill.installAll();
            if (window.shaka.Player.isBrowserSupported()) {
              initDashPlayer();
            } else {
              setError('DASH not supported in this browser');
            }
          };
          document.head.appendChild(script);
        } else {
          initDashPlayer();
        }
      } else {
        if (!window.Hls) {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
          script.onload = () => {
            initHlsPlayer();
          };
          document.head.appendChild(script);
        } else {
          initHlsPlayer();
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
    <div className="w-full max-w-7xl mx-auto px-4">
      <div 
        ref={containerRef}
        className="relative bg-black rounded-lg overflow-hidden aspect-video shadow-2xl"
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full"
          playsInline
          onClick={handlePlayPause}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white font-medium">Loading stream...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90">
            <div className="text-center px-6">
              <p className="text-red-500 font-semibold text-lg mb-2">Stream Error</p>
              <p className="text-white/70">{error}</p>
            </div>
          </div>
        )}

        {/* Custom Controls */}
        {!error && (
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
            isFullscreen={isFullscreen}
          />
        )}
      </div>
    </div>
  );
};