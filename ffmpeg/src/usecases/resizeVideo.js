/**
 * Use Case 3: Resize Video
 * ffmpeg -i input.mp4 -vf scale=1280:720 output.mp4
 *
 * Options: { width, height }  —  use -1 for auto-aspect, e.g. { width: 1280, height: -1 }
 */
function resizeVideo(inputPath, outputPath, options = {}) {
  const width = options.width ?? 1280;
  const height = options.height ?? 720;
  const args = ['-i', inputPath, '-vf', `scale=${width}:${height}`, outputPath];
  return args;
}

module.exports = resizeVideo;
