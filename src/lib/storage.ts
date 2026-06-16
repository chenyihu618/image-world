import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const endpoint = process.env.STORAGE_ENDPOINT || '';
const region = process.env.STORAGE_REGION || 'auto';
const accessKey = process.env.STORAGE_ACCESS_KEY || '';
const secretKey = process.env.STORAGE_SECRET_KEY || '';
const bucket = process.env.STORAGE_BUCKET || 'imageworld-photos';
const publicUrl = process.env.STORAGE_PUBLIC_URL || '';

function getClient(): S3Client | null {
  if (!endpoint) return null;
  return new S3Client({
    endpoint, region, forcePathStyle: true,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  });
}

export async function uploadPhoto(filename: string, buffer: Buffer, mimeType: string): Promise<string | null> {
  const client = getClient();
  if (!client) return null;
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: filename, Body: buffer, ContentType: mimeType }));
  return publicUrl ? `${publicUrl}/${filename}` : `/api/photos/${filename}`;
}

export async function getPhotoUrl(filename: string): Promise<string | null> {
  const client = getClient();
  if (!client) return null;
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: filename });
  return await getSignedUrl(client, cmd, { expiresIn: 3600 });
}

export async function listPhotos(prefix: string): Promise<string[]> {
  const client = getClient();
  if (!client) return [];
  const r = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix }));
  return (r.Contents || []).map((o) => o.Key!).filter(Boolean);
}