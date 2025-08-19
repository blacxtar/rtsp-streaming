import { Overlay } from "@/types";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";



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


export async function getStreamList() {
  const res = await fetch(`${API_BASE}/streams`);
  if (!res.ok) {
    throw new Error("Failed to fetch stream list");
  }
  const responseData = await res.json();
  
  return responseData.data || []; 
}

export async function stopStream(streamId: string) {
  const res = await fetch(`${API_BASE}/streams/stop/${streamId}`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error("Failed to stop stream");
  }
  const responseData = await res.json();
  if (!responseData.ok) {
    throw new Error(responseData.error || "Failed to stop stream");
  }
  return responseData.data;
}

export async function pauseStream(streamId: string) {
  const res = await fetch(`${API_BASE}/streams/pause/${streamId}`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error("Failed to pause stream");
  }
  const responseData = await res.json();
  if (!responseData.ok) {
    throw new Error(responseData.error || "Failed to pause stream");
  }
  return responseData.data;
}

export async function resumeStream(streamId: string) {
  const res = await fetch(`${API_BASE}/streams/resume/${streamId}`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error("Failed to resume stream");
  }
  const responseData = await res.json();
  if (!responseData.ok) {
    throw new Error(responseData.error || "Failed to resume stream");
  }
  return responseData.data;
}


// --- Overlay CRUD ---
export async function getOverlays(streamId: string): Promise<Overlay[]> {
  const res = await fetch(`${API_BASE}/overlays?streamId=${streamId}`);
  const overlay = (await res.json()).data || []
  return  overlay
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
