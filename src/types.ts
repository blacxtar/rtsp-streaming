export type StreamInfo = {
  streamId: string;
  hlsUrl: string;
};

export type Overlay = {
  id: string;
  streamId: string;
  type: "text" | "image" | "box";
  text?: string;
  imageUrl?: string;
  style: "alert" | "warning" | "safe" | "live" | "custom";
  x: number; y: number; width: number; height: number; zIndex: number;
};

