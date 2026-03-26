const { v4: uuidv4 } = require('uuid');
const { EventEmitter } = require('events');

/**
 * JobManager — Manages job lifecycle and state.
 *
 * States: created → queued → processing → done | failed | cancelled
 */
class JobManager extends EventEmitter {
  constructor() {
    super();
    /** @type {Map<string, object>} */
    this.jobs = new Map();
  }

  /**
   * Create a new job record.
   * @param {object} opts
   * @param {string} opts.type - use-case name
   * @param {string} opts.inputPath - path to uploaded file
   * @param {string} opts.outputPath - path for output file
   * @param {object} opts.options - use-case specific options
   * @returns {object} job record
   */
  create({ type, inputPath, outputPath, options = {} }) {
    const id = uuidv4();
    const job = {
      id,
      type,
      inputPath,
      outputPath,
      options,
      status: 'created',
      progress: null,
      error: null,
      createdAt: Date.now(),
      startedAt: null,
      completedAt: null,
    };
    this.jobs.set(id, job);
    this.emit('job:created', job);
    return job;
  }

  get(id) {
    return this.jobs.get(id) || null;
  }

  list() {
    return Array.from(this.jobs.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  updateStatus(id, status, extra = {}) {
    const job = this.jobs.get(id);
    if (!job) return null;
    job.status = status;
    if (status === 'processing') job.startedAt = Date.now();
    if (status === 'done' || status === 'failed') job.completedAt = Date.now();
    Object.assign(job, extra);
    this.emit('job:updated', job);
    return job;
  }

  updateProgress(id, progress) {
    const job = this.jobs.get(id);
    if (!job) return null;
    job.progress = progress;
    this.emit('job:progress', job);
    return job;
  }

  remove(id) {
    return this.jobs.delete(id);
  }
}

module.exports = JobManager;
