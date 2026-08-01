import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireMerchant } from "@/lib/guards";

export async function POST(request: NextRequest) {
  try {
    const guard = await requireMerchant();
    if (guard.error) return guard.error;
    const session = guard.session;

    const kycRecord = await db("kyc_records").where({ user_id: session.userId }).first();
    if (!kycRecord) {
      return Response.json({ error: "KYC record not found" }, { status: 404 });
    }

    const documents = await db("kyc_documents").where({ kyc_id: kycRecord.id });

    const requiredDocs = ["BUSINESS_REGISTRATION", "TAX_CERTIFICATE", "UTILITY_BILL"];
    let hasAllRequired = requiredDocs.every((docType) => documents.some((d: any) => d.doc_type === docType));

    // For GHANA_CARD, we need both front and back
    const ghanaCards = documents.filter((d: any) => d.doc_type === "GHANA_CARD");
    const hasFront = ghanaCards.some((d: any) => d.storage_key.includes("_front_"));
    const hasBack = ghanaCards.some((d: any) => d.storage_key.includes("_back_"));

    if (!hasAllRequired || !hasFront || !hasBack) {
      return Response.json({ error: "Missing required documents" }, { status: 400 });
    }

    const updated = await db("kyc_records")
      .where({ id: kycRecord.id })
      .update({
        status: "PENDING",
        submitted_at: db.fn.now(),
        updated_at: db.fn.now(),
      })
      .returning("*");

    return Response.json({ data: updated[0] });

  } catch (error) {
    console.error("Merchant KYC Submit error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
