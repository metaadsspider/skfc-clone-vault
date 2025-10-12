import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';
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
  onQualityChange
}: CustomVideoControlsProps) => {
  const [showControls, setShowControls] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    hideControlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, []);

  const getQualityLabel = (level: any) => {
    if (level.height) {
      return `${level.height}p`;
    }
    return 'Auto';
  };

  return (
    <div 
      className="absolute inset-0 z-20"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main play/pause overlay */}
      <div 
        className="absolute inset-0 flex items-center justify-center cursor-pointer"
        onClick={onPlayPause}
      >
        {!isPlaying && (
          <div className="bg-black/60 rounded-full p-4 transition-all hover:bg-black/80">
            <Play className="w-12 h-12 text-white fill-white" />
          </div>
        )}
      </div>

      {/* Controls overlay */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 md:p-6 backdrop-blur-sm transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Control buttons */}
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onPlayPause}
              className="text-white hover:bg-white/20 hover:scale-110 transition-all duration-200 p-1.5 md:p-2 rounded-full"
            >
              {isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6" /> : <Play className="w-5 h-5 md:w-6 md:h-6" />}
            </Button>

            {/* Volume */}
            <div 
              className="flex items-center space-x-2"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onMuteToggle}
                className="text-white hover:bg-white/20 hover:scale-110 transition-all duration-200 p-1.5 md:p-2 rounded-full"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
              </Button>
              
              {showVolumeSlider && (
                <div className="hidden md:block w-16 lg:w-20">
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    onValueChange={([value]) => onVolumeChange(value / 100)}
                    max={100}
                    step={1}
                    className="cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Quality selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 hover:scale-110 transition-all duration-200 p-1.5 md:p-2 rounded-full"
                >
                  <Settings className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black/95 backdrop-blur-md border-white/20 shadow-xl">
                <div className="px-3 py-2 text-xs font-semibold text-white/70 border-b border-white/10">Quality Settings</div>
                {qualityLevels.map((level, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => onQualityChange(level.level)}
                    className={`text-white hover:bg-white/20 cursor-pointer transition-colors px-3 py-2 ${
                      currentQuality === level.level ? 'bg-fc-green/50 font-semibold' : ''
                    }`}
                  >
                    {getQualityLabel(level)}
                    {currentQuality === level.level && <span className="ml-2">✓</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onFullscreen}
              className="text-white hover:bg-white/20 hover:scale-110 transition-all duration-200 p-1.5 md:p-2 rounded-full"
            >
              <Maximize className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};