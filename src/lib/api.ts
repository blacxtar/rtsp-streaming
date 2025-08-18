import { Overlay } from "@/types";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// export async function startStream(rtspUrl: string) {
//   const res = await fetch(`${API_BASE}/streams/start`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ rtspUrl }),
//   });
//   if (!res.ok) throw new Error("Failed to start stream");
//   return (await res.json()).data; // { streamId, hlsUrl }
// }

export async function startStream(rtspUrl: string) {
  // Step 1: Request backend to start the stream
  const res = await fetch(`${API_BASE}/streams/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rtspUrl }),
  });

  if (!res.ok) throw new Error("Failed to start stream");

  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Stream start failed");

  const { streamId, hlsUrl } = data.data;

  // Step 2: Poll until the HLS playlist is ready
  async function waitForReady(): Promise<string> {
    for (;;) {
      const statusRes = await fetch(`${API_BASE}/streams/status/${streamId}`);
      if (!statusRes.ok) throw new Error("Failed to check stream status");
      const statusData = await statusRes.json();

      if (statusData.ok && statusData.data.ready) {
        return API_BASE.replace("/api", "") + hlsUrl; 
        // prepend backend base URL, since hlsUrl is like "/streams/xxx/index.m3u8"
      }

      // wait 2s before retry
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  return {
    streamId,
    hlsUrl: await waitForReady(), // only resolve once playable
  };
}



// --- Overlay CRUD ---
export async function getOverlays(streamId: string): Promise<Overlay[]> {
  const res = await fetch(`${API_BASE}/overlays?streamId=${streamId}`);
  return (await res.json()).data || [];
}

export async function createOverlay(overlay: Overlay) {
  await fetch(`${API_BASE}/overlays`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(overlay),
  });
}

export async function updateOverlay(overlay: Overlay) {
  await fetch(`${API_BASE}/overlays/${overlay.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(overlay),
  });
}

export async function deleteOverlay(id: string) {
  await fetch(`${API_BASE}/overlays/${id}`, { method: "DELETE" });
}
