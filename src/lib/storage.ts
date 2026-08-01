import fs from "node:fs/promises";
import path from "node:path";
import { env } from "@/env";
import { Storage } from "@google-cloud/storage";

const IMAGE_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const IMAGE_MAX_SIZE = 5 * 1024 * 1024;

const PUBLIC_DIR = path.join(process.cwd(), "public");

function createBucket() {
  if (env.APP_ENV === "development") {
    return null;
  }
  if (!env.GCS_BUCKET) {
    throw new Error("GCS_BUCKET is required when APP_ENV is not development");
  }
  return new Storage().bucket(env.GCS_BUCKET);
}

let _bucket: ReturnType<typeof createBucket> | undefined;
function getBucket(): ReturnType<typeof createBucket> {
  if (_bucket === undefined) {
    _bucket = createBucket();
  }
  return _bucket;
}

function randomKey(prefix: string, ext: string): string {
  const rand = Math.random().toString(36).slice(2);
  return `${prefix}/${Date.now()}-${rand}${ext}`;
}

async function saveLocally(key: string, body: Buffer): Promise<string> {
  const filePath = path.join(PUBLIC_DIR, key);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, body);
  return `/${key}`;
}

async function putObject(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  const bucket = getBucket();
  if (!bucket) {
    return saveLocally(key, body);
  }
  await bucket.file(key).save(body, {
    contentType,
    resumable: false,
  });
  return `https://storage.googleapis.com/${env.GCS_BUCKET}/${key}`;
}

export function validateImageFile(file: File): string | null {
  if (!IMAGE_ALLOWED_TYPES.includes(file.type)) {
    return "対応していないファイル形式です（JPEG・PNG・WebP・GIF のみ）";
  }
  if (file.size > IMAGE_MAX_SIZE) {
    return "ファイルサイズは5MB以下にしてください";
  }
  return null;
}

export async function uploadImage(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name) || ".jpg";
  const key = randomKey("uploads/images", ext);
  return putObject(key, buffer, file.type);
}
