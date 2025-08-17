import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react";

const VideoPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume[0] / 100;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (newProgress: number[]) => {
    if (videoRef.current) {
      const newTime = (newProgress[0] / 100) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section className="w-full py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-card rounded-xl shadow-2xl overflow-hidden">
          {/* Video Element */}
          <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
            >
              {/* Placeholder for demo - in real app you'd have actual video source */}
              <source src="/demo-video.mp4" type="video/mp4" />
            </video>
            
            {/* Video Overlay - Demo placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-safety-green/20 to-safety-blue/20 flex items-center justify-center">
              <div className="text-center text-white p-8">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-10 h-10 ml-1" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Safety Monitoring Demo</h3>
                <p className="text-lg opacity-90">Real-time worker safety detection</p>
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="bg-card border-t border-border p-4">
            <div className="flex items-center gap-4">
              {/* Play/Pause Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlayPause}
                className="w-10 h-10 p-0 hover:bg-muted"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </Button>
              
              {/* Time Display */}
              <span className="text-sm text-muted-foreground font-mono min-w-[80px]">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              
              {/* Progress Bar */}
              <div className="flex-1 px-2">
                <Slider
                  value={[progress]}
                  onValueChange={handleProgressChange}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
              </div>
              
              {/* Volume Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="w-8 h-8 p-0 hover:bg-muted"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
                
                <div className="w-20">
                  <Slider
                    value={volume}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Fullscreen Button */}
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 hover:bg-muted"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoPlayer;