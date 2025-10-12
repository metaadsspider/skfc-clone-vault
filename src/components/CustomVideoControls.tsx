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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const updateBuffered = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('durationchange', updateDuration);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('progress', updateBuffered);

    // Check fullscreen status
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('durationchange', updateDuration);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('progress', updateBuffered);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [videoRef]);

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

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current && duration > 0) {
      videoRef.current.currentTime = (value[0] / 100) * duration;
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferProgress = duration > 0 ? (buffered / duration) * 100 : 0;

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
      {/* Premium Center Play Button */}
      <div 
        className="absolute inset-0 flex items-center justify-center cursor-pointer"
        onClick={onPlayPause}
      >
        {!isPlaying && (
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-sm rounded-full p-5 transition-all group-hover:scale-110 shadow-2xl">
              <Play className="w-12 h-12 text-gray-900 fill-gray-900 ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Premium Controls Bar */}
      <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${showControls || !isPlaying ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none"></div>
        
        <div className="relative px-4 pb-4 pt-8 space-y-3">
          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="relative h-1 bg-white/20 rounded-full overflow-hidden group cursor-pointer">
              {/* Buffered Progress */}
              <div 
                className="absolute inset-y-0 left-0 bg-white/30 transition-all"
                style={{ width: `${bufferProgress}%` }}
              ></div>
              
              {/* Playback Progress */}
              <div className="relative h-full">
                <Slider
                  value={[progress]}
                  onValueChange={handleSeek}
                  max={100}
                  step={0.1}
                  className="w-full cursor-pointer [&_[role=slider]]:bg-white [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-lg [&_[role=slider]]:opacity-0 [&_[role=slider]]:group-hover:opacity-100 [&_[role=slider]]:transition-opacity [&>span]:bg-gradient-to-r [&>span]:from-blue-500 [&>span]:to-purple-500 [&>span]:h-full"
                />
              </div>
            </div>
            
            {/* Time Display */}
            <div className="flex justify-between text-xs text-white/80 font-medium px-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        
          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onPlayPause}
                className="text-white hover:bg-white/20 hover:scale-110 p-2 transition-all rounded-full"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>

              {/* Volume Control */}
              <div 
                className="flex items-center space-x-2 group"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMuteToggle}
                  className="text-white hover:bg-white/20 hover:scale-110 p-2 transition-all rounded-full"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                
                <div className={`overflow-hidden transition-all duration-300 ${showVolumeSlider ? 'w-24 opacity-100' : 'w-0 opacity-0'}`}>
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    onValueChange={([value]) => onVolumeChange(value / 100)}
                    max={100}
                    step={1}
                    className="cursor-pointer [&_[role=slider]]:bg-white [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&>span]:bg-white"
                  />
                </div>
              </div>

              {/* Live Badge (optional) */}
              <div className="hidden sm:flex items-center px-3 py-1 bg-red-600 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                <span className="text-white text-xs font-bold">LIVE</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Quality Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 hover:scale-110 p-2 transition-all rounded-full group"
                  >
                    <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="bg-black/95 backdrop-blur-xl border border-white/20 shadow-2xl min-w-[120px]"
                >
                  <div className="px-3 py-2 text-xs font-bold text-white/60 uppercase tracking-wider border-b border-white/10">
                    Quality
                  </div>
                  {qualityLevels.map((level, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => onQualityChange(level.level)}
                      className={`text-white hover:bg-white/20 cursor-pointer px-3 py-2 transition-colors ${
                        currentQuality === level.level ? 'bg-gradient-to-r from-blue-600/50 to-purple-600/50 font-semibold' : ''
                      }`}
                    >
                      <span className="flex items-center justify-between w-full">
                        {getQualityLabel(level)}
                        {currentQuality === level.level && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
                        )}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Fullscreen Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onFullscreen}
                className="text-white hover:bg-white/20 hover:scale-110 p-2 transition-all rounded-full"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};