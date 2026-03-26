/**
 * Use-case registry — maps use-case names to their builder functions.
 */
const useCases = {
  convertFormat:     require('./convertFormat'),
  extractAudio:      require('./extractAudio'),
  resizeVideo:       require('./resizeVideo'),
  addSubtitles:      require('./addSubtitles'),
  createSlideshow:   require('./createSlideshow'),
  extractFrames:     require('./extractFrames'),
  changeSpeed:       require('./changeSpeed'),
  concatenateVideos: require('./concatenateVideos'),
  streamVideo:       require('./streamVideo'),
  rotateVideo:       require('./rotateVideo'),
};

/**
 * Descriptions shown in the UI.
 */
const useCaseDescriptions = {
  convertFormat:     'Convert between media formats (MP4, AVI, MKV, MP3, WAV…)',
  extractAudio:      'Extract audio track from a video file',
  resizeVideo:       'Resize / scale video to specific dimensions',
  addSubtitles:      'Burn subtitles (SRT) into a video',
  createSlideshow:   'Create a video slideshow from a sequence of images',
  extractFrames:     'Extract frames from a video at regular intervals',
  changeSpeed:       'Speed up or slow down a video',
  concatenateVideos: 'Join / concatenate multiple videos into one',
  streamVideo:       'Stream video via HLS or RTMP',
  rotateVideo:       'Rotate a video (90° / 180° / 270°)',
};

/**
 * Parameter definitions for the UI to render dynamic option fields.
 */
const useCaseParams = {
  convertFormat: [
    { name: 'audioBitrate', label: 'Audio Bitrate', type: 'text', placeholder: '192k' },
    { name: 'videoBitrate', label: 'Video Bitrate', type: 'text', placeholder: '1M' },
    { name: 'audioCodec',   label: 'Audio Codec',  type: 'text', placeholder: 'aac' },
    { name: 'videoCodec',   label: 'Video Codec',  type: 'text', placeholder: 'libx264' },
  ],
  extractAudio: [
    { name: 'audioBitrate', label: 'Audio Bitrate',  type: 'text', placeholder: '192k' },
    { name: 'audioCodec',   label: 'Audio Codec',   type: 'text', placeholder: 'mp3' },
    { name: 'sampleRate',   label: 'Sample Rate',   type: 'number', placeholder: '44100' },
  ],
  resizeVideo: [
    { name: 'width',  label: 'Width',  type: 'number', placeholder: '1280' },
    { name: 'height', label: 'Height', type: 'number', placeholder: '720' },
  ],
  addSubtitles: [
    { name: 'fontSize', label: 'Font Size', type: 'number', placeholder: '24' },
  ],
  createSlideshow: [
    { name: 'framerate',  label: 'Framerate (fps)', type: 'number', placeholder: '1' },
  ],
  extractFrames: [
    { name: 'interval', label: 'Every Nth Frame', type: 'number', placeholder: '100' },
    { name: 'format',   label: 'Image Format',    type: 'select', options: ['png', 'jpg'] },
  ],
  changeSpeed: [
    { name: 'speed', label: 'Speed Multiplier', type: 'number', placeholder: '2.0' },
  ],
  concatenateVideos: [],
  streamVideo: [
    { name: 'protocol',    label: 'Protocol',       type: 'select', options: ['hls', 'rtmp'] },
    { name: 'hlsTime',     label: 'HLS Segment (s)', type: 'number', placeholder: '4' },
    { name: 'hlsListSize', label: 'HLS List Size',   type: 'number', placeholder: '5' },
    { name: 'rtmpUrl',     label: 'RTMP URL',        type: 'text',  placeholder: 'rtmp://server/live/stream' },
  ],
  rotateVideo: [
    { name: 'rotation', label: 'Rotation', type: 'select', options: ['90', '180', '270'] },
  ],
};

module.exports = { useCases, useCaseDescriptions, useCaseParams };
