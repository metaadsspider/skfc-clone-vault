import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Minimize } from 'lucide-react';
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
      className="absolute inset-0 z-20 group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseMove}
    >
      {/* Center Play Button - Modern Design */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10 bg-black/30 backdrop-blur-sm"
          onClick={onPlayPause}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-white to-white/90 hover:from-white hover:to-white rounded-full p-6 md:p-5 transition-all duration-300 hover:scale-110 shadow-2xl">
              <Play className="w-16 h-16 md:w-12 md:h-12 text-black fill-black ml-1.5" />
            </div>
          </div>
        </div>
      )}

      {/* Top Gradient Overlay */}
      <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent transition-opacity duration-300 ${
        showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* LIVE Badge - Top Right */}
        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-red-600/90 backdrop-blur-sm rounded-full shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-white text-xs font-bold tracking-wide">LIVE</span>
        </div>
      </div>

      {/* Modern Control Bar */}
      <div 
        className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${
          showControls || !isPlaying ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none"></div>
        
        <div className="relative px-4 md:px-6 pb-3 md:pb-4 pt-6 md:pt-8">
          {/* Time Display */}
          <div className="flex items-center justify-between mb-4 md:mb-3 px-1">
            <span className="text-white/90 text-xs md:text-sm font-medium tabular-nums">
              {formatTime(currentTime)}
            </span>
            <span className="text-white/60 text-xs md:text-sm font-medium tabular-nums">
              {formatTime(duration)}
            </span>
          </div>
        
          {/* Control Buttons */}
          <div className="flex items-center justify-between gap-2">
            {/* Left Controls */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onPlayPause}
                className="text-white hover:bg-white/20 active:bg-white/30 p-3 md:p-2.5 h-auto rounded-lg transition-all duration-200 hover:scale-105"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 md:w-6 md:h-6" />
                ) : (
                  <Play className="w-7 h-7 md:w-6 md:h-6 ml-0.5" />
                )}
              </Button>

              {/* Volume Control */}
              <div 
                className="flex items-center gap-2"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMuteToggle}
                  className="text-white hover:bg-white/20 active:bg-white/30 p-3 md:p-2.5 h-auto rounded-lg transition-all duration-200 hover:scale-105"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-6 h-6 md:w-5 md:h-5" />
                  ) : (
                    <Volume2 className="w-6 h-6 md:w-5 md:h-5" />
                  )}
                </Button>
                
                <div className={`hidden md:block overflow-hidden transition-all duration-300 ${showVolumeSlider ? 'w-24 opacity-100' : 'w-0 opacity-0'}`}>
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    onValueChange={([value]) => {
                      const newVolume = value / 100;
                      onVolumeChange(newVolume);
                    }}
                    max={100}
                    step={1}
                    className="cursor-pointer [&_[role=slider]]:bg-white [&_[role=slider]]:w-3.5 [&_[role=slider]]:h-3.5 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white/20 [&_[role=slider]]:shadow-lg [&>span]:bg-white/90 [&>span]:h-1"
                  />
                </div>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Quality Selector */}
              {qualityLevels.length > 0 && (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 active:bg-white/30 p-3 md:p-2.5 h-auto rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      <Settings className="w-6 h-6 md:w-5 md:h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end"
                    side="top"
                    className="bg-black/95 backdrop-blur-xl border-white/10 min-w-[160px] z-[9999] shadow-2xl rounded-xl overflow-hidden"
                    sideOffset={10}
                  >
                    <div className="px-4 py-3 text-xs font-bold text-white/70 uppercase tracking-wider border-b border-white/10">
                      Video Quality
                    </div>
                    {qualityLevels.map((level, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => onQualityChange(level.level)}
                        className={`text-white hover:bg-white/20 cursor-pointer transition-all duration-200 px-4 py-3 text-sm font-medium ${
                          currentQuality === level.level ? 'bg-white/15 text-white' : 'text-white/80'
                        }`}
                      >
                        <span className="flex items-center justify-between w-full">
                          {getQualityLabel(level)}
                          {currentQuality === level.level && (
                            <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                          )}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Fullscreen Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onFullscreen}
                className="text-white hover:bg-white/20 active:bg-white/30 p-3 md:p-2.5 h-auto rounded-lg transition-all duration-200 hover:scale-105"
              >
                {isFullscreen ? (
                  <Minimize className="w-6 h-6 md:w-5 md:h-5" />
                ) : (
                  <Maximize className="w-6 h-6 md:w-5 md:h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};