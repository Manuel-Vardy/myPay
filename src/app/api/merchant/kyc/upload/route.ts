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
    const doc_type = formData.get("doc_type") as string;
    const label = formData.get("label") as string; // optional e.g. "front", "back"

    if (!file || !doc_type) {
      return Response.json({ error: "Missing file or doc_type" }, { status: 400 });
    }

    const merchantUser = await db("merchants").where({ user_id: session.userId }).first();
    if (!merchantUser) {
      return Response.json({ error: "Merchant profile not found" }, { status: 404 });
    }

    // Ensure KYC record exists
    let kycRecord = await db("kyc_records").where({ user_id: session.userId }).first();
    if (!kycRecord) {
      const [newRecord] = await db("kyc_records").insert({
        user_id: session.userId,
        identity_id: `TR-${Math.floor(Math.random() * 10000)}-KYC`,
        tier: merchantUser.tier === "PREMIUM" || merchantUser.tier === "ENTERPRISE" ? "ENHANCED" : "STANDARD",
        status: "PENDING", // Wait, if they just upload, it should be NOT SUBMITTED but DB enum is PENDING. Wait, DB enum is PENDING, IN_REVIEW, APPROVED, REJECTED, EXPIRED.
        // I will use PENDING.
      }).returning("*");
      kycRecord = newRecord;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const bucketName = process.env.GCS_BUCKET_NAME || "trite-kyc-bucket";
    const labelSegment = label ? `_${label}_` : "_";
    const key = `kyc/${merchantUser.id}/${doc_type}${labelSegment}${timestamp}.${extension}`;

    await uploadFile(bucketName, key, buffer, file.type);

    const [newDoc] = await db("kyc_documents").insert({
      kyc_id: kycRecord.id,
      doc_type,
      storage_key: key,
      status: "PENDING",
    }).returning("*");

    // The document is already stored and recorded — a signed-URL failure
    // (e.g. missing signBlob permission) must not fail the upload. The
    // merchant page re-requests signed URLs when listing documents anyway.
    let url: string | null = null;
    try {
      url = await getSignedUrl(bucketName, key);
    } catch (signError) {
      console.warn("KYC upload: signed URL generation failed (upload succeeded):", signError);
    }

    return Response.json({
      data: {
        id: newDoc.id,
        doc_type: newDoc.doc_type,
        storage_key: newDoc.storage_key,
        status: newDoc.status,
        uploaded_at: newDoc.created_at,
        url,
        label,
      }
    });

  } catch (error) {
    console.error("Merchant KYC Upload error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
