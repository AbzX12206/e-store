const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

async function generateMask(fileName, outputName) {
  const filePath = path.join(__dirname, 'public', 'mockups', fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${fileName}`);
    return;
  }
  
  try {
    const img = await loadImage(filePath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Flood fill algorithm
    const width = canvas.width;
    const height = canvas.height;
    
    // We will find the background color from the top-left pixel (0,0)
    const bgR = data[0];
    const bgG = data[1];
    const bgB = data[2];
    
    // Tolerance for background (sometimes JPEG artifacts make it not exactly white)
    // We assume the background is pure white or very close to it
    const tolerance = 5; 
    
    const isBg = (r, g, b) => {
      return Math.abs(r - bgR) <= tolerance && 
             Math.abs(g - bgG) <= tolerance && 
             Math.abs(b - bgB) <= tolerance;
    };
    
    // Keep track of visited pixels
    const visited = new Uint8Array(width * height);
    
    // Queue for flood fill
    const queue = [[0, 0]];
    visited[0] = 1;
    
    // Add all edges to the queue just in case
    for (let x = 0; x < width; x++) {
      if (!visited[x]) { queue.push([x, 0]); visited[x] = 1; }
      if (!visited[(height-1)*width + x]) { queue.push([x, height-1]); visited[(height-1)*width + x] = 1; }
    }
    for (let y = 0; y < height; y++) {
      if (!visited[y*width]) { queue.push([0, y]); visited[y*width] = 1; }
      if (!visited[y*width + width-1]) { queue.push([width-1, y]); visited[y*width + width-1] = 1; }
    }

    let head = 0;
    while (head < queue.length) {
      const [cx, cy] = queue[head++];
      
      const idx = (cy * width + cx) * 4;
      const r = data[idx];
      const g = data[idx+1];
      const b = data[idx+2];
      
      if (isBg(r, g, b)) {
        // Set transparent
        data[idx+3] = 0;
        
        // Push neighbors
        if (cx > 0 && !visited[cy * width + (cx - 1)]) {
          visited[cy * width + (cx - 1)] = 1;
          queue.push([cx - 1, cy]);
        }
        if (cx < width - 1 && !visited[cy * width + (cx + 1)]) {
          visited[cy * width + (cx + 1)] = 1;
          queue.push([cx + 1, cy]);
        }
        if (cy > 0 && !visited[(cy - 1) * width + cx]) {
          visited[(cy - 1) * width + cx] = 1;
          queue.push([cx, cy - 1]);
        }
        if (cy < height - 1 && !visited[(cy + 1) * width + cx]) {
          visited[(cy + 1) * width + cx] = 1;
          queue.push([cx, cy + 1]);
        }
      }
    }
    
    // Now, all pixels that were NOT flooded (alpha > 0) belong to the object.
    // For a mask, we can make the object solid black
    for (let i = 0; i < data.length; i += 4) {
      if (data[i+3] > 0) {
        data[i] = 0;   // R
        data[i+1] = 0; // G
        data[i+2] = 0; // B
        data[i+3] = 255; // A
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const outPath = path.join(__dirname, 'public', 'mockups', outputName);
    const out = fs.createWriteStream(outPath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    
    await new Promise((resolve) => out.on('finish', resolve));
    console.log(`Generated mask: ${outputName}`);
  } catch (e) {
    console.log(`Error generating mask for ${fileName}:`, e.message);
  }
}

async function run() {
  await generateMask('tshirt-front.png', 'tshirt-front-newmask.png');
  await generateMask('tshirt-back.png', 'tshirt-back-newmask.png');
  await generateMask('hoodie-front.png', 'hoodie-front-newmask.png');
  await generateMask('hoodie-back.png', 'hoodie-back-newmask.png');
  await generateMask('mug-front.png', 'mug-front-newmask.png');
  await generateMask('mug-back.png', 'mug-back-newmask.png');
  await generateMask('notebook-shadow.png', 'notebook-newmask.png');
  console.log('Done!');
}

run();
