/**
 * Use Case 1: Convert Media Formats
 * ffmpeg -i input.mp4 output.mp3
 *
 * Supports any format-to-format conversion FFmpeg handles.
 * Options: { audioBitrate, videoBitrate, codec }
 */
function convertFormat(inputPath, outputPath, options = {}) {
  const args = ['-i', inputPath];

  if (options.audioBitrate) args.push('-b:a', options.audioBitrate);
  if (options.videoBitrate) args.push('-b:v', options.videoBitrate);
  if (options.audioCodec)   args.push('-c:a', options.audioCodec);
  if (options.videoCodec)   args.push('-c:v', options.videoCodec);

  args.push(outputPath);
  return args;
}

module.exports = convertFormat;
