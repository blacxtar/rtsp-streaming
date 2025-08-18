import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
// Import all necessary API functions and the base URL
import { 
  startStream, 
  getOverlays, 
  createOverlay, 
  updateOverlay, 
  deleteOverlay,
  getStreamList,
  API_BASE
} from "@/lib/api";
import PlayerWithOverlays from "./PlayerWithOverlays";
import OverlayManager from "./OverlayManager";
import { Overlay } from "@/types";
import StreamList, { Stream } from "./StreamList"; // Import the Stream type

const HeroSection = () => {
  const [inputValue, setInputValue] = useState("");
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);
  const [hlsUrl, setHlsUrl] = useState<string | null>(null);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- New state for the list of all available streams ---
  const [allStreams, setAllStreams] = useState<Stream[]>([]);
  const [isListLoading, setIsListLoading] = useState(true);

  // --- New effect to fetch the list of streams on component mount ---
  useEffect(() => {
    const fetchStreamList = async () => {
      try {
        const streams = await getStreamList();
        setAllStreams(streams);
      } catch (err) {
        console.error("Failed to fetch stream list:", err);
      } finally {
        setIsListLoading(false);
      }
    };
    fetchStreamList();
  }, []);

  // Effect to fetch overlays whenever the activeStreamId changes
  useEffect(() => {
    if (!activeStreamId) {
      setOverlays([]); // Clear overlays if there's no stream
      return;
    }

    const fetchOverlays = async () => {
      try {
        const existingOverlays = await getOverlays(activeStreamId);
        setOverlays(existingOverlays);
      } catch (err) {
        console.error("Failed to fetch overlays:", err);
      }
    };

    fetchOverlays();
  }, [activeStreamId]);


  const handleStart = async () => {
    setIsLoading(true);
    try {
      const { streamId, hlsUrl } = await startStream(inputValue);
      setActiveStreamId(streamId);
      setHlsUrl(hlsUrl);
      // Refresh the list to include the new stream
      const streams = await getStreamList();
      setAllStreams(streams);
    } catch (err) {
      console.error(err);
      alert("Failed to start stream");
      setActiveStreamId(null);
      setHlsUrl(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // --- New handler for selecting a stream from the list ---
  const handleStreamSelect = (id: string) => {
    const selectedStream = allStreams.find(stream => stream.streamId === id);
    if (selectedStream) {
      setActiveStreamId(selectedStream.streamId);
      // Construct the full HLS URL from the relative path provided by the API
      const fullHlsUrl = API_BASE.replace("/api", "") + selectedStream.hlsUrl;
      setHlsUrl(fullHlsUrl);
    }
  };

  const handleAddOverlay = async (overlay: Omit<Overlay, 'id'>) => {
    if (!activeStreamId) return;
    const id = activeStreamId
    try {
      await createOverlay({ ...overlay, id });
      const updatedOverlays = await getOverlays(activeStreamId);
      setOverlays(updatedOverlays);
    } catch (err) {
      console.error("Failed to add overlay:", err);
      alert("Error: Could not add overlay.");
    }
  };

  const handleUpdateOverlay = async (updatedOverlay: Overlay) => {
    try {
      await updateOverlay(updatedOverlay);
      setOverlays(prev => prev.map(o => o.id === updatedOverlay.id ? updatedOverlay : o));
    } catch (err) {
      console.error("Failed to update overlay:", err);
      alert("Error: Could not update overlay.");
    }
  };

  const handleDeleteOverlay = async (id: string) => {
    try {
      await deleteOverlay(id);
      setOverlays(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      console.error("Failed to delete overlay:", err);
      alert("Error: Could not delete overlay.");
    }
  };

  return (
    <section className="w-full pt-8 pb-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-8">
          <span className="gradient-text">Real-time alerts for safety</span>
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Enter a new RTSP URL to stream..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="pl-10 h-12 text-base border-2"
              disabled={isLoading}
            />
          </div>
          <Button onClick={handleStart} className="h-12 px-8 gradient-button" disabled={isLoading}>
            {isLoading ? "Starting..." : "Stream now"}
          </Button>
        </div>

        {/* Player and Overlay Manager only show when a stream is active */}
        {activeStreamId && (
          <>
            <div className="mt-12">
              <PlayerWithOverlays 
                streamUrl={hlsUrl} 
                streamId={activeStreamId}
                overlays={overlays}
                onUpdateOverlay={handleUpdateOverlay}
                onDeleteOverlay={handleDeleteOverlay}
              />
            </div>
            
            <OverlayManager 
              streamId={activeStreamId}
              onAddOverlay={handleAddOverlay}
            />
          </>
        )}
        
        {/* --- Render the StreamList component --- */}
        <div className="mt-12">
          {isListLoading ? (
            <p className="text-muted-foreground">Loading existing streams...</p>
          ) : (
            <StreamList 
              streams={allStreams} 
              activeStreamId={activeStreamId}
              onStreamSelect={handleStreamSelect}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;