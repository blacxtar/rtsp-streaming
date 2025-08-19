export type StreamInfo = {
  streamId: string;
  hlsUrl: string;
};

export interface AlertCardData {
  title: string;
  stats: {
    label: string;
    value: string;
    icon: React.ElementType; // Represents a component like <MapPin />
    alert?: boolean;
  }[];
  activeAlert: string;
  time: string;
}

// 2. Define a base for all overlays
interface OverlayBase {
  id: string;
  streamId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

// 3. Define each overlay type specifically
interface TextOverlay extends OverlayBase {
  type: "text";
  text: string;
  style: "alert" | "warning" | "safe" | "live";
}

interface ImageOverlay extends OverlayBase {
  type: "image";
  imageUrl: string;
}

interface AlertCardOverlay extends OverlayBase {
  type: "alert-card";
  data: AlertCardData; // Use the specific type here instead of 'any'
}

// 4. Combine them into a single, powerful type
export type Overlay = TextOverlay | ImageOverlay | AlertCardOverlay;

