import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { startStream } from "@/lib/api";
import PlayerWithOverlays from "./PlayerWithOverlays";
import OverlayManager from "./OverlayManager";
import { Overlay } from "@/types";

const HeroSection = () => {
  const [inputValue, setInputValue] = useState("");
  const [streamId, setStreamId] = useState<string | null>(null);
  const [hlsUrl, setHlsUrl] = useState<string | null>(null);
  const [overlays, setOverlays] = useState<Overlay[]>([]);

  const handleStart = async () => {
    try {
      const { streamId, hlsUrl } = await startStream(inputValue);
      setStreamId(streamId);
      setHlsUrl(hlsUrl);
      setOverlays([]); // Reset overlays for new stream
    } catch (err) {
      console.error(err);
      alert("Failed to start stream");
    }
  };

  const handleAddOverlay = (overlay: Overlay) => {
    setOverlays(prev => [...prev, overlay]);
  };

  const handleUpdateOverlay = (updatedOverlay: Overlay) => {
    setOverlays(prev => prev.map(overlay => 
      overlay.id === updatedOverlay.id ? updatedOverlay : overlay
    ));
  };

  const handleDeleteOverlay = (id: string) => {
    setOverlays(prev => prev.filter(overlay => overlay.id !== id));
  };

  return (
    <section className="w-full pt-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-8">
          <span className="gradient-text">Real-time alerts for safety</span>
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Enter your RTSP URL..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="pl-10 h-12 text-base border-2"
            />
          </div>
          <Button onClick={handleStart} className="h-12 px-8 gradient-button">
            Stream now
          </Button>
        </div>

        <div className="mt-12">
          <PlayerWithOverlays 
            streamUrl={hlsUrl} 
            streamId={streamId}
            overlays={overlays}
            onUpdateOverlay={handleUpdateOverlay}
            onDeleteOverlay={handleDeleteOverlay}
          />
        </div>

        {/* Overlay Manager */}
        <OverlayManager 
          streamId={streamId}
          onAddOverlay={handleAddOverlay}
        />
      </div>
    </section>
  );
};

export default HeroSection;