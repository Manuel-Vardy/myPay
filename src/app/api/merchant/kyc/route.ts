import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireVerifiedMerchant } from "@/lib/guards";
import { getSignedUrl, extractStorageKey } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const guard = await requireVerifiedMerchant();
    if (guard.error) return guard.error;
    const session = guard.session;

    const merchant = await db("merchants").where({ user_id: session.userId }).first();
    if (!merchant) {
      return Response.json({ error: "Merchant not found" }, { status: 404 });
    }

    let kycRecord = await db("kyc_records").where({ user_id: session.userId }).first();
    
    // Auto-create initial draft kyc_record if none exists
    if (!kycRecord) {
      const [newRec] = await db("kyc_records")
        .insert({
          user_id: session.userId,
          identity_id: `TR-${Math.floor(Math.random() * 100000)}-KYC`,
          tier: merchant.tier === "PREMIUM" || merchant.tier === "ENTERPRISE" ? "ENHANCED" : "STANDARD",
          status: "PENDING",
          business_type: merchant.business_type || "LIMITED_LIABILITY",
          directors: JSON.stringify([]),
          beneficial_owners: JSON.stringify([]),
          current_step: 1,
        })
        .returning("*");
      kycRecord = newRec;
    }

    const documents = await db("kyc_documents").where({ kyc_id: kycRecord.id });
    const bucketName = process.env.GCS_BUCKET_NAME || "trite-kyc-bucket";

    // Resolve document URLs
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
    let directors = Array.isArray(kycRecord.directors)
      ? kycRecord.directors
      : JSON.parse(kycRecord.directors || "[]");

    directors = await Promise.all(
      directors.map(async (dir: any) => {
        let frontUrl = dir.ghana_card_front_url || "";
        let backUrl = dir.ghana_card_back_url || "";

        if (dir.ghana_card_front_key) {
          try {
            frontUrl = await getSignedUrl(bucketName, dir.ghana_card_front_key);
          } catch (e) {
            console.warn(`Failed signed url for director front key ${dir.ghana_card_front_key}`, e);
          }
        }
        if (dir.ghana_card_back_key) {
          try {
            backUrl = await getSignedUrl(bucketName, dir.ghana_card_back_key);
          } catch (e) {
            console.warn(`Failed signed url for director back key ${dir.ghana_card_back_key}`, e);
          }
        }

        return {
          ...dir,
          ghana_card_front_url: frontUrl,
          ghana_card_back_url: backUrl,
        };
      })
    );

    // Resolve beneficial owner document URLs
    let beneficialOwners = Array.isArray(kycRecord.beneficial_owners)
      ? kycRecord.beneficial_owners
      : JSON.parse(kycRecord.beneficial_owners || "[]");

    beneficialOwners = await Promise.all(
      beneficialOwners.map(async (bo: any) => {
        let docUrl = bo.profile_doc_url || "";
        if (bo.profile_doc_key) {
          try {
            docUrl = await getSignedUrl(bucketName, bo.profile_doc_key);
          } catch (e) {
            console.warn(`Failed signed url for BO key ${bo.profile_doc_key}`, e);
          }
        }
        return {
          ...bo,
          profile_doc_url: docUrl,
        };
      })
    );

    // Resolve merchant logo
    const rawLogo = merchant.logo_url || null;
    const logoKey = extractStorageKey(rawLogo);
    let logoUrl = rawLogo;
    if (logoKey) {
      try {
        logoUrl = await getSignedUrl(bucketName, logoKey);
      } catch (e) {
        console.warn("Failed signed url for merchant logo:", e);
      }
    }

    return Response.json({
      data: {
        id: kycRecord.id,
        status: kycRecord.status,
        submitted_at: kycRecord.submitted_at,
        review_notes: kycRecord.review_notes,
        business_type: kycRecord.business_type || merchant.business_type || "LIMITED_LIABILITY",
        directors,
        beneficial_owners: beneficialOwners,
        current_step: kycRecord.current_step || 1,
        documents: docsWithUrls,
        merchant_profile: {
          business_name: merchant.business_name,
          business_type: merchant.business_type,
          logo_url: logoUrl,
          logo_key: logoKey || (!rawLogo?.startsWith("http") ? rawLogo : null),
          gps_address: merchant.gps_address,
          company_phone: merchant.company_phone,
          business_address_line1: merchant.business_address_line1,
          business_address_line2: merchant.business_address_line2,
          business_city: merchant.business_city,
          business_region: merchant.business_region,
          business_country: merchant.business_country,
          notification_email: merchant.notification_email,
        },
      },
    });
  } catch (error) {
    console.error("Merchant KYC GET error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const guard = await requireVerifiedMerchant();
    if (guard.error) return guard.error;
    const session = guard.session;

    const body = await request.json();
    const {
      business_type,
      directors,
      beneficial_owners,
      current_step,
      gps_address,
      company_phone,
      logo_url,
      business_name,
    } = body;

    const merchant = await db("merchants").where({ user_id: session.userId }).first();
    if (!merchant) {
      return Response.json({ error: "Merchant not found" }, { status: 404 });
    }

    let kycRecord = await db("kyc_records").where({ user_id: session.userId }).first();
    if (!kycRecord) {
      const [newRec] = await db("kyc_records")
        .insert({
          user_id: session.userId,
          identity_id: `TR-${Math.floor(Math.random() * 100000)}-KYC`,
          tier: merchant.tier === "PREMIUM" || merchant.tier === "ENTERPRISE" ? "ENHANCED" : "STANDARD",
          status: "PENDING",
        })
        .returning("*");
      kycRecord = newRec;
    }

    // Prepare kyc updates
    const kycUpdates: Record<string, unknown> = {
      updated_at: db.fn.now(),
    };

    if (business_type !== undefined) kycUpdates.business_type = business_type;
    if (directors !== undefined) kycUpdates.directors = JSON.stringify(directors);
    if (beneficial_owners !== undefined) kycUpdates.beneficial_owners = JSON.stringify(beneficial_owners);
    if (current_step !== undefined) kycUpdates.current_step = Number(current_step) || 1;

    await db("kyc_records").where({ id: kycRecord.id }).update(kycUpdates);

    // Synchronize company profile changes to merchants table
    const merchantUpdates: Record<string, unknown> = {
      updated_at: db.fn.now(),
    };
    if (business_type !== undefined) merchantUpdates.business_type = business_type;
    if (gps_address !== undefined) merchantUpdates.gps_address = gps_address;
    if (company_phone !== undefined) merchantUpdates.company_phone = company_phone;
    if (logo_url !== undefined) {
      const extractedKey = extractStorageKey(logo_url);
      merchantUpdates.logo_url = extractedKey ?? (logo_url || null);
    }
    if (business_name !== undefined) merchantUpdates.business_name = business_name;

    await db("merchants").where({ id: merchant.id }).update(merchantUpdates);

    return Response.json({ message: "KYC draft updated successfully" });
  } catch (error) {
    console.error("Merchant KYC PUT draft error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
