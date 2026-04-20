const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'mockups');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const WIDTH  = 500;
const HEIGHT = 600;

// ─────────────────────────────────────────────────────────────────────────────
//  PRODUCT DEFINITIONS
//  Each product has:
//    front/back  – canvas path functions (same as before)
//    bounds      – bounding box {x,y,w,h} used to position gradients
//    lightSource – {x,y} where simulated light originates (top-left region)
//    folds       – per-view list of fold/crease descriptors
// ─────────────────────────────────────────────────────────────────────────────
const products = {
  tshirt: {
    bounds: { x: 50, y: 100, w: 400, h: 380 },
    lightSource: { x: 130, y: 100 },
    front: (ctx) => {
      ctx.beginPath();
      ctx.moveTo(150, 100);
      ctx.lineTo(50, 150);
      ctx.lineTo(80, 200);
      ctx.lineTo(130, 180);
      ctx.lineTo(130, 450);
      ctx.quadraticCurveTo(250, 480, 370, 450);
      ctx.lineTo(370, 180);
      ctx.lineTo(420, 200);
      ctx.lineTo(450, 150);
      ctx.lineTo(350, 100);
      ctx.quadraticCurveTo(250, 120, 150, 100);
      ctx.closePath();
    },
    back: (ctx) => {
      ctx.beginPath();
      ctx.moveTo(150, 100);
      ctx.lineTo(50, 150);
      ctx.lineTo(80, 200);
      ctx.lineTo(130, 180);
      ctx.lineTo(130, 450);
      ctx.quadraticCurveTo(250, 480, 370, 450);
      ctx.lineTo(370, 180);
      ctx.lineTo(420, 200);
      ctx.lineTo(450, 150);
      ctx.lineTo(350, 100);
      ctx.lineTo(250, 110);
      ctx.lineTo(150, 100);
      ctx.closePath();
    },
    folds: {
      front: [
        { type: 'line',  x1: 250, y1: 130, x2: 250, y2: 455 },
        { type: 'curve', points: [140, 180, 170, 215, 192, 248] },
        { type: 'curve', points: [360, 180, 330, 215, 308, 248] },
        { type: 'line',  x1: 145, y1: 300, x2: 355, y2: 300 },
        { type: 'line',  x1: 145, y1: 390, x2: 355, y2: 390 },
      ],
      back: [
        { type: 'line',  x1: 250, y1: 130, x2: 250, y2: 455 },
        { type: 'curve', points: [140, 185, 170, 220, 192, 253] },
        { type: 'curve', points: [360, 185, 330, 220, 308, 253] },
        { type: 'line',  x1: 145, y1: 310, x2: 355, y2: 310 },
        { type: 'line',  x1: 145, y1: 395, x2: 355, y2: 395 },
      ],
    },
  },

  hoodie: {
    bounds: { x: 70, y: 20, w: 360, h: 500 },
    lightSource: { x: 140, y: 40 },
    front: (ctx) => {
      ctx.beginPath();
      ctx.moveTo(180, 40);
      ctx.quadraticCurveTo(250, 20, 320, 40);
      ctx.lineTo(340, 80);
      ctx.lineTo(400, 100);
      ctx.lineTo(430, 160);
      ctx.lineTo(380, 180);
      ctx.lineTo(350, 170);
      ctx.lineTo(350, 480);
      ctx.quadraticCurveTo(250, 510, 150, 480);
      ctx.lineTo(150, 170);
      ctx.lineTo(120, 180);
      ctx.lineTo(70, 160);
      ctx.lineTo(100, 100);
      ctx.lineTo(160, 80);
      ctx.lineTo(180, 40);
      ctx.closePath();
    },
    back: (ctx) => {
      ctx.beginPath();
      ctx.moveTo(170, 50);
      ctx.quadraticCurveTo(250, 30, 330, 50);
      ctx.lineTo(340, 90);
      ctx.lineTo(400, 110);
      ctx.lineTo(420, 170);
      ctx.lineTo(370, 190);
      ctx.lineTo(360, 490);
      ctx.quadraticCurveTo(250, 520, 140, 490);
      ctx.lineTo(130, 190);
      ctx.lineTo(80, 170);
      ctx.lineTo(100, 110);
      ctx.lineTo(160, 90);
      ctx.lineTo(170, 50);
      ctx.closePath();
    },
    folds: {
      front: [
        { type: 'line',  x1: 250, y1: 80,  x2: 250, y2: 485 },
        { type: 'curve', points: [155, 170, 185, 220, 205, 268] },
        { type: 'curve', points: [345, 170, 315, 220, 295, 268] },
        { type: 'line',  x1: 158, y1: 340, x2: 342, y2: 340 },
        { type: 'line',  x1: 158, y1: 430, x2: 342, y2: 430 },
      ],
      back: [
        { type: 'line',  x1: 250, y1: 90,  x2: 250, y2: 490 },
        { type: 'curve', points: [135, 190, 165, 240, 185, 290] },
        { type: 'curve', points: [365, 190, 335, 240, 315, 290] },
        { type: 'line',  x1: 140, y1: 345, x2: 360, y2: 345 },
        { type: 'line',  x1: 140, y1: 435, x2: 360, y2: 435 },
      ],
    },
  },

  sweatshirt: {
    bounds: { x: 80, y: 90, w: 340, h: 405 },
    lightSource: { x: 140, y: 90 },
    front: (ctx) => {
      ctx.beginPath();
      ctx.moveTo(160, 90);
      ctx.lineTo(80, 130);
      ctx.lineTo(100, 190);
      ctx.lineTo(140, 175);
      ctx.lineTo(140, 460);
      ctx.quadraticCurveTo(250, 490, 360, 460);
      ctx.lineTo(360, 175);
      ctx.lineTo(400, 190);
      ctx.lineTo(420, 130);
      ctx.lineTo(340, 90);
      ctx.quadraticCurveTo(250, 110, 160, 90);
      ctx.closePath();
    },
    back: (ctx) => {
      ctx.beginPath();
      ctx.moveTo(160, 95);
      ctx.lineTo(80, 135);
      ctx.lineTo(100, 195);
      ctx.lineTo(140, 180);
      ctx.lineTo(140, 465);
      ctx.quadraticCurveTo(250, 495, 360, 465);
      ctx.lineTo(360, 180);
      ctx.lineTo(400, 195);
      ctx.lineTo(420, 135);
      ctx.lineTo(340, 95);
      ctx.lineTo(250, 105);
      ctx.lineTo(160, 95);
      ctx.closePath();
    },
    folds: {
      front: [
        { type: 'line',  x1: 250, y1: 115, x2: 250, y2: 462 },
        { type: 'curve', points: [145, 175, 175, 215, 197, 252] },
        { type: 'curve', points: [355, 175, 325, 215, 303, 252] },
        { type: 'line',  x1: 148, y1: 305, x2: 352, y2: 305 },
        { type: 'line',  x1: 148, y1: 395, x2: 352, y2: 395 },
      ],
      back: [
        { type: 'line',  x1: 250, y1: 118, x2: 250, y2: 467 },
        { type: 'curve', points: [145, 182, 175, 222, 197, 258] },
        { type: 'curve', points: [355, 182, 325, 222, 303, 258] },
        { type: 'line',  x1: 148, y1: 312, x2: 352, y2: 312 },
        { type: 'line',  x1: 148, y1: 400, x2: 352, y2: 400 },
      ],
    },
  },

  cap: {
    bounds: { x: 80, y: 120, w: 340, h: 160 },
    lightSource: { x: 130, y: 125 },
    front: (ctx) => {
      ctx.beginPath();
      ctx.ellipse(250, 200, 140, 80, 0, Math.PI, 0);
      ctx.lineTo(390, 200);
      ctx.lineTo(420, 230);
      ctx.lineTo(400, 240);
      ctx.lineTo(100, 240);
      ctx.lineTo(80, 230);
      ctx.lineTo(110, 200);
      ctx.closePath();
      ctx.beginPath();
      ctx.ellipse(250, 120, 15, 8, 0, 0, Math.PI * 2);
    },
    back: (ctx) => {
      ctx.beginPath();
      ctx.ellipse(250, 200, 140, 80, 0, Math.PI, 0);
      ctx.lineTo(390, 200);
      ctx.lineTo(380, 280);
      ctx.lineTo(120, 280);
      ctx.lineTo(110, 200);
      ctx.closePath();
    },
    folds: {
      front: [
        { type: 'curve', points: [158, 198, 204, 188, 250, 184] },
        { type: 'curve', points: [250, 184, 296, 188, 342, 198] },
        { type: 'line',  x1: 110, y1: 218, x2: 390, y2: 218 },
      ],
      back: [
        { type: 'line', x1: 250, y1: 125, x2: 250, y2: 278 },
        { type: 'line', x1: 110, y1: 218, x2: 390, y2: 218 },
      ],
    },
  },

  mug: {
    bounds: { x: 150, y: 140, w: 270, h: 295 },
    lightSource: { x: 155, y: 145 },
    front: (ctx) => {
      ctx.beginPath();
      ctx.moveTo(150, 150);
      ctx.lineTo(150, 400);
      ctx.quadraticCurveTo(250, 430, 350, 400);
      ctx.lineTo(350, 150);
      ctx.quadraticCurveTo(250, 120, 150, 150);
      ctx.closePath();
      ctx.beginPath();
      ctx.moveTo(350, 200);
      ctx.bezierCurveTo(420, 200, 420, 350, 350, 350);
      ctx.lineTo(350, 320);
      ctx.bezierCurveTo(390, 320, 390, 230, 350, 230);
      ctx.closePath();
    },
    back: (ctx) => {
      ctx.beginPath();
      ctx.moveTo(150, 150);
      ctx.lineTo(150, 400);
      ctx.quadraticCurveTo(250, 430, 350, 400);
      ctx.lineTo(350, 150);
      ctx.quadraticCurveTo(250, 120, 150, 150);
      ctx.closePath();
    },
    folds: {
      front: [
        { type: 'line', x1: 195, y1: 145, x2: 180, y2: 412 },
        { type: 'line', x1: 305, y1: 138, x2: 320, y2: 408 },
      ],
      back: [
        { type: 'line', x1: 195, y1: 145, x2: 180, y2: 412 },
        { type: 'line', x1: 305, y1: 138, x2: 320, y2: 408 },
      ],
    },
  },

  notebook: {
    bounds: { x: 120, y: 100, w: 260, h: 380 },
    lightSource: { x: 125, y: 105 },
    front: (ctx) => {
      ctx.beginPath();
      ctx.roundRect(120, 100, 260, 380, 10);
    },
    back: (ctx) => {
      ctx.beginPath();
      ctx.roundRect(120, 100, 260, 380, 10);
    },
    folds: {
      front: [
        { type: 'line', x1: 158, y1: 104, x2: 158, y2: 476 },
        { type: 'line', x1: 124, y1: 298, x2: 376, y2: 298 },
      ],
      back: [
        { type: 'line', x1: 158, y1: 104, x2: 158, y2: 476 },
        { type: 'line', x1: 124, y1: 298, x2: 376, y2: 298 },
      ],
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clip the canvas to a product shape, run a draw callback, then restore.
 */
function withClip(ctx, shapeFn, drawFn) {
  ctx.save();
  shapeFn(ctx);
  ctx.clip();
  drawFn(ctx);
  ctx.restore();
}

/**
 * Draw crease / fold lines with gradient opacity so they fade at the ends.
 * Lines use a gradient along their own axis; curves use a fixed low opacity.
 */
function drawFolds(ctx, folds) {
  if (!folds) return;
  folds.forEach((fold) => {
    ctx.save();
    ctx.lineWidth = 1.8;

    if (fold.type === 'line') {
      const grad = ctx.createLinearGradient(fold.x1, fold.y1, fold.x2, fold.y2);
      grad.addColorStop(0,    'rgba(0,0,0,0.00)');
      grad.addColorStop(0.15, 'rgba(0,0,0,0.20)');
      grad.addColorStop(0.85, 'rgba(0,0,0,0.20)');
      grad.addColorStop(1,    'rgba(0,0,0,0.00)');
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(fold.x1, fold.y1);
      ctx.lineTo(fold.x2, fold.y2);
      ctx.stroke();

      // Thin bright edge just beside the dark fold (gives 3-D crease illusion)
      const bright = ctx.createLinearGradient(fold.x1, fold.y1, fold.x2, fold.y2);
      bright.addColorStop(0,    'rgba(255,255,255,0.00)');
      bright.addColorStop(0.15, 'rgba(255,255,255,0.10)');
      bright.addColorStop(0.85, 'rgba(255,255,255,0.10)');
      bright.addColorStop(1,    'rgba(255,255,255,0.00)');
      ctx.strokeStyle = bright;
      ctx.lineWidth = 1;
      // offset 2px perpendicular (approximate with translate)
      const dx = fold.x2 - fold.x1;
      const dy = fold.y2 - fold.y1;
      const len = Math.hypot(dx, dy) || 1;
      const nx = (-dy / len) * 2;
      const ny = ( dx / len) * 2;
      ctx.beginPath();
      ctx.moveTo(fold.x1 + nx, fold.y1 + ny);
      ctx.lineTo(fold.x2 + nx, fold.y2 + ny);
      ctx.stroke();

    } else if (fold.type === 'curve') {
      const [x0, y0, x1, y1, x2, y2] = fold.points;
      ctx.strokeStyle = 'rgba(0,0,0,0.14)';
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(x1, y1, x2, y2);
      ctx.stroke();
    }
    ctx.restore();
  });
}

/**
 * Simulate woven fabric: fine horizontal + vertical threads and an
 * interleaved dot pattern — all clipped to the product silhouette.
 * Opacity is low so the effect reads as subtle texture, not noise.
 */
function drawFabricTexture(ctx, shapeFn) {
  withClip(ctx, shapeFn, () => {
    const spacing = 5;
    ctx.lineWidth = 0.5;

    // Horizontal weft threads
    ctx.strokeStyle = 'rgba(255,255,255,0.055)';
    for (let y = 0; y < HEIGHT; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WIDTH, y);
      ctx.stroke();
    }

    // Vertical warp threads
    ctx.strokeStyle = 'rgba(0,0,0,0.045)';
    for (let x = 0; x < WIDTH; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, HEIGHT);
      ctx.stroke();
    }

    // Interleaved dot knots (over/under weave illusion)
    ctx.fillStyle = 'rgba(0,0,0,0.035)';
    for (let y = 0; y < HEIGHT; y += spacing) {
      const xOffset = ((y / spacing) % 2 === 0) ? 0 : Math.floor(spacing / 2);
      for (let x = xOffset; x < WIDTH; x += spacing) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  GENERATORS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * MASK – white silhouette on transparent background (unchanged from original).
 */
function createMask(product, view) {
  const def = products[product];
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx    = canvas.getContext('2d');
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = '#FFFFFF';
  def[view](ctx);
  ctx.fill();
  return canvas.toBuffer('image/png');
}

/**
 * SHADOW – multi-layer realistic shading:
 *   1. Directional light gradient (light source → opposite corner)
 *   2. Edge vignette / ambient occlusion (radial, center-to-edge)
 *   3. Woven fabric texture
 *   4. Gradient fold / crease lines with bright counter-edge
 *   5. Seam highlight on the light side
 */
function createShadow(product, view) {
  const def = products[product];
  if (!def || !def[view]) return null;

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx    = canvas.getContext('2d');
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  const { bounds, lightSource: ls, folds } = def;
  const shapeFn = def[view];

  // 1 ── Directional gradient (light → shadow)
  withClip(ctx, shapeFn, () => {
    const grad = ctx.createLinearGradient(
      ls.x,               ls.y,
      bounds.x + bounds.w, bounds.y + bounds.h
    );
    grad.addColorStop(0,    'rgba(0,0,0,0.08)');
    grad.addColorStop(0.45, 'rgba(0,0,0,0.22)');
    grad.addColorStop(1,    'rgba(0,0,0,0.42)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  });

  // 2 ── Radial vignette (ambient occlusion at edges)
  withClip(ctx, shapeFn, () => {
    const cx  = bounds.x + bounds.w / 2;
    const cy  = bounds.y + bounds.h / 2;
    const rad = Math.max(bounds.w, bounds.h) * 0.70;
    const vig = ctx.createRadialGradient(cx, cy, rad * 0.1, cx, cy, rad);
    vig.addColorStop(0,    'rgba(0,0,0,0.00)');
    vig.addColorStop(0.55, 'rgba(0,0,0,0.06)');
    vig.addColorStop(1,    'rgba(0,0,0,0.32)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  });

  // 3 ── Fabric weave texture
  drawFabricTexture(ctx, shapeFn);

  // 4 ── Fold / crease lines
  withClip(ctx, shapeFn, () => {
    drawFolds(ctx, folds?.[view]);
  });

  // 5 ── Seam highlight on the lit side
  withClip(ctx, shapeFn, () => {
    const seam = ctx.createLinearGradient(ls.x, ls.y, ls.x + 80, ls.y + 80);
    seam.addColorStop(0,   'rgba(255,255,255,0.13)');
    seam.addColorStop(0.5, 'rgba(255,255,255,0.04)');
    seam.addColorStop(1,   'rgba(255,255,255,0.00)');
    ctx.fillStyle = seam;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  });

  return canvas.toBuffer('image/png');
}

/**
 * SHEEN – separate layer for fabric highlight / gloss.
 * Composite as "screen" or "overlay" in your app for best results.
 * Two bands: a wide soft glow and a narrow bright streak.
 */
function createSheen(product, view) {
  const def = products[product];
  if (!def || !def[view]) return null;

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx    = canvas.getContext('2d');
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  const { lightSource: ls } = def;
  const shapeFn = def[view];

  withClip(ctx, shapeFn, () => {
    // Wide soft glow from light corner
    const glow = ctx.createLinearGradient(ls.x, ls.y, ls.x + 240, ls.y + 240);
    glow.addColorStop(0,    'rgba(255,255,255,0.20)');
    glow.addColorStop(0.30, 'rgba(255,255,255,0.08)');
    glow.addColorStop(0.60, 'rgba(255,255,255,0.00)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Narrow bright streak (specular-like band across the upper-left region)
    const streak = ctx.createLinearGradient(
      ls.x + 20, ls.y + 10,
      ls.x + 90, ls.y + 90
    );
    streak.addColorStop(0,    'rgba(255,255,255,0.00)');
    streak.addColorStop(0.35, 'rgba(255,255,255,0.16)');
    streak.addColorStop(0.50, 'rgba(255,255,255,0.22)');
    streak.addColorStop(0.65, 'rgba(255,255,255,0.16)');
    streak.addColorStop(1,    'rgba(255,255,255,0.00)');
    ctx.fillStyle = streak;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  });

  return canvas.toBuffer('image/png');
}

// ─────────────────────────────────────────────────────────────────────────────
//  GENERATE ALL
// ─────────────────────────────────────────────────────────────────────────────
Object.keys(products).forEach((product) => {
  ['front', 'back'].forEach((view) => {
    const maskBuffer  = createMask(product, view);
    const shadowBuffer = createShadow(product, view);
    const sheenBuffer  = createSheen(product, view);

    fs.writeFileSync(path.join(dir, `${product}-${view}-mask.png`),   maskBuffer);
    fs.writeFileSync(path.join(dir, `${product}-${view}-shadow.png`), shadowBuffer);
    fs.writeFileSync(path.join(dir, `${product}-${view}-sheen.png`),  sheenBuffer);

    console.log(`Generated: ${product}-${view}-{mask,shadow,sheen}.png`);
  });
});

console.log('\nAll mockups generated successfully!');
console.log('Files are in: ' + dir);

/*
  ── COMPOSITING GUIDE ──────────────────────────────────────────────────────

  Layer order (bottom to top) in your renderer / CSS:

    1. [base color]   – solid fill or fabric colour of the product
    2. [design image] – your artwork, clipped by the mask PNG
    3. shadow.png     – multiply blend mode  (darkens realistically)
    4. sheen.png      – screen or overlay blend mode  (adds highlight/gloss)

  CSS example:
    .shadow { mix-blend-mode: multiply; }
    .sheen  { mix-blend-mode: screen;   }

  The mask PNG can be used as a CSS mask-image or as a clip path in canvas
  to restrict the design image to the product silhouette.
*/
