/**
 * Use Case 2: Extract Audio from Video
 * ffmpeg -i input.mp4 -vn output.mp3
 *
 * Options: { audioBitrate, audioCodec, sampleRate }
 */
function extractAudio(inputPath, outputPath, options = {}) {
  const args = ['-i', inputPath, '-vn'];

  if (options.audioCodec)  args.push('-c:a', options.audioCodec);
  if (options.audioBitrate) args.push('-b:a', options.audioBitrate);
  if (options.sampleRate)  args.push('-ar', String(options.sampleRate));

  args.push(outputPath);
  return args;
}

module.exports = extractAudio;
