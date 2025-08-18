import VideoPlayer from "./VideoPlayer";

interface PlayerWithOverlaysProps {
  streamUrl: string | null;
  streamId: string | null;
}

const PlayerWithOverlays: React.FC<PlayerWithOverlaysProps> = ({ streamUrl, streamId }) => {
  return (
    <div className="relative">
      {/* Video */}
      <VideoPlayer streamUrl={streamUrl} />

      {/* Overlay Example */}
      {streamId && (
        <div className="absolute top-2 left-2 bg-black/60 text-white px-3 py-1 rounded-lg text-sm">
          Stream ID: {streamId}
        </div>
      )}
    </div>
  );
};

export default PlayerWithOverlays;
