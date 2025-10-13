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
      {/* Center Play Button */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
          onClick={onPlayPause}
        >
          <div className="bg-white/90 hover:bg-white rounded-full p-5 md:p-4 transition-all hover:scale-110 shadow-2xl">
            <Play className="w-14 h-14 md:w-12 md:h-12 text-black fill-black ml-1" />
          </div>
        </div>
      )}

      {/* Modern Control Bar */}
      <div 
        className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${
          showControls || !isPlaying ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent pointer-events-none"></div>
        
        <div className="relative px-3 md:px-4 pb-4 md:pb-3 pt-8 md:pt-6">
          {/* Time and Live Badge */}
          <div className="flex items-center justify-between mb-3 md:mb-2 px-1">
            <span className="text-white text-sm md:text-sm font-medium">{formatTime(currentTime)}</span>
            
            <div className="flex items-center px-3 py-1.5 md:py-1 bg-red-600 rounded">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
              <span className="text-white text-xs font-bold">LIVE</span>
            </div>
            
            <span className="text-white text-sm md:text-sm font-medium">{formatTime(duration)}</span>
          </div>
        
          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center space-x-2 md:space-x-2">
              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onPlayPause}
                className="text-white hover:bg-white/20 p-2.5 md:p-2 h-auto rounded-md"
              >
                {isPlaying ? <Pause className="w-6 h-6 md:w-5 md:h-5" /> : <Play className="w-6 h-6 md:w-5 md:h-5" />}
              </Button>

              {/* Volume Control */}
              <div 
                className="flex items-center space-x-2"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMuteToggle}
                  className="text-white hover:bg-white/20 p-2.5 md:p-2 h-auto rounded-md"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-6 h-6 md:w-5 md:h-5" /> : <Volume2 className="w-6 h-6 md:w-5 md:h-5" />}
                </Button>
                
                <div className={`hidden md:block overflow-hidden transition-all duration-300 ${showVolumeSlider ? 'w-20 opacity-100' : 'w-0 opacity-0'}`}>
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    onValueChange={([value]) => {
                      const newVolume = value / 100;
                      onVolumeChange(newVolume);
                    }}
                    max={100}
                    step={1}
                    className="cursor-pointer [&_[role=slider]]:bg-white [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&>span]:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-2 md:space-x-2">
              {/* Quality Selector */}
              {qualityLevels.length > 0 && (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 p-2.5 md:p-2 h-auto rounded-md"
                    >
                      <Settings className="w-6 h-6 md:w-5 md:h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end"
                    side="top"
                    className="bg-black/95 backdrop-blur-md border-white/20 min-w-[140px] z-[9999]"
                    sideOffset={8}
                  >
                    <div className="px-3 py-2 text-xs font-semibold text-white/60 uppercase tracking-wide border-b border-white/10">
                      Quality
                    </div>
                    {qualityLevels.map((level, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => onQualityChange(level.level)}
                        className={`text-white hover:bg-white/20 cursor-pointer transition-colors px-3 py-2.5 text-sm ${
                          currentQuality === level.level ? 'bg-white/10 font-semibold' : ''
                        }`}
                      >
                        {getQualityLabel(level)}
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
                className="text-white hover:bg-white/20 p-2.5 md:p-2 h-auto rounded-md"
              >
                {isFullscreen ? <Minimize className="w-6 h-6 md:w-5 md:h-5" /> : <Maximize className="w-6 h-6 md:w-5 md:h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};