 import { NextRequest, NextResponse } from 'next/server';
 import { writeFile, mkdir } from 'fs/promises';
 import path from 'path';
 
 export async function POST(request: NextRequest) {
   try {
     const formData = await request.formData();
     const file = formData.get('file') as File | null;
     const spotId = formData.get('spotId') as string | null;
 
     if (!file) {
       return NextResponse.json({ error: '请选择文件' }, { status: 400 });
     }
 
     // 生成唯一文件名
     const timestamp = Date.now();
     const ext = path.extname(file.name) || '.jpg';
     const filename = `${timestamp}${ext}`;
 
     // 保存到 uploads 目录
     const uploadDir = path.join(process.cwd(), 'public', 'uploads', spotId || 'general');
     await mkdir(uploadDir, { recursive: true });
 
     const bytes = await file.arrayBuffer();
     const buffer = Buffer.from(bytes);
     const filepath = path.join(uploadDir, filename);
     await writeFile(filepath, buffer);
 
     return NextResponse.json({
       success: true,
       url: `/uploads/${spotId || 'general'}/${filename}`,
     });
   } catch (error) {
     console.error('Upload error:', error);
     return NextResponse.json({ error: '上传失败' }, { status: 500 });
   }
 }
