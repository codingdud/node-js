/**
 * Use Case 5: Create Video Slideshow from Images
 * ffmpeg -framerate 1 -i img%03d.jpg output.mp4
 *
 * Options: { framerate, pattern, pixelFormat }
 */
function createSlideshow(inputPath, outputPath, options = {}) {
  const framerate = options.framerate ?? 1;
  // inputPath should be the pattern like "img%03d.jpg" or a directory glob
  const pattern = options.pattern || inputPath;
  const pixFmt = options.pixelFormat ?? 'yuv420p';

  const args = [
    '-framerate', String(framerate),
    '-i', pattern,
    '-c:v', 'libx264',
    '-pix_fmt', pixFmt,
    outputPath,
  ];
  return args;
}

module.exports = createSlideshow;
