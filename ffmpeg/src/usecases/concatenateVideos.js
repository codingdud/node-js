const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Use Case 8: Concatenate Videos
 * Uses the concat demuxer (safer than the concat protocol for many formats)
 *
 * Options: { inputs: [path1, path2, ...] }
 */
function concatenateVideos(inputPath, outputPath, options = {}) {
  // inputPath can be the first file; additional files come from options.inputs
  const inputs = options.inputs || [inputPath];

  // Write a temporary concat list file
  const listContent = inputs.map((f) => `file '${f.replace(/\\/g, '/')}'`).join('\n');
  const listPath = path.join(os.tmpdir(), `ffmpeg_concat_${Date.now()}.txt`);
  fs.writeFileSync(listPath, listContent, 'utf8');

  const args = [
    '-f', 'concat',
    '-safe', '0',
    '-i', listPath,
    '-c', 'copy',
    outputPath,
  ];
  return args;
}

module.exports = concatenateVideos;
