import { Rnd } from "react-rnd";
import { AlertCardData, Overlay } from "@/types";
import { MapPin } from "lucide-react";

type Props = {
  overlays: Overlay[];
  onChange: (ov: Overlay) => void;
  onDelete: (id: string) => void;
};

const stylePresets: Record<string, React.CSSProperties> = {
  alert:   { background: "#EF4444", color: "white", fontWeight: 700, padding: "4px 8px", borderRadius: 6 },
  warning: { background: "#F59E0B", color: "black", fontWeight: 700, padding: "4px 8px", borderRadius: 6 },
  safe:    { background: "#10B981", color: "white", fontWeight: 700, padding: "4px 8px", borderRadius: 6 },
  live:    { background: "#22C55E", color: "white", fontWeight: 700, padding: "4px 8px", borderRadius: 6 },
};

const AlertCardOverlay = ({ data }: { data: AlertCardData}) => {
  // This component is correct and does not need changes
  if (!data) return null;
  return (
    <div className="w-full h-full bg-white/80 backdrop-blur-sm p-3 rounded-md text-gray-800 shadow-lg text-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <MapPin className="w-4 h-4 text-gray-600" />
          <h4 className="font-bold">{data.title}</h4>
        </div>
        <div className="flex justify-around border-y border-gray-200 py-2">
          {data.stats?.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xs text-gray-500">{stat.label}</div>
              <div className={`flex items-center justify-center font-semibold ${stat.alert ? 'text-red-500' : ''}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
       <div className="flex justify-between items-center mt-2">
          <div className="text-xs font-bold text-yellow-900 bg-yellow-400 px-2 py-0.5 rounded">
              {data.activeAlert}
          </div>
          <div className="text-xs font-semibold text-red-500">{data.time}</div>
       </div>
    </div>
  );
};

export default function OverlayCanvas({ overlays, onChange, onDelete }: Props) {
  return (
    <>
      {overlays.map((o) => (
        <Rnd
          key={o.id}
          // The Rnd component now directly controls its own size and position
          size={{ width: o.width, height: o.height }}
          position={{ x: o.x, y: o.y }}
          bounds="parent"
          // --- THIS IS THE FIX for dragging and resizing ---
          onDragStop={(_, d) => onChange({ ...o, x: d.x, y: d.y })}
          onResizeStop={(_, __, ref, ___, pos) =>
            onChange({ ...o, width: ref.offsetWidth, height: ref.offsetHeight, x: pos.x, y: pos.y })
          }
          style={{ zIndex: o.zIndex }}
          // Add a specific class to the drag handle to isolate it
          dragHandleClassName="drag-handle"
        >
          {/* The content of the overlay is the drag handle */}
          <div className="drag-handle relative h-full w-full flex items-center justify-center">
            {o.type === "text" ? (
              <span style={stylePresets[o.style] || { background: "rgba(0,0,0,.5)", color: "#fff", padding: 6 }}>
                {o.text}
              </span>
            ) : o.type === "alert-card" ? (
              <AlertCardOverlay data={o.data} />
            ) : o.type === "image" ? (
              <img src={o.imageUrl} alt="overlay" className="h-full w-full object-contain" />
            ) : null}
          </div>

          {/* This button is NOT part of the drag handle, so its click is isolated */}
          <button
            onClick={() => onDelete(o.id)}
            className="absolute -top-2 -right-2 bg-black/70 text-white pb-[0.2rem] rounded-full w-5 h-5 flex items-center justify-center z-10"
            title="Delete"
          >
            &times;
          </button>
        </Rnd>
      ))}
    </>
  );
}