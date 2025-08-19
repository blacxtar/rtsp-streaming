# 📹 Real-time Video Stream Safety Monitor

A full-stack application designed to play, monitor, and annotate live video streams from any RTSP source.  
It provides a robust backend for video processing and a dynamic frontend for user interaction — all containerized with **Docker** for simple setup and deployment.

---

## ✨ Key Features

- **RTSP → HLS Conversion**: Converts any RTSP stream into a browser-playable HLS format in real-time.  
- **Live Player Controls**: Play, Pause, Resume, and Volume adjustment for smooth viewing.  
- **Dynamic Overlays**: Add text, images, or alert cards on top of the live video.  
- **Persistent State**: overlays are stored in **MongoDB**.  
- **Fully Dockerized**: Frontend (React), Backend (Flask), Nginx, and MongoDB run with one command.  

---

## 🛠 Tech Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui  
- **Backend**: Python (Flask)  
- **Database**: MongoDB  
- **Video Processing**: FFmpeg  
- **Reverse Proxy / Static**: Nginx  
- **Containerization**: Docker & Docker Compose  

---

## 🚀 Setup & Installation

### 1. Prerequisites
- [Docker](https://www.docker.com/)  
- [Docker Compose](https://docs.docker.com/compose/)  

### 2. Clone Repository
```bash
git clone https://github.com/blacxtar/rtsp-streaming.git
cd rtsp-streaming
```

### 3. Run with Docker Compose
```bash
docker-compose up --build
```

### 4. Access the App
Open your browser at:  
👉 [http://localhost:3000](http://localhost:3000)

---

## 📖 How to Use

### 1. Start a Stream
- Enter a valid **RTSP URL** on the landing page.  
- Click **"Stream now"**.  
- Example public test streams (from [RTSP.stream](https://rtsp.stream)):  
  - `rtsp://rtspstream:_tqP19AbCJ8XcOcTgiJuf@zephyr.rtsp.stream/people`  
  - `rtsp://rtspstream:_tqP19AbCJ8XcOcTgiJuf@zephyr.rtsp.stream/traffic`  
  - `rtsp://rtspstream:_tqP19AbCJ8XcOcTgiJuf@zephyr.rtsp.stream/movie`  

### 2. Manage Overlays
- **Add Overlay**: Click *"Add Overlay"*, select type (Text, Image, Alert).  
- **Move / Resize**: Drag to move, resize with handles.  
- **Delete Overlay**: Click the × icon.  
- Overlays auto-save in MongoDB.  

---

## 🔌 API Documentation

### Stream Endpoints
- **POST** `/api/streams/start` → Start new stream  
  ```json
  { "rtspUrl": "string" }
  ```
- **POST** `/api/streams/pause/<stream_id>` → Pause stream  
- **POST** `/api/streams/resume/<stream_id>` → Resume stream  
- **POST** `/api/streams/stop/<stream_id>` → Stop stream  
- **GET** `/api/streams` → List all streams  
- **GET** `/api/streams/status/<stream_id>` → Get stream status  

### Overlay Endpoints
- **GET** `/api/overlays?streamId=<id>` → List overlays  
- **POST** `/api/overlays` → Create overlay  
- **PUT** `/api/overlays/<overlay_id>` → Update overlay  
- **DELETE** `/api/overlays/<overlay_id>` → Delete overlay  

---

## 🐳 Docker Services

- **frontend** → React + Vite  
- **backend** → Flask + FFmpeg  
- **db** → MongoDB  
- **nginx** → Reverse proxy + static serving  

Bring everything up with:
```bash
docker-compose up --build
```

Stop with:
```bash
docker-compose down
```

---

## 📌 Notes
- Browsers can’t play RTSP directly. We convert RTSP → HLS using **FFmpeg** in the backend.  
- VLC or `rtsp.stream` can provide you with test RTSP URLs.  
 
---

## 👤 Author
- Developed by **[Salman Ahmad]** 🚀  
