export type StreamInfo = {
  streamId: string;
  hlsUrl: string;
};

export interface Overlay {
  id: string;
  streamId: string;
  type: "text" | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  text?: string;
  style?: "alert" | "warning" | "safe" | "live";
  imageUrl?: string;
}

