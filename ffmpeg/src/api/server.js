const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

const WorkerPool = require('../lib/WorkerPool');
const JobManager = require('../lib/JobManager');
const { useCases, useCaseDescriptions, useCaseParams } = require('../usecases');

// ─── Directories ────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
const OUTPUTS_DIR = path.join(__dirname, '..', '..', 'outputs');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
fs.mkdirSync(OUTPUTS_DIR, { recursive: true });

// ─── Core instances ─────────────────────────────────────────────
const pool = new WorkerPool();
const jobManager = new JobManager();

// ─── SSE clients ────────────────────────────────────────────────
const sseClients = new Set();

function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) {
    res.write(payload);
  }
}

// ─── Wire pool events to SSE + job manager ──────────────────────
pool.on('job:start', ({ jobId }) => {
  jobManager.updateStatus(jobId, 'processing');
  broadcast('job:update', jobManager.get(jobId));
});

pool.on('job:progress', ({ jobId, progress }) => {
  jobManager.updateProgress(jobId, progress);
  broadcast('job:progress', { id: jobId, progress });
});

pool.on('job:complete', ({ jobId }) => {
  jobManager.updateStatus(jobId, 'done');
  broadcast('job:update', jobManager.get(jobId));
});

pool.on('job:error', ({ jobId, error }) => {
  jobManager.updateStatus(jobId, 'failed', { error: error.message });
  broadcast('job:update', jobManager.get(jobId));
});

pool.on('pool:scaleUp', (stats) => broadcast('pool:stats', stats));
pool.on('pool:scaleDown', (stats) => broadcast('pool:stats', stats));

// ─── Express app ────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

// Multer setup – accept up to 10 files (for concatenation / slideshow)
const upload = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
});

// ─── Routes ─────────────────────────────────────────────────────

/**
 * POST /api/jobs — Submit a new processing job
 * Body (multipart/form-data):
 *   files   — one or more media files
 *   type    — use-case name (string)
 *   options — JSON string with use-case options
 */
app.post('/api/jobs', upload.array('files', 10), (req, res) => {
  try {
    const { type } = req.body;
    const options = req.body.options ? JSON.parse(req.body.options) : {};

    if (!type || !useCases[type]) {
      return res.status(400).json({ error: `Invalid use-case type: ${type}` });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Rename uploaded files to keep original extensions
    const renamedFiles = req.files.map((f) => {
      const ext = path.extname(f.originalname);
      const newPath = f.path + ext;
      fs.renameSync(f.path, newPath);
      return { ...f, path: newPath, originalname: f.originalname };
    });

    const inputPath = renamedFiles[0].path;
    const inputExt = path.extname(renamedFiles[0].originalname);

    // Determine output extension
    let outputExt = inputExt;
    if (type === 'extractAudio') outputExt = '.mp3';
    if (type === 'extractFrames') outputExt = `.${options.format || 'png'}`;
    if (type === 'streamVideo') outputExt = '.m3u8';
    if (options.outputFormat) outputExt = `.${options.outputFormat}`;

    // Create output path
    const outputFilename = `${Date.now()}_${type}${outputExt}`;
    const outputPath = path.join(OUTPUTS_DIR, outputFilename);

    // For concatenation, pass all file paths
    if (type === 'concatenateVideos') {
      options.inputs = renamedFiles.map((f) => f.path);
    }

    // Build FFmpeg arguments via the use-case builder
    const ffmpegArgs = useCases[type](inputPath, outputPath, options);

    // Create job record
    const job = jobManager.create({
      type,
      inputPath,
      outputPath,
      options,
    });

    // Enqueue in worker pool
    jobManager.updateStatus(job.id, 'queued');
    broadcast('job:update', jobManager.get(job.id));

    pool.enqueue(job.id, ffmpegArgs, { type }).catch(() => {
      // errors already handled via pool event
    });

    res.status(201).json(jobManager.get(job.id));
  } catch (err) {
    console.error('POST /api/jobs error:', err);
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/jobs — List all jobs */
app.get('/api/jobs', (_req, res) => {
  res.json(jobManager.list());
});

/** GET /api/jobs/:id — Single job */
app.get('/api/jobs/:id', (req, res) => {
  const job = jobManager.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

/** GET /api/jobs/:id/download — Download output file */
app.get('/api/jobs/:id/download', (req, res) => {
  const job = jobManager.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.status !== 'done') return res.status(400).json({ error: 'Job not completed' });
  if (!fs.existsSync(job.outputPath)) return res.status(404).json({ error: 'Output file missing' });
  res.download(job.outputPath);
});

/** DELETE /api/jobs/:id — Cancel a queued job */
app.delete('/api/jobs/:id', (req, res) => {
  const job = jobManager.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.status === 'queued') {
    pool.cancelQueued(job.id);
    jobManager.updateStatus(job.id, 'cancelled');
    broadcast('job:update', jobManager.get(job.id));
  }
  res.json(jobManager.get(job.id));
});

/** GET /api/events — SSE stream */
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('\n');
  sseClients.add(res);

  // Send initial pool stats
  res.write(`event: pool:stats\ndata: ${JSON.stringify(pool.stats)}\n\n`);

  req.on('close', () => sseClients.delete(res));
});

/** GET /api/system — System info */
app.get('/api/system', (_req, res) => {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  res.json({
    pool: pool.stats,
    system: {
      cpuCount: cpus.length,
      cpuModel: cpus[0]?.model,
      totalMemory: totalMem,
      freeMemory: freeMem,
      memoryUsagePercent: (((totalMem - freeMem) / totalMem) * 100).toFixed(1),
      platform: os.platform(),
      uptime: os.uptime(),
    },
  });
});

/** GET /api/usecases — Available use-case metadata */
app.get('/api/usecases', (_req, res) => {
  const list = Object.keys(useCases).map((key) => ({
    name: key,
    description: useCaseDescriptions[key],
    params: useCaseParams[key],
  }));
  res.json(list);
});

// ─── Start ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  🎬  FFmpeg Video Processor`);
  console.log(`  ─────────────────────────`);
  console.log(`  Dashboard:  http://localhost:${PORT}`);
  console.log(`  API:        http://localhost:${PORT}/api`);
  console.log(`  Workers:    ${pool.minWorkers}–${pool.maxWorkers} (auto-scaling)\n`);
});
