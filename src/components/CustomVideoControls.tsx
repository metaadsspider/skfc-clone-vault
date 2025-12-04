import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CustomVideoControlsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  onPlayPause: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  isMuted: boolean;
  onMuteToggle: () => void;
  onFullscreen: () => void;
  qualityLevels: Array<{level: number, height: number, bitrate: number}>;
  currentQuality: number;
  onQualityChange: (level: number) => void;
  isFullscreen: boolean;
}

export const CustomVideoControls = ({
  videoRef,
  isPlaying,
  onPlayPause,
  volume,
  onVolumeChange,
  isMuted,
  onMuteToggle,
  onFullscreen,
  qualityLevels,
  currentQuality,
  onQualityChange,
  isFullscreen
}: CustomVideoControlsProps) => {
  const [showControls, setShowControls] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Update time and duration
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('durationchange', updateDuration);
    video.addEventListener('loadedmetadata', updateDuration);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('durationchange', updateDuration);
      video.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [videoRef]);

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityLabel = (level: any) => {
    if (level.height) return `${level.height}p`;
    return 'Auto';
  };

  return (
    <div 
      className="absolute inset-0 z-20"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseMove}
      onClick={(e) => {
        if (e.target === e.currentTarget) onPlayPause();
      }}
    >
      {/* Center Play Button - Premium Style */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
          onClick={onPlayPause}
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl scale-150 animate-pulse" />
            <div className="relative w-20 h-20 md:w-24 md:h-24 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/50 transition-transform duration-300 group-hover:scale-110">
              <Play className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground fill-current ml-1" />
            </div>
          </div>
        </div>
      )}

      {/* Top Bar - Premium Branding */}
      <div className={`absolute top-0 left-0 right-0 player-top-bar px-4 md:px-6 py-4 flex items-center justify-between transition-all duration-500 ${
        showControls || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 backdrop-blur-sm flex items-center justify-center">
            <Tv className="w-4 h-4 text-primary" />
          </div>
          <span className="text-white text-sm font-bold tracking-wide">CRICK ON TIME</span>
        </div>
        <div className="live-badge flex items-center gap-2">
          <span className="live-dot" />
          <span className="text-white font-bold">LIVE</span>
        </div>
      </div>

      {/* Bottom Control Bar - Premium Style */}
      <div 
        className={`absolute bottom-0 left-0 right-0 player-controls transition-all duration-500 ${
          showControls || !isPlaying ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="flex items-center justify-between px-4 md:px-6 py-4 gap-3">
          {/* Left: Play + Time */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPlayPause}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-300"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 md:w-6 md:h-6" />
              ) : (
                <Play className="w-5 h-5 md:w-6 md:h-6 ml-0.5" />
              )}
            </Button>
            
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
              <span className="text-white text-sm font-medium tabular-nums">
                -{formatTime(duration - currentTime)}
              </span>
            </div>
          </div>

          {/* Right: Volume + Quality + Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Volume */}
            <div 
              className="flex items-center gap-2"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onMuteToggle}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-300"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
              
              <div className={`hidden md:flex items-center overflow-hidden transition-all duration-300 ${showVolumeSlider ? 'w-24 opacity-100' : 'w-0 opacity-0'}`}>
                <div className="px-2 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    onValueChange={([value]) => {
                      const newVolume = value / 100;
                      onVolumeChange(newVolume);
                    }}
                    max={100}
                    step={1}
                    className="cursor-pointer w-16 [&_[role=slider]]:bg-primary [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child]:bg-white/30 [&>span:first-child>span]:bg-primary"
                  />
                </div>
              </div>
            </div>

            {/* Quality */}
            {qualityLevels.length > 0 && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-300"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end"
                  side="top"
                  className="bg-black/95 backdrop-blur-xl border-white/10 min-w-[140px] z-[9999] rounded-xl overflow-hidden"
                  sideOffset={12}
                >
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Quality</p>
                  </div>
                  {qualityLevels.map((level, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => onQualityChange(level.level)}
                      className={`text-white hover:bg-white/10 cursor-pointer px-4 py-2.5 text-sm font-medium transition-colors ${
                        currentQuality === level.level ? 'bg-primary/20 text-primary' : ''
                      }`}
                    >
                      {getQualityLabel(level)}
                      {currentQuality === level.level && (
                        <span className="ml-auto text-primary">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onFullscreen}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-300"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};