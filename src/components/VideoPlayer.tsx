import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, Maximize2, AlertCircle } from "lucide-react";
import Hls from "hls.js";

type Props = {
  streamUrl: string | null;
};

const VideoPlayer = ({ streamUrl }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [streamError, setStreamError] = useState<string | null>(null);

  // attach hls.js and handle stream loading
  useEffect(() => {
    if (!videoRef.current || !streamUrl) return;

    // Reset state for new stream
    setStreamError(null);
    setIsLive(false);

    let hls: Hls;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(videoRef.current);

      // Add error handling
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("HLS fatal network error encountered", data);
              setStreamError("Network error. Please check your connection.");
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("HLS fatal media error encountered", data);
              setStreamError("Media error. The stream may be corrupt or unavailable.");
              hls.recoverMediaError();
              break;
            default:
              setStreamError("An unknown error occurred with the stream.");
              hls.destroy();
              break;
          }
        }
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (e.g., Safari)
      videoRef.current.src = streamUrl;
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [streamUrl]);

  // keep state in sync with video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setIsMuted(video.muted);
      setVolume([video.volume * 100]);
    };
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      // Check for live stream
      if (video.duration === Infinity) {
        setIsLive(true);
      }
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    // Start playing on mount if autoPlay is intended
    if (video.autoplay) {
        video.play().catch(() => {
            console.warn("Autoplay was prevented by the browser.");
        });
    }

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  // --- CONTROL HANDLERS ---

  const togglePlayPause = async () => {
    const video = videoRef.current;
    console.log("Toggle pause")
    if (!video) return;
    if (video.paused) {
      try {
        await video.play();
      } catch (error) {
        console.error("Playback was prevented.", error);
        setStreamError("Playback failed. Please click to play.");
      }
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) videoRef.current.muted = !videoRef.current.muted;
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    const volumeValue = newVolume[0] / 100;
    video.volume = volumeValue;
    // Unmute if user adjusts volume while muted
    if (volumeValue > 0 && video.muted) {
      video.muted = false;
    }
  };

  const handleProgressChange = (newProgress: number[]) => {
    if (videoRef.current && duration > 0 && !isLive) {
      videoRef.current.currentTime = (newProgress[0] / 100) * duration;
    }
  };

  // --- UTILS & DERIVED STATE ---

  const formatTime = (time: number) => {
    if (!time || isNaN(time) || time === Infinity) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 && !isLive ? (currentTime / duration) * 100 : 0;

  // --- RENDER ---

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-card rounded-xl shadow-2xl overflow-hidden group">
      <div className="relative aspect-video bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          controls={false}
          autoPlay
          playsInline 
          muted// Important for iOS
          // Autoplay is more likely to succeed if muted initially
        />
        {/* Overlays */}
        {!streamUrl && !streamError && (
          <span className="absolute text-white text-lg font-semibold">
            Waiting for stream...
          </span>
        )}
        {streamError && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white p-4">
            <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
            <p className="font-semibold text-lg">Stream Error</p>
            <p className="text-center">{streamError}</p>
          </div>
        )}
      </div>

      {/* Controls - only show if there's a stream and no fatal error */}
      {streamUrl && !streamError && (
<div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300">
          {/* Progress Bar - Full Width */}
          {!isLive && (
             <Slider
                value={[progress]}
                onValueChange={handleProgressChange}
                max={100}
                step={0.1}
                className="w-full h-1.5 [&>span:first-child]:h-full"
              />
          )}

          {/* Main Controls Row */}
          <div className="flex items-center gap-4 mt-2">
            <Button variant="ghost" size="sm" onClick={togglePlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? <Pause className="text-white"/> : <Play className="text-white"/>}
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
                {isMuted || volume[0] === 0 ? <VolumeX className="text-white"/> : <Volume2 className="text-white"/>}
              </Button>
              <Slider
                value={volume}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-20"
              />
            </div>

            <div className="flex-1 flex items-center gap-2 text-white">
              {isLive ? (
                <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                  LIVE
                </div>
              ) : (
                <span className="text-sm font-mono min-w-[90px]">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => videoRef.current?.requestFullscreen()}
              aria-label="Fullscreen"
            >
              <Maximize2 className="text-white"/>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;