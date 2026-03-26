const { EventEmitter } = require('events');
const os = require('os');
const FFmpegEngine = require('./FFmpegEngine');

/**
 * WorkerPool — Auto-scaling pool of FFmpeg workers.
 *
 * Dynamically adjusts concurrency between minWorkers and maxWorkers
 * based on CPU utilisation. Jobs are queued FIFO and dispatched
 * as workers become available.
 */
class WorkerPool extends EventEmitter {
  constructor(options = {}) {
    super();
    const cpuCount = os.cpus().length;
    this.minWorkers = options.minWorkers ?? 2;
    this.maxWorkers = options.maxWorkers ?? Math.max(cpuCount, 2);
    this.scaleUpThreshold = options.scaleUpThreshold ?? 0.6;   // queue ratio
    this.scaleDownThreshold = options.scaleDownThreshold ?? 0.2;
    this.currentMax = this.minWorkers;
    this.activeWorkers = 0;
    this.queue = [];
    this.engine = new FFmpegEngine(options);
    this._scaleInterval = setInterval(() => this._autoScale(), 3000);
  }

  /** Current snapshot of pool stats */
  get stats() {
    return {
      activeWorkers: this.activeWorkers,
      currentMax: this.currentMax,
      queueLength: this.queue.length,
      minWorkers: this.minWorkers,
      maxWorkers: this.maxWorkers,
    };
  }

  /**
   * Enqueue a job.
   * @param {string} jobId
   * @param {string[]} args - FFmpeg arguments
   * @param {object} meta - arbitrary metadata passed through events
   * @returns {Promise<{ code: number, stderr: string }>}
   */
  enqueue(jobId, args, meta = {}) {
    return new Promise((resolve, reject) => {
      this.queue.push({ jobId, args, meta, resolve, reject });
      this.emit('job:queued', { jobId, queueLength: this.queue.length });
      this._dispatch();
    });
  }

  /** Try to dispatch queued jobs to available worker slots */
  _dispatch() {
    while (this.queue.length > 0 && this.activeWorkers < this.currentMax) {
      const job = this.queue.shift();
      this.activeWorkers++;
      this.emit('job:start', { jobId: job.jobId, meta: job.meta });
      this._runJob(job);
    }
  }

  async _runJob(job) {
    const ac = new AbortController();
    job._abort = ac;

    try {
      const result = await this.engine.run(job.args, {
        signal: ac.signal,
        onProgress: (progress) => {
          this.emit('job:progress', { jobId: job.jobId, progress, meta: job.meta });
        },
      });
      this.emit('job:complete', { jobId: job.jobId, result, meta: job.meta });
      job.resolve(result);
    } catch (err) {
      this.emit('job:error', { jobId: job.jobId, error: err, meta: job.meta });
      job.reject(err);
    } finally {
      this.activeWorkers--;
      this._dispatch();
    }
  }

  /** Adjust currentMax based on queue pressure */
  _autoScale() {
    if (this.queue.length === 0 && this.activeWorkers === 0) {
      // Nothing happening — drop to minimum
      this.currentMax = this.minWorkers;
      return;
    }
    const ratio = this.queue.length / this.currentMax;
    if (ratio > this.scaleUpThreshold && this.currentMax < this.maxWorkers) {
      this.currentMax = Math.min(this.currentMax + 1, this.maxWorkers);
      this.emit('pool:scaleUp', this.stats);
      this._dispatch();
    } else if (ratio < this.scaleDownThreshold && this.currentMax > this.minWorkers && this.activeWorkers < this.currentMax - 1) {
      this.currentMax = Math.max(this.currentMax - 1, this.minWorkers);
      this.emit('pool:scaleDown', this.stats);
    }
  }

  /** Cancel a specific queued job (cannot cancel an already-running job's FFmpeg process from here) */
  cancelQueued(jobId) {
    const idx = this.queue.findIndex((j) => j.jobId === jobId);
    if (idx !== -1) {
      const [removed] = this.queue.splice(idx, 1);
      removed.reject(new Error('Job cancelled'));
      return true;
    }
    return false;
  }

  /** Graceful shutdown */
  destroy() {
    clearInterval(this._scaleInterval);
    // Reject everything in the queue
    for (const job of this.queue) {
      job.reject(new Error('Pool destroyed'));
    }
    this.queue = [];
  }
}

module.exports = WorkerPool;
