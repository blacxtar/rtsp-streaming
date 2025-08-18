import VideoPlayer from "./VideoPlayer";
import OverlayCanvas from "./OverlayCanvas";
import { Overlay } from "@/types";

interface PlayerWithOverlaysProps {
  streamUrl: string | null;
  streamId: string | null;
  overlays: Overlay[];
  onUpdateOverlay: (overlay: Overlay) => void;
  onDeleteOverlay: (id: string) => void;
}

const PlayerWithOverlays: React.FC<PlayerWithOverlaysProps> = ({ 
  streamUrl, 
  streamId, 
  overlays, 
  onUpdateOverlay, 
  onDeleteOverlay 
}) => {
  return (
    <div className="relative">
      {/* Video Player */}
      <VideoPlayer streamUrl={streamUrl} />

      {/* Stream ID Overlay */}
      {streamId && (
        <div className="absolute top-2 left-2 bg-black/60 text-white px-3 py-1 rounded-lg text-sm z-50">
          Stream ID: {streamId}
        </div>
      )}

      {/* Draggable Overlays */}
      {streamId && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="relative w-full h-full pointer-events-auto">
            <OverlayCanvas
              overlays={overlays}
              onChange={onUpdateOverlay}
              onDelete={onDeleteOverlay}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerWithOverlays;