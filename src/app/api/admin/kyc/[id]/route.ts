// PATCH /api/admin/kyc/[id] — approve or reject a KYC record
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requirePermission } from "@/lib/guards";
import { getSignedUrl, extractStorageKey } from "@/lib/storage";

// Postgres bigint tops out at 9,223,372,036,854,775,807. Cap process time to a
// safe integer ceiling and floor negatives (clock skew) at 0 so a bad
// timestamp can never overflow the column or block a KYC decision.
function clampProcessTime(ms: number): number | null {
  if (!Number.isFinite(ms)) return null;
  return Math.min(Math.max(Math.round(ms), 0), Number.MAX_SAFE_INTEGER);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requirePermission("approve-kyc");
    if (guard.error) return guard.error;

    const { id } = await params;
    
    const record = await db("kyc_records")
      .leftJoin("users", "kyc_records.user_id", "users.id")
      .leftJoin("merchants", "users.id", "merchants.user_id")
      .select(
        "kyc_records.*",
        "users.email",
        "merchants.business_name",
        "merchants.business_type as merchant_business_type",
        "merchants.logo_url",
        "merchants.gps_address",
        "merchants.company_phone",
        "merchants.tier as merchant_tier",
        "merchants.business_address_line1",
        "merchants.business_address_line2",
        "merchants.business_city",
        "merchants.business_region",
        "merchants.business_country"
      )
      .where({ "kyc_records.id": id })
      .first();

    if (!record) {
      return Response.json({ error: "KYC record not found" }, { status: 404 });
    }

    const documents = await db("kyc_documents").where({ kyc_id: id });
    const bucketName = process.env.GCS_BUCKET_NAME || "trite-kyc-bucket";
    
    const docsWithUrls = await Promise.all(
      documents.map(async (doc: any) => {
        let url = "";
        try {
          url = await getSignedUrl(bucketName, doc.storage_key);
        } catch (e) {
          console.error(`Failed to get signed url for ${doc.storage_key}`, e);
        }
        
        let label = undefined;
        if (doc.doc_type === "GHANA_CARD" || doc.doc_type === "DIRECTOR_GHANA_CARD") {
          if (doc.storage_key.includes("_front_")) label = "front";
          if (doc.storage_key.includes("_back_")) label = "back";
        }

        return {
          id: doc.id,
          doc_type: doc.doc_type,
          storage_key: doc.storage_key,
          status: doc.status,
          uploaded_at: doc.created_at,
          url,
          label,
        };
      })
    );

    // Resolve director card URLs
    let directors = Array.isArray(record.directors)
      ? record.directors
      : JSON.parse(record.directors || "[]");

    directors = await Promise.all(
      directors.map(async (dir: any) => {
        let frontUrl = dir.ghana_card_front_url || "";
        let backUrl = dir.ghana_card_back_url || "";

        if (dir.ghana_card_front_key) {
          try {
            frontUrl = await getSignedUrl(bucketName, dir.ghana_card_front_key);
          } catch (e) {
            console.warn(`Admin KYC: failed signed url for director front key ${dir.ghana_card_front_key}`, e);
          }
        }
        if (dir.ghana_card_back_key) {
          try {
            backUrl = await getSignedUrl(bucketName, dir.ghana_card_back_key);
          } catch (e) {
            console.warn(`Admin KYC: failed signed url for director back key ${dir.ghana_card_back_key}`, e);
          }
        }

        return {
          ...dir,
          ghana_card_front_url: frontUrl,
          ghana_card_back_url: backUrl,
        };
      })
    );

    // Resolve beneficial owner doc URLs
    let beneficialOwners = Array.isArray(record.beneficial_owners)
      ? record.beneficial_owners
      : JSON.parse(record.beneficial_owners || "[]");

    beneficialOwners = await Promise.all(
      beneficialOwners.map(async (bo: any) => {
        let docUrl = bo.profile_doc_url || "";
        if (bo.profile_doc_key) {
          try {
            docUrl = await getSignedUrl(bucketName, bo.profile_doc_key);
          } catch (e) {
            console.warn(`Admin KYC: failed signed url for BO key ${bo.profile_doc_key}`, e);
          }
        }
        return {
          ...bo,
          profile_doc_url: docUrl,
        };
      })
    );

    // Resolve logo url
    const rawLogo = record.logo_url || null;
    const logoKey = extractStorageKey(rawLogo);
    let logoUrl = rawLogo;
    if (logoKey) {
      try {
        logoUrl = await getSignedUrl(bucketName, logoKey);
      } catch (e) {
        console.warn("Admin KYC: failed signed url for logo:", e);
      }
    }

    return Response.json({
      data: {
        ...record,
        business_type: record.business_type || record.merchant_business_type || "LIMITED_LIABILITY",
        directors,
        beneficial_owners: beneficialOwners,
        user: { email: record.email },
        merchant: {
          business_name: record.business_name,
          business_type: record.merchant_business_type,
          logo_url: logoUrl,
          gps_address: record.gps_address,
          company_phone: record.company_phone,
          tier: record.merchant_tier,
          business_address_line1: record.business_address_line1,
          business_address_line2: record.business_address_line2,
          business_city: record.business_city,
          business_region: record.business_region,
          business_country: record.business_country,
        },
        documents: docsWithUrls,
      }
    });
  } catch (error) {
    console.error("Admin KYC GET error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requirePermission("approve-kyc");
    if (guard.error) return guard.error;

    const { id } = await params;
    const body = await request.json();
    const { status, review_notes } = body;

    if (!status || !["APPROVED", "REJECTED", "IN_REVIEW"].includes(status)) {
      return Response.json(
        { error: "status must be one of: APPROVED, REJECTED, IN_REVIEW" },
        { status: 400 }
      );
    }

    const record = await db("kyc_records").where({ id }).first();
    if (!record) {
      return Response.json(
        { error: "KYC record not found" },
        { status: 404 }
      );
    }

    // Calculate process time. submitted_at is null until the merchant actually
    // submits (migration 0039) and an admin can still open such a record
    // directly, so there is no submission to measure from — leave it unset
    // rather than measuring from the epoch.
    //
    // process_time_ms is bigint (migration 0040), but guard the value anyway so
    // a bad clock or corrupt timestamp can never block a compliance decision:
    // clamp negatives (clock skew) to 0 and drop non-finite values to null.
    const processTime = record.submitted_at
      ? clampProcessTime(Date.now() - new Date(record.submitted_at).getTime())
      : null;

    const [updated] = await db("kyc_records")
      .where({ id })
      .update({
        status,
        review_notes: review_notes || null,
        reviewed_at: db.fn.now(),
        reviewed_by: guard.session.userId,
        process_time_ms: processTime,
      })
      .returning("*");

    // If approved, activate the user
    if (status === "APPROVED") {
      await db("users")
        .where({ id: record.user_id })
        .update({ status: "ACTIVE" });
    }

    // Log the event
    await db("system_logs").insert({
      level: status === "REJECTED" ? "WARN" : "INFO",
      source: "KYC_ENGINE",
      event_description: `KYC ${record.identity_id} ${status.toLowerCase()} by admin ${guard.session.userId} (${processTime ?? 0}ms)`,
      actor_id: guard.session.userId,
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
    });

    return Response.json({ data: updated });
  } catch (error) {
    console.error("KYC update error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
