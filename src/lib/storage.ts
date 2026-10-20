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

/**
 * Extracts the canonical object key from a GCS signed or public URL,
 * or returns the string directly if it's already a relative storage key.
 * If the URL is an external web link (not GCS), returns null.
 */
export function extractStorageKey(urlOrKey: string | null | undefined): string | null {
  if (!urlOrKey || typeof urlOrKey !== "string") return null;
  const trimmed = urlOrKey.trim();
  if (!trimmed) return null;

  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    // Already a relative storage key (e.g. 'merchants/1/logo.png' or 'kyc/...')
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase();

    // Case 1: https://storage.googleapis.com/<bucket>/<key> or https://storage.cloud.google.com/<bucket>/<key>
    if (hostname === "storage.googleapis.com" || hostname === "storage.cloud.google.com") {
      const parts = parsed.pathname.replace(/^\/+/, "").split("/");
      if (parts.length >= 2) {
        // parts[0] is the bucket, rest is the key
        const extractedKey = decodeURIComponent(parts.slice(1).join("/"));
        return extractedKey || null;
      }
    }

    // Case 2: https://<bucket>.storage.googleapis.com/<key>
    if (hostname.endsWith(".storage.googleapis.com")) {
      const extractedKey = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
      return extractedKey || null;
    }

    // External URL, not GCS
    return null;
  } catch {
    return null;
  }
}
