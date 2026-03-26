/**
 * Use Case 9: Stream Live Video (HLS / RTMP)
 *
 * Options:
 *   { protocol: 'hls'|'rtmp', hlsTime, hlsListSize, rtmpUrl }
 *
 * HLS: creates .m3u8 playlist + .ts segments in outputPath directory
 * RTMP: pushes to an RTMP server URL
 */
function streamVideo(inputPath, outputPath, options = {}) {
  const protocol = options.protocol ?? 'hls';

  if (protocol === 'rtmp') {
    const rtmpUrl = options.rtmpUrl || outputPath;
    return [
      '-re',
      '-i', inputPath,
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-c:a', 'aac',
      '-f', 'flv',
      rtmpUrl,
    ];
  }

  // Default: HLS
  const hlsTime = options.hlsTime ?? 4;
  const hlsListSize = options.hlsListSize ?? 5;

  return [
    '-re',
    '-i', inputPath,
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-c:a', 'aac',
    '-f', 'hls',
    '-hls_time', String(hlsTime),
    '-hls_list_size', String(hlsListSize),
    '-hls_flags', 'delete_segments',
    outputPath, // .m3u8 file path
  ];
}

module.exports = streamVideo;
