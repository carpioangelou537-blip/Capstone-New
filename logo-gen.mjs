import { writeFileSync } from 'fs';
import { deflateSync } from 'zlib';

const width = 160;
const height = 160;
const bg = [92, 15, 26, 255];
const white = [255, 255, 255, 255];
const dark = [58, 10, 17, 255];
const pixels = new Uint8Array(width * height * 4);

function setPixel(x, y, color) {
  const idx = (y * width + x) * 4;
  pixels[idx] = color[0];
  pixels[idx + 1] = color[1];
  pixels[idx + 2] = color[2];
  pixels[idx + 3] = color[3];
}

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const dx = x - width / 2;
    const dy = y - height / 2;
    const r = Math.sqrt(dx * dx + dy * dy);
    const inCircle = r < width * 0.36;
    const inBand = Math.abs(dy) < 8 && Math.abs(dx) < width * 0.28;
    const inCross = (Math.abs(dx) < 10 && Math.abs(dy) < width * 0.3) || (Math.abs(dy) < 10 && Math.abs(dx) < width * 0.3);
    if (inCircle || inBand || inCross) {
      setPixel(x, y, white);
    } else {
      setPixel(x, y, bg);
    }

    if (x > 40 && x < 120 && y > 40 && y < 120) {
      const inner = Math.sqrt((x - 80) ** 2 + (y - 80) ** 2) < 35;
      if (!inner) {
        setPixel(x, y, dark);
      }
    }
  }
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    crc ^= buf[i];
    for (let bit = 0; bit < 8; bit += 1) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc >>>= 1;
      }
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const chunk = Buffer.concat([length, Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type), data])), 0);
  return Buffer.concat([chunk, crc]);
}

const raw = Buffer.alloc(height * (width * 4 + 1));
let offset = 0;
for (let y = 0; y < height; y += 1) {
  raw[offset++] = 0;
  for (let x = 0; x < width; x += 1) {
    const idx = (y * width + x) * 4;
    raw[offset++] = pixels[idx];
    raw[offset++] = pixels[idx + 1];
    raw[offset++] = pixels[idx + 2];
    raw[offset++] = pixels[idx + 3];
  }
}

const compressed = deflateSync(raw);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(width, 0);
ihdr.writeUInt32BE(height, 4);
ihdr[8] = 8;
ihdr[9] = 6;
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  pngChunk('IHDR', ihdr),
  pngChunk('IDAT', compressed),
  pngChunk('IEND', Buffer.alloc(0)),
]);

writeFileSync('public/logo.png', png);
console.log('created public/logo.png');
