import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { startStream } from "@/lib/api";
import PlayerWithOverlays from "./PlayerWithOverlays";

const HeroSection = () => {
  const [inputValue, setInputValue] = useState("");
  const [streamId, setStreamId] = useState<string | null>(null);
  const [hlsUrl, setHlsUrl] = useState<string | null>(null);

  const handleStart = async () => {
    try {
      const { streamId, hlsUrl } = await startStream(inputValue);
      setStreamId(streamId);
      setHlsUrl(hlsUrl);
    } catch (err) {
      console.error(err);
      alert("Failed to start stream");
    }
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
          {/* Always render the player */}
          <PlayerWithOverlays streamUrl={hlsUrl} streamId={streamId} />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
