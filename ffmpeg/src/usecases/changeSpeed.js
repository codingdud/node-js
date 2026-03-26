/**
 * Use Case 7: Speed Up or Slow Down a Video
 * ffmpeg -i input.mp4 -vf "setpts=0.5*PTS" output.mp4
 *
 * Options: { speed } — 2.0 = double speed, 0.5 = half speed
 * Audio tempo is also adjusted with atempo (range 0.5–2.0 per filter, chained for larger values)
 */
function changeSpeed(inputPath, outputPath, options = {}) {
  const speed = options.speed ?? 2.0;
  const ptsFactor = 1 / speed; // setpts uses inverse

  const args = ['-i', inputPath];

  // Video filter
  const vf = `setpts=${ptsFactor.toFixed(4)}*PTS`;

  // Audio filter — atempo supports 0.5 to 2.0, chain for values outside
  const atempoFilters = [];
  let remaining = speed;
  while (remaining > 2.0) {
    atempoFilters.push('atempo=2.0');
    remaining /= 2.0;
  }
  while (remaining < 0.5) {
    atempoFilters.push('atempo=0.5');
    remaining /= 0.5;
  }
  atempoFilters.push(`atempo=${remaining.toFixed(4)}`);
  const af = atempoFilters.join(',');

  args.push('-vf', vf, '-af', af, outputPath);
  return args;
}

module.exports = changeSpeed;
