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
      className="absolute inset-0 z-20"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseMove}
    >
      {/* Simple Center Play Button */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
          onClick={onPlayPause}
        >
          <div className="bg-white/95 hover:bg-white rounded-full p-4 md:p-3.5 transition-all duration-200 hover:scale-105 shadow-xl">
            <Play className="w-12 h-12 md:w-10 md:h-10 text-black fill-black ml-0.5" />
          </div>
        </div>
      )}

      {/* Top LIVE Badge */}
      <div className={`absolute top-3 right-3 md:top-4 md:right-4 transition-opacity duration-300 ${
        showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 rounded shadow-lg">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          <span className="text-white text-[10px] md:text-xs font-bold">LIVE</span>
        </div>
      </div>

      {/* Simple Control Bar */}
      <div 
        className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${
          showControls || !isPlaying ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
        
        <div className="relative px-3 md:px-4 pb-2.5 md:pb-3 pt-6">
          {/* Simple Time Display */}
          <div className="flex items-center justify-between mb-3 px-0.5">
            <span className="text-white/80 text-xs font-normal tabular-nums">
              {formatTime(currentTime)}
            </span>
            <span className="text-white/60 text-xs font-normal tabular-nums">
              {formatTime(duration)}
            </span>
          </div>
        
          {/* Control Buttons - Simple Layout */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onPlayPause}
                className="text-white hover:bg-white/10 p-2 h-auto rounded transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 md:w-5 md:h-5" />
                ) : (
                  <Play className="w-6 h-6 md:w-5 md:h-5" />
                )}
              </Button>

              {/* Volume */}
              <div 
                className="flex items-center gap-1.5"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMuteToggle}
                  className="text-white hover:bg-white/10 p-2 h-auto rounded transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5 md:w-4 md:h-4" />
                  ) : (
                    <Volume2 className="w-5 h-5 md:w-4 md:h-4" />
                  )}
                </Button>
                
                <div className={`hidden md:block overflow-hidden transition-all duration-200 ${showVolumeSlider ? 'w-16 opacity-100' : 'w-0 opacity-0'}`}>
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    onValueChange={([value]) => {
                      const newVolume = value / 100;
                      onVolumeChange(newVolume);
                    }}
                    max={100}
                    step={1}
                    className="cursor-pointer [&_[role=slider]]:bg-white [&_[role=slider]]:w-2.5 [&_[role=slider]]:h-2.5 [&>span]:bg-white/80"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Quality */}
              {qualityLevels.length > 0 && (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10 p-2 h-auto rounded transition-colors"
                    >
                      <Settings className="w-5 h-5 md:w-4 md:h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end"
                    side="top"
                    className="bg-black/90 backdrop-blur-lg border-white/5 min-w-[120px] z-[9999] rounded-lg"
                    sideOffset={8}
                  >
                    <div className="px-3 py-2 text-[10px] font-semibold text-white/50 uppercase tracking-wide">
                      Quality
                    </div>
                    {qualityLevels.map((level, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => onQualityChange(level.level)}
                        className={`text-white hover:bg-white/10 cursor-pointer px-3 py-2 text-sm transition-colors ${
                          currentQuality === level.level ? 'bg-white/5' : ''
                        }`}
                      >
                        {getQualityLabel(level)}
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
                className="text-white hover:bg-white/10 p-2 h-auto rounded transition-colors"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5 md:w-4 md:h-4" />
                ) : (
                  <Maximize className="w-5 h-5 md:w-4 md:h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};