import { Rnd } from "react-rnd";
import { Overlay } from "@/types";

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

export default function OverlayCanvas({ overlays, onChange, onDelete }: Props) {
  return (
    <>
      {overlays.map((o) => (
        <Rnd
          key={o.id}
          size={{ width: o.width, height: o.height }}
          position={{ x: o.x, y: o.y }}
          bounds="parent"
          onDragStop={(_, d) => onChange({ ...o, x: d.x, y: d.y })}
          onResizeStop={(_, __, ref, ___, pos) =>
            onChange({ ...o, width: ref.offsetWidth, height: ref.offsetHeight, x: pos.x, y: pos.y })
          }
          style={{ zIndex: o.zIndex, position: "absolute" }}
        >
          <div className="relative h-full w-full flex items-center justify-center">
            {o.type === "text" ? (
              <span style={stylePresets[o.style] || { background: "rgba(0,0,0,.5)", color: "#fff", padding: 6 }}>
                {o.text}
              </span>
            ) : (
              <img src={o.imageUrl} alt="overlay" className="h-full w-full object-contain" />
            )}
            <button
              onClick={() => onDelete(o.id)}
              className="absolute -top-2 -right-2 bg-black/70 text-white text-xs px-1 rounded"
              title="Delete"
            >×</button>
          </div>
        </Rnd>
      ))}
    </>
  );
}
