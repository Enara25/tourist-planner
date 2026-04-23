const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { readLocalImageAsDataUri } = require('../server/image-data');

const ROOT = path.join(__dirname, '..');

const IMAGE_MAP = {
  'Mount Lavinia Beach': '/images/mount-lavinia.png',
  'Dehiwala Zoological Garden': '/images/dehiwala-zoo.webp',
  'Attidiya Bird Sanctuary': '/images/attidiya.jpeg',
  'Bolgoda Lake': '/images/bolgoda-lake.jpg',
  'Gangaramaya Temple': '/images/gangaramaya.jpeg',
  'Independence Memorial Hall': '/images/independence.jpeg',
  'Viharamahadevi Park': '/images/viharamahadevi.jpg',
  'National Museum of Colombo': '/images/national-museum.jpeg',
  'Galle Face Green': '/images/galle-face.jpeg',
  'Bellanwila Rajamaha Viharaya': '/images/bellanwila.jpeg',
  'Sri Lanka Air Force Museum': '/images/slaf-museum.jpg',
  'Traditional Puppet Art Museum': '/images/puppet-museum.svg',
  'Barefoot Gallery': '/images/barefoot.jpeg',
  'Isipathanaramaya Temple': '/images/isipathana.jpeg'
};

function parseEnvFile() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return {};

  return fs.readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .reduce((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return acc;
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      acc[key] = value;
      return acc;
    }, {});
}

async function main() {
  const env = { ...parseEnvFile(), ...process.env };
  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: Number(env.DB_PORT || env.PORT || 3306),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME
  });

  try {
    await connection.query('ALTER TABLE places MODIFY COLUMN ImageURL LONGTEXT');

    for (const [placeName, imagePath] of Object.entries(IMAGE_MAP)) {
      const dataUri = await readLocalImageAsDataUri(imagePath);
      await connection.query('UPDATE places SET ImageURL=? WHERE Name=?', [dataUri, placeName]);
      console.log(`Updated image for ${placeName}`);
    }
  } finally {
    await connection.end();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
