import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET } from "@/lib/r2";

export const runtime = "nodejs";

function contentTypeForKey(key: string): string {
  if (key.endsWith(".webp")) return "image/webp";
  if (key.endsWith(".jpeg") || key.endsWith(".jpg")) return "image/jpeg";
  if (key.endsWith(".png")) return "image/png";
  return "application/octet-stream";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const key = path.join("/");

  if (!key.startsWith("originals/") && !key.startsWith("variants/")) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const response = await r2.send(
      new GetObjectCommand({ Bucket: R2_BUCKET, Key: key })
    );
    const body = await response.Body!.transformToByteArray();

    return new NextResponse(Buffer.from(body), {
      headers: {
        "Content-Type": response.ContentType ?? contentTypeForKey(key),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("Media proxy error:", key, err);
    return new NextResponse("Not found", { status: 404 });
  }
}
