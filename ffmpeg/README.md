# FFmpeg Video Processor

> Auto-scalable video processing library powered by **FFmpeg** and **Node.js** — covering the 10 most common FFmpeg use-cases with a real-time dashboard.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![FFmpeg](https://img.shields.io/badge/FFmpeg-required-007808?logo=ffmpeg)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

| # | Use Case | Description |
|---|----------|-------------|
| 1 | **Convert Format** | MP4→MP3, AVI→MKV, and any format FFmpeg supports |
| 2 | **Extract Audio** | Strip the audio track from any video |
| 3 | **Resize Video** | Scale to specific dimensions (e.g. 1280×720) |
| 4 | **Add Subtitles** | Burn SRT subtitles into a video |
| 5 | **Create Slideshow** | Generate a video from a sequence of images |
| 6 | **Extract Frames** | Pull frames at intervals as PNG/JPG |
| 7 | **Change Speed** | Speed up or slow down video & audio |
| 8 | **Concatenate Videos** | Join multiple videos into one |
| 9 | **Stream Video** | Live streaming via HLS or RTMP |
| 10 | **Rotate Video** | Rotate 90° / 180° / 270° |

### 🔄 Auto-Scaling Worker Pool
- Dynamically scales FFmpeg workers (2 → CPU cores) based on queue pressure
- FIFO job queue with real-time progress tracking
- Event-driven architecture with Server-Sent Events

### 🎨 Dashboard
- Dark glassmorphism UI with animated gradients
- Drag-and-drop file upload
- Live job queue with progress bars
- System health monitoring

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **FFmpeg** installed and on `PATH` ([download](https://ffmpeg.org/download.html))

### Install & Run

```bash
npm install
npm start
```

Open **http://localhost:3000** in your browser.

### Development (auto-restart)

```bash
npm run dev
```

## 📡 REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/jobs` | Submit a new job (multipart upload) |
| `GET` | `/api/jobs` | List all jobs |
| `GET` | `/api/jobs/:id` | Get job details |
| `GET` | `/api/jobs/:id/download` | Download processed file |
| `DELETE` | `/api/jobs/:id` | Cancel a queued job |
| `GET` | `/api/events` | SSE stream for real-time updates |
| `GET` | `/api/system` | System & pool stats |
| `GET` | `/api/usecases` | Available use-case metadata |

### Example: Convert Format via cURL

```bash
curl -X POST http://localhost:3000/api/jobs \
  -F "files=@input.mp4" \
  -F "type=convertFormat" \
  -F 'options={"audioCodec":"aac","videoBitrate":"1M"}'
```

## 🏗 Architecture

```
src/
├── api/
│   └── server.js          # Express REST API + SSE
├── lib/
│   ├── FFmpegEngine.js    # FFmpeg process spawner + progress parser
│   ├── WorkerPool.js      # Auto-scaling concurrent worker pool
│   └── JobManager.js      # Job lifecycle state machine
└── usecases/
    ├── index.js           # Use-case registry & UI param schemas
    ├── convertFormat.js
    ├── extractAudio.js
    ├── resizeVideo.js
    ├── addSubtitles.js
    ├── createSlideshow.js
    ├── extractFrames.js
    ├── changeSpeed.js
    ├── concatenateVideos.js
    ├── streamVideo.js
    └── rotateVideo.js
public/
└── index.html             # Dashboard (single-file, no build step)
```

## License
MIT
