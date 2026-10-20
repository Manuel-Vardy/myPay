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
    const label = formData.get("label") as string | null; // e.g. "front", "back"
    const director_id = formData.get("director_id") as string | null;
    const bo_id = formData.get("bo_id") as string | null;

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
        identity_id: `TR-${Math.floor(Math.random() * 100000)}-KYC`,
        tier: merchantUser.tier === "PREMIUM" || merchantUser.tier === "ENTERPRISE" ? "ENHANCED" : "STANDARD",
        status: "PENDING",
        business_type: merchantUser.business_type || "LIMITED_LIABILITY",
        directors: JSON.stringify([]),
        beneficial_owners: JSON.stringify([]),
        current_step: 1,
      }).returning("*");
      kycRecord = newRecord;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const extension = file.name.split(".").pop() || "png";
    const bucketName = process.env.GCS_BUCKET_NAME || "trite-kyc-bucket";
    const dirSegment = director_id ? `_dir_${director_id}_` : "_";
    const labelSegment = label ? `_${label}_` : "_";
    const key = `kyc/${merchantUser.id}/${doc_type}${dirSegment}${labelSegment}${timestamp}.${extension}`;

    await uploadFile(bucketName, key, buffer, file.type || "application/octet-stream");

    // Insert into kyc_documents
    const [newDoc] = await db("kyc_documents").insert({
      kyc_id: kycRecord.id,
      doc_type,
      storage_key: key,
      status: "PENDING",
    }).returning("*");

    // If director_id is provided, automatically link to that director in kyc_records
    if (director_id) {
      let directors = Array.isArray(kycRecord.directors)
        ? kycRecord.directors
        : JSON.parse(kycRecord.directors || "[]");

      const directorDataRaw = formData.get("director_data") as string | null;
      let clientDir: any = null;
      if (directorDataRaw) {
        try {
          clientDir = JSON.parse(directorDataRaw);
        } catch {}
      }

      let found = false;
      directors = directors.map((dir: any) => {
        if (dir.id === director_id) {
          found = true;
          const merged = clientDir ? { ...dir, ...clientDir } : dir;
          if (label === "front") {
            return { ...merged, ghana_card_front_key: key };
          } else if (label === "back") {
            return { ...merged, ghana_card_back_key: key };
          }
          return merged;
        }
        return dir;
      });

      if (!found) {
        const newDir = clientDir ? { ...clientDir } : { id: director_id };
        if (label === "front") newDir.ghana_card_front_key = key;
        if (label === "back") newDir.ghana_card_back_key = key;
        directors.push(newDir);
      }

      await db("kyc_records")
        .where({ id: kycRecord.id })
        .update({ directors: JSON.stringify(directors), updated_at: db.fn.now() });
    }

    // If bo_id is provided, link to beneficial owner
    if (bo_id) {
      let beneficialOwners = Array.isArray(kycRecord.beneficial_owners)
        ? kycRecord.beneficial_owners
        : JSON.parse(kycRecord.beneficial_owners || "[]");

      const boDataRaw = formData.get("bo_data") as string | null;
      let clientBo: any = null;
      if (boDataRaw) {
        try {
          clientBo = JSON.parse(boDataRaw);
        } catch {}
      }

      let found = false;
      beneficialOwners = beneficialOwners.map((bo: any) => {
        if (bo.id === bo_id) {
          found = true;
          const merged = clientBo ? { ...bo, ...clientBo } : bo;
          return { ...merged, profile_doc_key: key };
        }
        return bo;
      });

      if (!found) {
        const newBo = clientBo ? { ...clientBo, profile_doc_key: key } : { id: bo_id, profile_doc_key: key };
        beneficialOwners.push(newBo);
      }

      await db("kyc_records")
        .where({ id: kycRecord.id })
        .update({ beneficial_owners: JSON.stringify(beneficialOwners), updated_at: db.fn.now() });
    }

    // If company logo
    if (doc_type === "COMPANY_LOGO") {
      await db("merchants")
        .where({ id: merchantUser.id })
        .update({ logo_url: key, updated_at: db.fn.now() });
    }

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
        director_id,
        bo_id,
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
