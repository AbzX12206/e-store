const fs = require('fs');
const path = require('path');

function inspectPNG(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    if (buffer.toString('ascii', 1, 4) !== 'PNG') {
      return { error: 'Not a PNG file' };
    }
    
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    const bitDepth = buffer.readUInt8(24);
    const colorType = buffer.readUInt8(25);
    
    // Color Type 6 is Truecolor with Alpha, 4 is Grayscale with Alpha, 2 is Truecolor, 0 is Grayscale
    const hasAlpha = colorType === 6 || colorType === 4;
    
    return {
      file: path.basename(filePath),
      width,
      height,
      bitDepth,
      colorType,
      hasAlpha,
      sizeBytes: buffer.length
    };
  } catch (e) {
    return { error: e.message };
  }
}

const dir = path.join(__dirname, 'public', 'mockups');
const files = [
  'tshirt-front.png',
  'tshirt-back.png',
  'hoodie-front.png',
  'tshirt-front-mask.png',
  'tshirt-front-shadow.png'
];

files.forEach(file => {
  const result = inspectPNG(path.join(dir, file));
  console.log(result);
});
