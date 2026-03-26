const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const convertFormat = require('../src/usecases/convertFormat');
const extractAudio = require('../src/usecases/extractAudio');
const resizeVideo = require('../src/usecases/resizeVideo');
const addSubtitles = require('../src/usecases/addSubtitles');
const createSlideshow = require('../src/usecases/createSlideshow');
const extractFrames = require('../src/usecases/extractFrames');
const changeSpeed = require('../src/usecases/changeSpeed');
const concatenateVideos = require('../src/usecases/concatenateVideos');
const streamVideo = require('../src/usecases/streamVideo');
const rotateVideo = require('../src/usecases/rotateVideo');

describe('Use-Case Argument Builders', () => {

  it('convertFormat — basic MP4 to MP3', () => {
    const args = convertFormat('input.mp4', 'output.mp3');
    assert.deepStrictEqual(args, ['-i', 'input.mp4', 'output.mp3']);
  });

  it('convertFormat — with codecs and bitrates', () => {
    const args = convertFormat('in.mp4', 'out.mkv', {
      audioBitrate: '192k',
      videoBitrate: '2M',
      audioCodec: 'aac',
      videoCodec: 'libx265',
    });
    assert.ok(args.includes('-b:a'));
    assert.ok(args.includes('192k'));
    assert.ok(args.includes('-c:v'));
    assert.ok(args.includes('libx265'));
  });

  it('extractAudio — strips video stream', () => {
    const args = extractAudio('in.mp4', 'out.mp3');
    assert.ok(args.includes('-vn'));
    assert.strictEqual(args[args.length - 1], 'out.mp3');
  });

  it('resizeVideo — default 1280x720', () => {
    const args = resizeVideo('in.mp4', 'out.mp4');
    assert.ok(args.includes('scale=1280:720'));
  });

  it('resizeVideo — custom dimensions', () => {
    const args = resizeVideo('in.mp4', 'out.mp4', { width: 1920, height: -1 });
    assert.ok(args.includes('scale=1920:-1'));
  });

  it('addSubtitles — includes subtitle filter', () => {
    const args = addSubtitles('in.mp4', 'out.mp4', { subtitlePath: 'subs.srt' });
    const vfIdx = args.indexOf('-vf');
    assert.ok(vfIdx !== -1);
    assert.ok(args[vfIdx + 1].includes('subtitles'));
  });

  it('createSlideshow — sets framerate and codec', () => {
    const args = createSlideshow('img%03d.jpg', 'out.mp4', { framerate: 2 });
    assert.ok(args.includes('-framerate'));
    assert.ok(args.includes('2'));
    assert.ok(args.includes('libx264'));
  });

  it('extractFrames — every 50th frame', () => {
    const args = extractFrames('in.mp4', 'out/frame%03d.png', { interval: 50 });
    const vfIdx = args.indexOf('-vf');
    assert.ok(args[vfIdx + 1].includes('50'));
    assert.ok(args.includes('-vsync'));
  });

  it('changeSpeed — double speed', () => {
    const args = changeSpeed('in.mp4', 'out.mp4', { speed: 2.0 });
    const vfIdx = args.indexOf('-vf');
    assert.ok(args[vfIdx + 1].includes('setpts'));
    assert.ok(args[vfIdx + 1].includes('0.5000'));
    const afIdx = args.indexOf('-af');
    assert.ok(args[afIdx + 1].includes('atempo'));
  });

  it('changeSpeed — half speed', () => {
    const args = changeSpeed('in.mp4', 'out.mp4', { speed: 0.5 });
    const vfIdx = args.indexOf('-vf');
    assert.ok(args[vfIdx + 1].includes('2.0000'));
  });

  it('concatenateVideos — uses concat demuxer', () => {
    const args = concatenateVideos('in1.mp4', 'out.mp4', {
      inputs: ['in1.mp4', 'in2.mp4'],
    });
    assert.ok(args.includes('-f'));
    assert.ok(args.includes('concat'));
    assert.ok(args.includes('-c'));
    assert.ok(args.includes('copy'));
  });

  it('streamVideo — HLS by default', () => {
    const args = streamVideo('in.mp4', 'out.m3u8');
    assert.ok(args.includes('-f'));
    assert.ok(args.includes('hls'));
    assert.ok(args.includes('-re'));
  });

  it('streamVideo — RTMP protocol', () => {
    const args = streamVideo('in.mp4', '', { protocol: 'rtmp', rtmpUrl: 'rtmp://server/live' });
    assert.ok(args.includes('flv'));
    assert.ok(args.includes('rtmp://server/live'));
  });

  it('rotateVideo — 90 degrees', () => {
    const args = rotateVideo('in.mp4', 'out.mp4', { rotation: '90' });
    assert.ok(args.includes('transpose=1'));
  });

  it('rotateVideo — 180 degrees', () => {
    const args = rotateVideo('in.mp4', 'out.mp4', { rotation: '180' });
    const vfIdx = args.indexOf('-vf');
    assert.ok(args[vfIdx + 1].includes('transpose=1,transpose=1'));
  });

  it('rotateVideo — 270 degrees', () => {
    const args = rotateVideo('in.mp4', 'out.mp4', { rotation: '270' });
    assert.ok(args.includes('transpose=2'));
  });
});
