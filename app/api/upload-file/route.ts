import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET } from "@/lib/r2";
import { requireAuth } from "@/lib/session";
import { assertCanSubmit } from "@/lib/member-settings";

// Allow longer timeout for large file uploads
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    await assertCanSubmit();
    await requireAuth();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const key = formData.get("key") as string | null;

    if (!file || !key) {
      return NextResponse.json({ error: "Missing file or key" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    const status =
      message === "Unauthorized"
        ? 401
        : message.includes("disabled")
          ? 403
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
