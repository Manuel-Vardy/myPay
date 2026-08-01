import { Storage } from "@google-cloud/storage";

const storage = new Storage();

export async function uploadFile(bucketName: string, key: string, buffer: Buffer, contentType: string): Promise<string> {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(key);

  await file.save(buffer, {
    contentType,
    resumable: false,
  });

  return key;
}

export async function getSignedUrl(bucketName: string, key: string): Promise<string> {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(key);

  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  });

  return url;
}
