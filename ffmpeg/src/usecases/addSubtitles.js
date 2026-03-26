/**
 * Use Case 4: Add Subtitles to Video
 * ffmpeg -i input.mp4 -vf "subtitles=subtitles.srt" output.mp4
 *
 * Options: { subtitlePath, fontSize, fontColor }
 */
function addSubtitles(inputPath, outputPath, options = {}) {
  const subPath = options.subtitlePath || 'subtitles.srt';
  // Escape Windows backslashes and colons for the subtitles filter
  const escaped = subPath.replace(/\\/g, '/').replace(/:/g, '\\:');

  let filter = `subtitles='${escaped}'`;
  if (options.fontSize) {
    filter = `subtitles='${escaped}':force_style='FontSize=${options.fontSize}'`;
  }

  const args = ['-i', inputPath, '-vf', filter, outputPath];
  return args;
}

module.exports = addSubtitles;
