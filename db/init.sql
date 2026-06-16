 -- ============================================================
 -- image-world - Database Schema
 -- ============================================================
 
 -- Countries
 CREATE TABLE IF NOT EXISTS countries (
   id SERIAL PRIMARY KEY,
   code VARCHAR(20) UNIQUE NOT NULL,
   name VARCHAR(100) NOT NULL,
   name_en VARCHAR(100) NOT NULL DEFAULT '',
   latitude DOUBLE PRECISION NOT NULL DEFAULT 0,
   longitude DOUBLE PRECISION NOT NULL DEFAULT 0,
   zoom_level INTEGER NOT NULL DEFAULT 4,
   display_order INTEGER NOT NULL DEFAULT 0,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 );
 
 -- Provinces / States
 CREATE TABLE IF NOT EXISTS provinces (
   id SERIAL PRIMARY KEY,
   country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
   code VARCHAR(20) UNIQUE NOT NULL,
   name VARCHAR(100) NOT NULL,
   name_en VARCHAR(100) NOT NULL DEFAULT '',
   latitude DOUBLE PRECISION NOT NULL DEFAULT 0,
   longitude DOUBLE PRECISION NOT NULL DEFAULT 0,
   display_order INTEGER NOT NULL DEFAULT 0,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 );
 
 -- Scenic Spots
 CREATE TABLE IF NOT EXISTS scenic_spots (
   id SERIAL PRIMARY KEY,
   province_id INTEGER REFERENCES provinces(id) ON DELETE CASCADE,
   country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
   code VARCHAR(50) UNIQUE NOT NULL,
   name VARCHAR(200) NOT NULL,
   name_en VARCHAR(200) NOT NULL DEFAULT '',
   description TEXT NOT NULL DEFAULT '',
   culture TEXT NOT NULL DEFAULT '',
   history TEXT NOT NULL DEFAULT '',
   latitude DOUBLE PRECISION NOT NULL DEFAULT 0,
   longitude DOUBLE PRECISION NOT NULL DEFAULT 0,
   featured_image VARCHAR(500) NOT NULL DEFAULT '',
   tags TEXT[] NOT NULL DEFAULT '{}',
   display_order INTEGER NOT NULL DEFAULT 0,
   is_published BOOLEAN NOT NULL DEFAULT TRUE,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 );
 
 -- Photos
 CREATE TABLE IF NOT EXISTS photos (
   id SERIAL PRIMARY KEY,
   scenic_spot_id INTEGER REFERENCES scenic_spots(id) ON DELETE CASCADE,
   uploader_id INTEGER,
   filename VARCHAR(500) NOT NULL,
   original_name VARCHAR(500) NOT NULL DEFAULT '',
   url VARCHAR(1000) NOT NULL,
   thumbnail_url VARCHAR(1000) NOT NULL DEFAULT '',
   width INTEGER NOT NULL DEFAULT 0,
   height INTEGER NOT NULL DEFAULT 0,
   file_size BIGINT NOT NULL DEFAULT 0,
   mime_type VARCHAR(50) NOT NULL DEFAULT 'image/jpeg',
   is_featured BOOLEAN NOT NULL DEFAULT FALSE,
   display_order INTEGER NOT NULL DEFAULT 0,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 );
 
 -- Users
 CREATE TABLE IF NOT EXISTS users (
   id SERIAL PRIMARY KEY,
   username VARCHAR(50) UNIQUE NOT NULL,
   email VARCHAR(200) UNIQUE NOT NULL DEFAULT '',
   password_hash VARCHAR(255) NOT NULL,
   display_name VARCHAR(100) NOT NULL DEFAULT '',
   avatar_url VARCHAR(500) NOT NULL DEFAULT '',
   role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 );
 
 -- Travel Notes
 CREATE TABLE IF NOT EXISTS travel_notes (
   id SERIAL PRIMARY KEY,
   scenic_spot_id INTEGER REFERENCES scenic_spots(id) ON DELETE CASCADE,
   user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
   author VARCHAR(100) NOT NULL DEFAULT '',
   title VARCHAR(200) NOT NULL DEFAULT '',
   content TEXT NOT NULL,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 );
 
 -- Indexes
 CREATE INDEX IF NOT EXISTS idx_provinces_country ON provinces(country_id);
 CREATE INDEX IF NOT EXISTS idx_scenic_spots_province ON scenic_spots(province_id);
 CREATE INDEX IF NOT EXISTS idx_scenic_spots_country ON scenic_spots(country_id);
 CREATE INDEX IF NOT EXISTS idx_photos_spot ON photos(scenic_spot_id);
 CREATE INDEX IF NOT EXISTS idx_photos_uploader ON photos(uploader_id);
 CREATE INDEX IF NOT EXISTS idx_notes_spot ON travel_notes(scenic_spot_id);
 CREATE INDEX IF NOT EXISTS idx_notes_user ON travel_notes(user_id);
 CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
 CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
