import { Pool } from 'pg';
import { getAllScenicSpots as getStaticSpots, getScenicSpot as getStaticSpot, getCountry as getStaticCountry, getProvince as getStaticProvince } from './data';
import type { ScenicSpot, Country, Province } from './types';

const pool = new Pool({ connectionString: process.env.DATABASE_URL || '', max: 10 });

function isConnected(): boolean {
  return !!process.env.DATABASE_URL;
}

// ================ Countries ================
export async function getCountries(): Promise<Country[]> {
  if (!isConnected()) return Object.values(getStaticCountry('china') ? { china: getStaticCountry('china')! } : {});
  const r = await pool.query('SELECT code as id, name, name_en, latitude as "lat", longitude as "lng" FROM countries ORDER BY display_order');
  return r.rows.map((c: any) => ({ ...c, coordinates: { lat: c.lat, lng: c.lng }, provinces: [] }));
}

export async function getCountryByCode(code: string): Promise<Country | null> {
  if (!isConnected()) return getStaticCountry(code) || null;
  const r = await pool.query('SELECT code as id, name, name_en, latitude as "lat", longitude as "lng" FROM countries WHERE code = $1', [code]);
  if (!r.rows[0]) return null;
  return { ...r.rows[0], coordinates: { lat: r.rows[0].lat, lng: r.rows[0].lng }, provinces: [] };
}

// ================ Scenic Spots ================
export async function getScenicSpots(): Promise<ScenicSpot[]> {
  if (!isConnected()) return getStaticSpots();
  const r = await pool.query(`
    SELECT s.code as id, s.name, s.name_en, s.description, s.culture, s.history,
           s.latitude as "lat", s.longitude as "lng", s.featured_image as "featuredImage",
           s.tags, c.name as country, c.code as country_id, p.name as province, p.code as province_id,
           s.created_at as "createdAt"
    FROM scenic_spots s JOIN countries c ON s.country_id = c.id JOIN provinces p ON s.province_id = p.id
    WHERE s.is_published = true ORDER BY s.display_order
  `);
  return r.rows.map((s: any) => ({
    ...s, coordinates: { lat: s.lat, lng: s.lng },
    images: [], tags: s.tags || [],
    createdAt: s.createdAt?.toISOString() || '',
  }));
}

export async function getScenicSpot(code: string): Promise<ScenicSpot | null> {
  if (!isConnected()) return getStaticSpot(code) || null;
  const r = await pool.query(`
    SELECT s.code as id, s.name, s.name_en, s.description, s.culture, s.history,
           s.latitude as "lat", s.longitude as "lng", s.featured_image as "featuredImage",
           s.tags, c.name as country, c.code as country_id, p.name as province, p.code as province_id,
           s.created_at as "createdAt"
    FROM scenic_spots s JOIN countries c ON s.country_id = c.id JOIN provinces p ON s.province_id = p.id
    WHERE s.code = $1 AND s.is_published = true
  `, [code]);
  if (!r.rows[0]) return null;
  // Also get photos for this spot
  const photos = await pool.query('SELECT url FROM photos WHERE scenic_spot_id = (SELECT id FROM scenic_spots WHERE code = $1) ORDER BY display_order, created_at', [code]);
  return {
    ...r.rows[0], coordinates: { lat: r.rows[0].lat, lng: r.rows[0].lng },
    images: photos.rows.map((p: any) => p.url),
    tags: r.rows[0].tags || [],
    createdAt: r.rows[0].createdAt?.toISOString() || '',
  };
}

// ================ Photos ================
export async function getPhotosBySpot(spotCode: string): Promise<any[]> {
  if (!isConnected()) return [];
  const r = await pool.query(`
    SELECT p.* FROM photos p JOIN scenic_spots s ON p.scenic_spot_id = s.id
    WHERE s.code = $1 ORDER BY p.display_order, p.created_at
  `, [spotCode]);
  return r.rows;
}

export async function createPhoto(spotCode: string, data: any): Promise<any> {
  if (!isConnected()) return null;
  const spot = await pool.query('SELECT id FROM scenic_spots WHERE code = $1', [spotCode]);
  if (!spot.rows[0]) return null;
  const r = await pool.query(`
    INSERT INTO photos (scenic_spot_id, uploader_id, filename, original_name, url, thumbnail_url, file_size, mime_type)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
  `, [spot.rows[0].id, data.userId || null, data.filename, data.originalName, data.url, data.thumbnailUrl || '', data.fileSize || 0, data.mimeType || 'image/jpeg']);
  return r.rows[0];
}

// ================ Travel Notes ================
export async function getNotes(spotCode: string): Promise<any[]> {
  if (!isConnected()) {
    const { default: fs } = await import('fs/promises');
    const { default: path } = await import('path');
    try {
      const text = await fs.readFile(path.join(process.cwd(), 'public', 'data', 'notes.json'), 'utf-8');
      const all: any[] = JSON.parse(text);
      return all.filter((n: any) => n.spotId === spotCode);
    } catch { return []; }
  }
  const r = await pool.query(`
    SELECT n.id, n.author, n.title, n.content, n.created_at as "createdAt"
    FROM travel_notes n JOIN scenic_spots s ON n.scenic_spot_id = s.id
    WHERE s.code = $1 ORDER BY n.created_at DESC
  `, [spotCode]);
  return r.rows.map((n: any) => ({ ...n, spotId: spotCode, createdAt: n.createdAt?.toISOString() || '' }));
}

export async function createNote(spotCode: string, data: any): Promise<any> {
  if (!isConnected()) {
    const { default: fs } = await import('fs/promises');
    const { default: path } = await import('path');
    const filePath = path.join(process.cwd(), 'public', 'data', 'notes.json');
    let notes: any[] = [];
    try { notes = JSON.parse(await fs.readFile(filePath, 'utf-8')); } catch {}
    const note = { id: 'note_' + Date.now(), spotId: spotCode, author: data.author, title: data.title || '', content: data.content, createdAt: new Date().toISOString() };
    notes.unshift(note);
    await fs.writeFile(filePath, JSON.stringify(notes, null, 2), 'utf-8');
    return note;
  }
  const spot = await pool.query('SELECT id FROM scenic_spots WHERE code = $1', [spotCode]);
  if (!spot.rows[0]) return null;
  const r = await pool.query(`
    INSERT INTO travel_notes (scenic_spot_id, user_id, author, title, content) VALUES ($1, $2, $3, $4, $5) RETURNING *
  `, [spot.rows[0].id, data.userId || null, data.author || '', data.title || '', data.content]);
  return { ...r.rows[0], spotId: spotCode, createdAt: r.rows[0].created_at?.toISOString() || '' };
}

// ================ Users ================
export async function getUserByUsername(username: string): Promise<any | null> {
  if (!isConnected()) return null;
  const r = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return r.rows[0] || null;
}

export async function getUserById(id: number): Promise<any | null> {
  if (!isConnected()) return null;
  const r = await pool.query('SELECT id, username, email, display_name, role, created_at FROM users WHERE id = $1', [id]);
  return r.rows[0] || null;
}

export async function createUser(username: string, passwordHash: string, email: string): Promise<any> {
  if (!isConnected()) return null;
  const r = await pool.query(
    'INSERT INTO users (username, email, password_hash, display_name) VALUES ($1, $2, $3, $4) RETURNING id, username, email, display_name, role, created_at',
    [username, email, passwordHash, username]
  );
  return r.rows[0];
}