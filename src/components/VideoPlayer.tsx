import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react";
import Hls from "hls.js";

type Props = {
  streamUrl: string | null; // HLS url from backend (can be null initially)
};

const VideoPlayer = ({ streamUrl }: Props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // attach hls.js
  useEffect(() => {
    if (!videoRef.current || !streamUrl) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(videoRef.current);
      return () => hls.destroy();
    } else {
      // Safari fallback
      videoRef.current.src = streamUrl;
    }
  }, [streamUrl]);

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
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleProgressChange = (newProgress: number[]) => {
    if (videoRef.current && duration > 0) {
      const newTime = (newProgress[0] / 100) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative bg-card rounded-xl shadow-2xl overflow-hidden">
      <div className="relative aspect-video bg-black flex items-center justify-center">
        {/* Show video or waiting message */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          controls={false}
          autoPlay
          src={!Hls.isSupported() ? streamUrl || "" : undefined}
        />
        {!streamUrl && (
          <span className="absolute text-white text-lg font-semibold">
            Waiting for stream...
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="bg-card border-t border-border p-4">
        <div className="flex items-center gap-4">
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

          <span className="text-sm text-muted-foreground font-mono min-w-[80px]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1 px-2">
            <Slider
              value={[progress]}
              onValueChange={handleProgressChange}
              max={100}
              step={0.1}
              className="w-full"
            />
          </div>

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
  );
};

export default VideoPlayer;
