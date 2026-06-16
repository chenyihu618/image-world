import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  console.log('Seeding database...');
  await pool.query(`INSERT INTO countries (code, name, name_en, latitude, longitude, zoom_level) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
    ['china', '中国', 'China', 35.86, 104.19, 4]);
  const country = await pool.query('SELECT id FROM countries WHERE code = $1', ['china']);
  await pool.query(`INSERT INTO provinces (country_id, code, name, name_en, latitude, longitude) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
    [country.rows[0].id, 'anhui', '安徽省', 'Anhui', 31.82, 117.22]);
  const province = await pool.query('SELECT id FROM provinces WHERE code = $1', ['anhui']);
  await pool.query(`INSERT INTO scenic_spots (province_id, country_id, code, name, name_en, description, culture, history, latitude, longitude, featured_image, tags) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT DO NOTHING`,
    [province.rows[0].id, country.rows[0].id, 'huangshan', '黄山', 'Mount Huangshan',
      '黄山，中华十大名山之一，被誉为"天下第一奇山"。',
      '黄山文化源远流长...', '黄山古称黟山...',
      30.133, 118.175, '/images/huangshan/hero.jpg',
      ['世界遗产', '天下第一奇山', '摄影圣地', '云海日出']]);
  console.log('Seed complete!');
  await pool.end();
}
seed().catch(e => { console.error(e); process.exit(1); });