import { NextRequest, NextResponse } from 'next/server';
import { getScenicSpots } from '@/lib/db';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET() {
  const spots = await getScenicSpots();
  return NextResponse.json(spots);
}

export async function POST(request: NextRequest) {
  try {
    const d = await request.json();
    if (!d.code || !d.name) return NextResponse.json({ error: 'code和name不能为空' }, { status: 400 });

    // 确保国家存在
    const { rows: [country] } = await pool.query(
      `INSERT INTO countries (code, name, name_en, latitude, longitude, zoom_level) 
       VALUES ($1,$2,$3,$4,$5,4) ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
      [d.country || 'china', d.country || '中国', d.countryEn || '', Number(d.latitude)||0, Number(d.longitude)||0]
    );

    // 确保省份存在
    const { rows: [province] } = await pool.query(
      `INSERT INTO provinces (country_id, code, name, name_en, latitude, longitude) 
       VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
      [country.id, d.province || d.code, d.province || d.name, '', Number(d.latitude)||0, Number(d.longitude)||0]
    );

    // 创建景区
    const tags = d.tags ? d.tags.split(',').map((t:string)=>t.trim()) : [];
    await pool.query(
      `INSERT INTO scenic_spots (province_id, country_id, code, name, name_en, description, culture, history, latitude, longitude, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description`,
      [province.id, country.id, d.code, d.name, d.nameEn||'', d.description||'', d.culture||'', d.history||'', Number(d.latitude)||0, Number(d.longitude)||0, tags]
    );

    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message || '创建失败' }, { status: 500 }); }
}