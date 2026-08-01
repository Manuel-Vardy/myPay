import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireVerifiedMerchant } from "@/lib/guards";
import { getSignedUrl } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const guard = await requireVerifiedMerchant();
    if (guard.error) return guard.error;
    const session = guard.session;

    const kycRecord = await db("kyc_records").where({ user_id: session.userId }).first();
    
    if (!kycRecord) {
      return Response.json({ data: null });
    }

    const documents = await db("kyc_documents").where({ kyc_id: kycRecord.id });

    // Generate signed URLs for each document
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
        id: kycRecord.id,
        status: kycRecord.status,
        submitted_at: kycRecord.submitted_at,
        review_notes: kycRecord.review_notes,
        documents: docsWithUrls,
      }
    });

  } catch (error) {
    console.error("Merchant KYC GET error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
