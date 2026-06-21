import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { resolveMediaUrl } from "./media";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
export const R2_BUCKET = process.env.R2_BUCKET_NAME ?? "hdwallpapers";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export function publicUrl(key: string): string {
  return resolveMediaUrl(key);
}

export async function presignPut(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2, command, { expiresIn });
}

export async function presignGet(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({ Bucket: R2_BUCKET, Key: key });
  return getSignedUrl(r2, command, { expiresIn });
}

/**
 * Generate a presigned download URL via the R2 S3-compatible endpoint.
 *
 * ResponseContentDisposition is baked into the signature so R2 returns
 * "Content-Disposition: attachment; filename=..." forcing a browser save-dialog.
 *
 * NOTE: hostname rewriting (to the custom domain) breaks the SigV4 signature
 * because `host` is a signed header. The resulting URL contains the R2 account
 * subdomain, but it is cryptic, signed, and expires in `expiresIn` seconds.
 */
export async function presignDownload(
  key: string,
  filename: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${filename}"`,
  });
  return getSignedUrl(r2, command, { expiresIn });
}

export async function getObjectBuffer(key: string): Promise<Buffer> {
  const response = await r2.send(
    new GetObjectCommand({ Bucket: R2_BUCKET, Key: key })
  );
  const bytes = await response.Body!.transformToByteArray();
  return Buffer.from(bytes);
}

export async function putObject(
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
}

export function originalKey(publicId: string, ext: string): string {
  return `originals/${publicId}/original.${ext}`;
}

export function variantKey(
  publicId: string,
  width: number,
  height: number,
  format: string
): string {
  return `variants/${publicId}/${width}x${height}.${format}`;
}
