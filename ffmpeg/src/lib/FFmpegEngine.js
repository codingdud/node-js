const { spawn } = require('child_process');
const { EventEmitter } = require('events');
const path = require('path');

/**
 * FFmpegEngine — Spawns and manages individual FFmpeg processes.
 * Parses stderr for real-time progress and emits events.
 */
class FFmpegEngine extends EventEmitter {
  constructor(options = {}) {
    super();
    this.ffmpegPath = options.ffmpegPath || 'ffmpeg';
    this.ffprobePath = options.ffprobePath || 'ffprobe';
  }

  /**
   * Run an FFmpeg command with the given arguments.
   * @param {string[]} args - FFmpeg CLI arguments (without 'ffmpeg' itself)
   * @param {object} opts - { onProgress, signal }
   * @returns {Promise<{ code: number, stderr: string }>}
   */
  run(args, opts = {}) {
    return new Promise((resolve, reject) => {
      const fullArgs = ['-y', '-progress', 'pipe:1', '-nostats', ...args];
      const proc = spawn(this.ffmpegPath, fullArgs, {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stderrData = '';
      const progress = {};

      // Parse progress lines from stdout (piped via -progress pipe:1)
      proc.stdout.on('data', (chunk) => {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          const [key, value] = line.split('=');
          if (!key || !value) continue;
          const k = key.trim();
          const v = value.trim();

          if (k === 'out_time_ms') {
            progress.timeMicroseconds = parseInt(v, 10);
            progress.timeSeconds = progress.timeMicroseconds / 1_000_000;
          }
          if (k === 'fps') progress.fps = parseFloat(v);
          if (k === 'speed') progress.speed = v;
          if (k === 'bitrate') progress.bitrate = v;
          if (k === 'total_size') progress.totalSize = parseInt(v, 10);
          if (k === 'progress') {
            progress.status = v; // 'continue' or 'end'
            this.emit('progress', { ...progress });
            if (opts.onProgress) opts.onProgress({ ...progress });
          }
        }
      });

      proc.stderr.on('data', (chunk) => {
        stderrData += chunk.toString();
      });

      if (opts.signal) {
        opts.signal.addEventListener('abort', () => {
          proc.kill('SIGTERM');
        });
      }

      proc.on('error', (err) => reject(err));

      proc.on('close', (code) => {
        if (code === 0) {
          resolve({ code, stderr: stderrData });
        } else {
          const err = new Error(`FFmpeg exited with code ${code}`);
          err.code = code;
          err.stderr = stderrData;
          reject(err);
        }
      });
    });
  }

  /**
   * Get media file info via ffprobe.
   * @param {string} filePath
   * @returns {Promise<object>} parsed JSON probe output
   */
  probe(filePath) {
    return new Promise((resolve, reject) => {
      const args = [
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        '-show_streams',
        filePath,
      ];
      const proc = spawn(this.ffprobePath, args);
      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (d) => (stdout += d.toString()));
      proc.stderr.on('data', (d) => (stderr += d.toString()));

      proc.on('error', reject);
      proc.on('close', (code) => {
        if (code === 0) {
          try {
            resolve(JSON.parse(stdout));
          } catch (e) {
            reject(new Error('Failed to parse ffprobe output'));
          }
        } else {
          reject(new Error(`ffprobe exited with code ${code}: ${stderr}`));
        }
      });
    });
  }
}

module.exports = FFmpegEngine;
