# API Documentation

This document details the RESTful API for the **Real-time Video Stream Safety Monitor**.  
It covers endpoints for managing **video streams** and their associated **overlays**.

**Base URL:** `/api`

---

## Conventions

- All endpoints return a JSON envelope:
  ```json
  { "ok": true, "data": { /* payload */ } }
  ```
  On error:
  ```json
  { "ok": false, "error": "message" }
  ```
- **Content-Type:** `application/json` for requests/responses (unless otherwise stated).
- **Auth:** None (development demo). Add your own auth in production.
- **CORS:** Enabled for browser usage.

---

## Health

### Health Check
- **Endpoint:** `GET /api/health`
- **Description:** Quick service health probe.
- **Response:**
  ```json
  { "ok": true, "data": { "status": "up" } }
  ```

---

## Stream Endpoints

These endpoints control the lifecycle of video streams.

### Start a New Stream
- **Endpoint:** `POST /api/streams/start`
- **Description:** Starts a new RTSP → HLS conversion process. Returns the HLS playlist URL when created.
- **Body:**
  ```json
  { "rtspUrl": "string" }
  ```
- **Response:**
  ```json
  {
    "ok": true,
    "data": {
      "streamId": "unique-stream-id",
      "hlsUrl": "/streams/unique-stream-id/index.m3u8"
    }
  }
  ```
- **Notes:**
  - The HLS playlist may take a few seconds to appear. Poll `GET /api/streams/status/:stream_id` until `ready` is `true` before loading it in the player.

---

### Pause a Stream
- **Endpoint:** `POST /api/streams/pause/<stream_id>`
- **Description:** Pauses a running stream.
- **Response:**
  ```json
  { "ok": true, "data": { "paused": "<stream_id>" } }
  ```

> **Implementation note:** If pause/resume is not yet implemented in your backend, treat this as a future extension.

---

### Resume a Stream
- **Endpoint:** `POST /api/streams/resume/<stream_id>`
- **Description:** Resumes a paused stream.
- **Response:**
  ```json
  { "ok": true, "data": { "resumed": "<stream_id>" } }
  ```

> **Implementation note:** If pause/resume is not yet implemented in your backend, treat this as a future extension.

---

### Stop a Stream
- **Endpoint:** `POST /api/streams/stop/<stream_id>`
- **Description:** Stops a stream and deletes its associated files (and DB entry, if applicable).
- **Response:**
  ```json
  { "ok": true, "data": { "stopped": "<stream_id>" } }
  ```

---

### List All Streams
- **Endpoint:** `GET /api/streams`
- **Description:** Retrieves a list of known streams.
- **Response (example):**
  ```json
  {
    "ok": true,
    "data": [
      {
        "streamId": "unique-stream-id",
        "status": "running",
        "hlsUrl": "/streams/unique-stream-id/index.m3u8"
      }
    ]
  }
  ```

---

### Stream Status
- **Endpoint:** `GET /api/streams/status/<stream_id>`
- **Description:** Returns readiness of the HLS playlist (and optionally extra diagnostics if enabled).
- **Response (minimal):**
  ```json
  { "ok": true, "data": { "streamId": "<id>", "ready": true } }
  ```
- **Response (extended, if implemented):**
  ```json
  {
    "ok": true,
    "data": {
      "streamId": "<id>",
      "ready": true,
      "running": true,
      "segments": 6,
      "logTail": "last ffmpeg log lines (if exposed)"
    }
  }
  ```

---

### HLS Files (Static)
- **Endpoint:** `GET /streams/<stream_id>/<filename>`
- **Description:** Serves HLS playlist (`index.m3u8`) and media segments (`.ts`) for a given stream.
- **Notes:** This path is outside the `/api` prefix by design so that the player can request it directly.

---

## Overlay Endpoints

Full CRUD for overlays on a specific stream.

### List Overlays for a Stream
- **Endpoint:** `GET /api/overlays`
- **Description:** Retrieves overlays. Filter by stream with `?streamId=<stream_id>`.
- **Query Params:** `streamId` (optional)
- **Response:**
  ```json
  { "ok": true, "data": [ { /* Overlay Object */ } ] }
  ```

---

### Create a New Overlay
- **Endpoint:** `POST /api/overlays`
- **Description:** Creates a new overlay for a stream.
- **Body:** A full overlay object (see schema below).
- **Response:**
  ```json
  { "ok": true, "data": { /* Created Overlay Object */ } }
  ```

---

### Update an Overlay
- **Endpoint:** `PUT /api/overlays/<overlay_id>`
- **Description:** Updates an existing overlay (e.g., position, size, content).
- **Body:** Partial overlay fields to update, e.g.:
  ```json
  { "x": 100, "y": 150 }
  ```
- **Response:**
  ```json
  { "ok": true, "data": { /* Updated Overlay Object */ } }
  ```

---

### Delete an Overlay
- **Endpoint:** `DELETE /api/overlays/<overlay_id>`
- **Description:** Deletes a specific overlay by its ID.
- **Response:**
  ```json
  { "ok": true, "data": { "deleted": true } }
  ```

---

## Overlay Object Schema

```json
{
  "id": "string (uuid)",
  "streamId": "string (the parent stream id)",
  "type": "text | image | box",
  "style": "alert | warning | safe | live | custom",
  "x": 0, "y": 0, "width": 200, "height": 80, "zIndex": 10,
  "text": "optional string when type='text'",
  "imageUrl": "optional string when type='image'",
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp"
}
```

---

## Examples (cURL)

### Start Stream
```bash
curl -s -X POST http://localhost:5000/api/streams/start   -H 'Content-Type: application/json'   -d '{"rtspUrl":"rtsp://example.com/stream"}'
```

### Poll Status
```bash
curl -s http://localhost:5000/api/streams/status/<stream_id>
```

### Create Overlay
```bash
curl -s -X POST http://localhost:5000/api/overlays   -H 'Content-Type: application/json'   -d '{
    "streamId":"<stream_id>",
    "type":"text",
    "style":"alert",
    "x":40,"y":40,"width":320,"height":90,"zIndex":5,
    "text":"Hardhat missing!"
  }'
```

### Update Overlay
```bash
curl -s -X PUT http://localhost:5000/api/overlays/<overlay_id>   -H 'Content-Type: application/json'   -d '{"x":120,"y":200,"zIndex":8}'
```

### Delete Overlay
```bash
curl -s -X DELETE http://localhost:5000/api/overlays/<overlay_id>
```

---

## Errors

Common error structure:
```json
{ "ok": false, "error": "descriptive message" }
```

Examples:
- `400` — Missing/invalid input (e.g., no `rtspUrl`).
- `404` — Resource not found (e.g., stream ID does not exist).
- `500` — Internal server error (e.g., FFmpeg failure; check logs).

---

## Versioning

This documentation describes the current demo API. Backward-incompatible changes will bump a version tag or be noted in the changelog.
