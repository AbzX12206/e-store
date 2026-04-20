const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

async function analyzeTransparency(fileName) {
  const filePath = path.join(__dirname, 'public', 'mockups', fileName);
  try {
    const img = await loadImage(filePath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, img.width, img.height).data;
    
    let transparentPixels = 0;
    let solidPixels = 0;
    
    // Check corners
    const corners = [
      data[3], // Top-Left alpha
      data[(img.width - 1) * 4 + 3], // Top-Right
      data[(img.height - 1) * img.width * 4 + 3], // Bottom-Left
      data[(img.height * img.width - 1) * 4 + 3] // Bottom-Right
    ];
    
    // Sample some pixels
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0) transparentPixels++;
      else solidPixels++;
    }
    
    console.log(`--- ${fileName} ---`);
    console.log(`Dimensions: ${img.width}x${img.height}`);
    console.log(`Corner alphas (TL, TR, BL, BR):`, corners);
    console.log(`Transparent pixels: ${(transparentPixels / (img.width * img.height) * 100).toFixed(2)}%`);
    console.log(`Solid pixels: ${(solidPixels / (img.width * img.height) * 100).toFixed(2)}%`);
  } catch (e) {
    console.log(`Error analyzing ${fileName}:`, e.message);
  }
}

async function run() {
  await analyzeTransparency('tshirt-front.png');
  await analyzeTransparency('tshirt-front-mask.png');
}

run();
