const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const GIFEncoder = require('gif-encoder-2');

const publicDir = path.resolve(__dirname, '../public');
const frames = [
  'home-page.png',
  'ledger-details.png',
  'report-details.png',
  'settings-page.png',
];

function loadPng(file) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(publicDir, file))
      .pipe(new PNG())
      .on('parsed', function () {
        resolve(this);
      })
      .on('error', reject);
  });
}

(async () => {
  try {
    const pngs = await Promise.all(frames.map(loadPng));

    const width = pngs[0].width;
    const height = pngs[0].height;

    for (const frame of pngs) {
      if (frame.width !== width || frame.height !== height) {
        throw new Error('All GIF frames must share the same dimensions.');
      }
    }

    const encoder = new GIFEncoder(width, height, 'octree', true, pngs.length);
    encoder.setRepeat(0);
    encoder.setDelay(1200);
    encoder.setQuality(10);
    encoder.start();

    for (const frame of pngs) {
      encoder.addFrame(frame.data);
    }

    encoder.finish();

    const outPath = path.join(publicDir, 'demo.gif');
    fs.writeFileSync(outPath, encoder.out.getData());
    console.log('Wrote', outPath);
  } catch (err) {
    console.error('Failed to create gif:', err);
    process.exit(1);
  }
})();
