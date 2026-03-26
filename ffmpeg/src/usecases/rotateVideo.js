/**
 * Use Case 10: Rotate Video
 * ffmpeg -i input.mp4 -vf "transpose=1" output.mp4
 *
 * Options: { rotation } — '90'|'180'|'270'|'90ccw'
 *   90   = clockwise 90° (transpose=1)
 *   180  = 180° (transpose=1,transpose=1)
 *   270  = clockwise 270° / counter-clockwise 90° (transpose=2)
 *   90ccw = counter-clockwise 90° (transpose=2)
 */
function rotateVideo(inputPath, outputPath, options = {}) {
  const rotation = options.rotation ?? '90';

  const filterMap = {
    '90':    'transpose=1',
    '180':   'transpose=1,transpose=1',
    '270':   'transpose=2',
    '90ccw': 'transpose=2',
  };

  const filter = filterMap[rotation] || 'transpose=1';
  const args = ['-i', inputPath, '-vf', filter, outputPath];
  return args;
}

module.exports = rotateVideo;
