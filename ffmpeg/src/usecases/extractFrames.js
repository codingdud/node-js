/**
 * Use Case 6: Extract Frames from Video
 * ffmpeg -i input.mp4 -vf "select=mod(n\,100)" -vsync vfr frame%03d.png
 *
 * Options: { interval (every Nth frame), format ('png'|'jpg'), quality }
 */
function extractFrames(inputPath, outputPath, options = {}) {
  const interval = options.interval ?? 100;
  const format = options.format ?? 'png';
  // outputPath should contain a pattern like "frame%03d.png"
  const outPattern = outputPath.endsWith(`.${format}`)
    ? outputPath
    : `${outputPath}/frame%03d.${format}`;

  const args = [
    '-i', inputPath,
    '-vf', `select=not(mod(n\\,${interval}))`,
    '-vsync', 'vfr',
  ];

  if (format === 'jpg' && options.quality) {
    args.push('-q:v', String(options.quality));
  }

  args.push(outPattern);
  return args;
}

module.exports = extractFrames;
