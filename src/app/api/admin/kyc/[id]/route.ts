// PATCH /api/admin/kyc/[id] — approve or reject a KYC record
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { getSignedUrl } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    const { id } = await params;
    
    const record = await db("kyc_records")
      .leftJoin("users", "kyc_records.user_id", "users.id")
      .leftJoin("merchants", "users.id", "merchants.user_id")
      .select(
        "kyc_records.*",
        "users.email",
        "merchants.business_name",
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
        if (doc.doc_type === "GHANA_CARD") {
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

    return Response.json({
      data: {
        ...record,
        user: { email: record.email },
        merchant: {
          business_name: record.business_name,
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
    const guard = await requireAdmin();
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

    // Calculate process time
    const submittedAt = new Date(record.submitted_at).getTime();
    const processTime = Date.now() - submittedAt;

    const [updated] = await db("kyc_records")
      .where({ id })
      .update({
        status,
        review_notes: review_notes || null,
        reviewed_at: db.fn.now(),
        process_time_ms: processTime,
        // TODO: set reviewed_by from authenticated admin context
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
      event_description: `KYC ${record.identity_id} ${status.toLowerCase()} (${processTime}ms)`,
      actor_id: record.user_id,
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
