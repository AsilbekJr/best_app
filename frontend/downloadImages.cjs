const fs = require('fs');
const path = require('path');
const https = require('https');

const filesToProcess = [
  path.join(__dirname, 'src', 'components', 'HeroBanner.tsx'),
  path.join(__dirname, '..', 'backend', 'seed.ts')
];

const imgDir = path.join(__dirname, 'public', 'images');

if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
        return resolve();
    }
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function processFiles() {
  const urlRegex = /'https:\/\/images\.unsplash\.com\/photo-([a-zA-Z0-9-]+)[^']*'/g;
  
  for (const filePath of filesToProcess) {
    if (!fs.existsSync(filePath)) {
      console.log('File not found:', filePath);
      continue;
    }
    let content = fs.readFileSync(filePath, 'utf8');
    let match;
    const downloads = [];
    const replacements = [];
    
    while ((match = urlRegex.exec(content)) !== null) {
      const fullUrl = match[0].slice(1, -1); // remove quotes
      const photoId = match[1];
      const localPath = `/images/${photoId}.jpg`;
      const localFilePath = path.join(imgDir, `${photoId}.jpg`);
      
      downloads.push(downloadImage(fullUrl, localFilePath));
      replacements.push({ original: match[0], new: `'${localPath}'` });
    }
    
    console.log(`Downloading ${downloads.length} images for ${path.basename(filePath)}...`);
    await Promise.all(downloads);
    
    // Replace in file
    for (const r of replacements) {
      content = content.replace(r.original, r.new);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${path.basename(filePath)}`);
  }
}

processFiles().then(() => console.log('Done!')).catch(console.error);
