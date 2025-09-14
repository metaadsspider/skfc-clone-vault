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
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onPlayPause}
              className="text-white hover:bg-white/20 p-2"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
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
                className="text-white hover:bg-white/20 p-2"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              
              {showVolumeSlider && (
                <div className="w-20">
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

          <div className="flex items-center space-x-4">
            {/* Quality selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black/90 border-white/20">
                <div className="px-2 py-1 text-xs font-semibold text-white/70">Quality</div>
                {qualityLevels.map((level, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => onQualityChange(level.level)}
                    className={`text-white hover:bg-white/20 cursor-pointer ${
                      currentQuality === level.level ? 'bg-red-600/50' : ''
                    }`}
                  >
                    {getQualityLabel(level)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onFullscreen}
              className="text-white hover:bg-white/20 p-2"
            >
              <Maximize className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};