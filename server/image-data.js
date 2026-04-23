const fs = require('fs/promises');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '../public');

const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

function getMimeFromPath(filePath) {
  return MIME_BY_EXT[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function toDataUri(buffer, mimeType) {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

async function readLocalImageAsDataUri(publicPath) {
  const relativePath = publicPath.replace(/^\//, '');
  const filePath = path.resolve(PUBLIC_DIR, relativePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    throw new Error('Image path must stay within the public directory.');
  }

  const buffer = await fs.readFile(filePath);
  return toDataUri(buffer, getMimeFromPath(filePath));
}

async function fetchRemoteImageAsDataUri(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Image download failed with status ${response.status}.`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const mimeType = response.headers.get('content-type') || getMimeFromPath(url);
  return toDataUri(Buffer.from(arrayBuffer), mimeType);
}

async function normalizeImageInput(imageInput) {
  const value = (imageInput || '').trim();
  if (!value) return null;
  if (value.startsWith('data:image/')) return value;
  if (value.startsWith('/images/')) return readLocalImageAsDataUri(value);
  if (/^https?:\/\//i.test(value)) return fetchRemoteImageAsDataUri(value);
  return value;
}

module.exports = {
  normalizeImageInput,
  readLocalImageAsDataUri
};
