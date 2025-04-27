import sharp from 'sharp';
import fs from 'fs';

const sizes = [512, 192, 180, 64];

// Ensure output directory exists
const outDir = 'public/icons';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Generate PNG icons in required sizes
sizes.forEach(size => {
  sharp('logo.png')
    .resize(size, size)
    .toFile(`${outDir}/hyMuslimplus-${size}.png`, (err) => {
      if (err) console.error(`Error generating icon ${size}x${size}:`, err);
      else console.log(`Generated icon: hyMuslimplus-${size}.png`);
    });
});

// Generate favicon.ico from 64x64
sharp('logo.png')
  .resize(64, 64)
  .toFile(`${outDir}/favicon.ico`, (err) => {
    if (err) console.error('Error generating favicon.ico:', err);
    else console.log('Generated favicon.ico');
  });
