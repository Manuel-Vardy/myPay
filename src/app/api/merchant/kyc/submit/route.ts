import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireMerchant } from "@/lib/guards";
import { validateKycSubmission } from "@/lib/kyc-validation";

export async function POST(request: NextRequest) {
  try {
    const guard = await requireMerchant();
    if (guard.error) return guard.error;
    const session = guard.session;

    const merchant = await db("merchants").where({ user_id: session.userId }).first();
    if (!merchant) {
      return Response.json({ error: "Merchant profile not found" }, { status: 404 });
    }

    const kycRecord = await db("kyc_records").where({ user_id: session.userId }).first();
    if (!kycRecord) {
      return Response.json({ error: "KYC record not found" }, { status: 404 });
    }

    const documents = await db("kyc_documents").where({ kyc_id: kycRecord.id });
    const businessType = kycRecord.business_type || merchant.business_type || "LIMITED_LIABILITY";

    const directors = Array.isArray(kycRecord.directors)
      ? kycRecord.directors
      : JSON.parse(kycRecord.directors || "[]");

    const beneficialOwners = Array.isArray(kycRecord.beneficial_owners)
      ? kycRecord.beneficial_owners
      : JSON.parse(kycRecord.beneficial_owners || "[]");

    const validation = validateKycSubmission({
      businessType,
      gpsAddress: merchant.gps_address,
      companyPhone: merchant.company_phone,
      documents,
      directors,
      beneficialOwners,
    });

    if (!validation.isValid) {
      return Response.json(
        {
          error: "KYC verification checklist is incomplete",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const updated = await db("kyc_records")
      .where({ id: kycRecord.id })
      .update({
        status: "PENDING",
        submitted_at: db.fn.now(),
        updated_at: db.fn.now(),
      })
      .returning("*");

    return Response.json({
      data: updated[0],
      message: "KYC submitted successfully for compliance review",
    });

  } catch (error) {
    console.error("Merchant KYC Submit error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
