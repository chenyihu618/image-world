 import { NextRequest, NextResponse } from 'next/server';
 import { readFile, writeFile, mkdir } from 'fs/promises';
 import path from 'path';
 
 const DATA_FILE = path.join(process.cwd(), 'public', 'data', 'notes.json');
 
 interface Note {
   id: string;
   spotId: string;
   author: string;
   title: string;
   content: string;
   createdAt: string;
 }
 
 async function readNotes(): Promise<Note[]> {
   try {
     const text = await readFile(DATA_FILE, 'utf-8');
     return JSON.parse(text);
   } catch {
     return [];
   }
 }
 
 async function writeNotes(notes: Note[]): Promise<void> {
   await mkdir(path.dirname(DATA_FILE), { recursive: true });
   await writeFile(DATA_FILE, JSON.stringify(notes, null, 2), 'utf-8');
 }
 
 // GET /api/note?spotId=xxx
 export async function GET(request: NextRequest) {
   const spotId = request.nextUrl.searchParams.get('spotId');
   const notes = await readNotes();
 
   if (spotId) {
     return NextResponse.json(notes.filter((n) => n.spotId === spotId));
   }
 
   return NextResponse.json(notes);
 }
 
 // POST /api/note
 export async function POST(request: NextRequest) {
   try {
     const body = await request.json();
     const { spotId, author, title, content } = body;
 
     if (!spotId || !author || !content) {
       return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
     }
 
     const note: Note = {
       id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
       spotId,
       author: author.trim(),
       title: (title || '').trim(),
       content: content.trim(),
       createdAt: new Date().toISOString(),
     };
 
     const notes = await readNotes();
     notes.unshift(note);
     await writeNotes(notes);
 
     return NextResponse.json(note);
   } catch (error) {
     console.error('Note error:', error);
     return NextResponse.json({ error: '保存失败' }, { status: 500 });
   }
 }
