import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireMerchant } from "@/lib/guards";
import { uploadFile, getSignedUrl } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const guard = await requireMerchant();
    if (guard.error) return guard.error;
    const session = guard.session;

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json({ error: "Missing file" }, { status: 400 });
    }

    const merchant = await db("merchants").where({ user_id: session.userId }).first();
    if (!merchant) {
      return Response.json({ error: "Merchant profile not found" }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const extension = file.name.split(".").pop() || "png";
    const bucketName = process.env.GCS_BUCKET_NAME || "trite-kyc-bucket";
    const key = `merchants/${merchant.id}/logo_${timestamp}.${extension}`;

    await uploadFile(bucketName, key, buffer, file.type || "image/png");

    // Update merchant's logo_url
    await db("merchants")
      .where({ id: merchant.id })
      .update({
        logo_url: key,
        updated_at: db.fn.now(),
      });

    let signedUrl = "";
    try {
      signedUrl = await getSignedUrl(bucketName, key);
    } catch (e) {
      console.warn("Failed to get signed URL for uploaded logo:", e);
    }

    return Response.json({
      data: {
        storage_key: key,
        url: signedUrl,
      },
    });
  } catch (error) {
    console.error("Merchant logo upload error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
