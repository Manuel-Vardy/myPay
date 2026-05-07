import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "MERCHANT") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const merchantUser = await db("merchants").where({ user_id: session.userId }).first();
    if (!merchantUser) {
      return Response.json({ error: "Merchant profile not found" }, { status: 404 });
    }

    const accounts = await db("settlement_accounts")
      .where({ merchant_id: merchantUser.id })
      .orderBy("created_at", "desc");

    // Mask account numbers for security in the response
    const maskedAccounts = accounts.map((acc: any) => ({
      ...acc,
      account_number: `****${String(acc.account_number).slice(-4)}`,
    }));

    return Response.json({ data: maskedAccounts });
  } catch (error) {
    console.error("GET settlement-accounts error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "MERCHANT") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const merchantUser = await db("merchants").where({ user_id: session.userId }).first();
    if (!merchantUser) {
      return Response.json({ error: "Merchant profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { account_type, provider_name, account_name, account_number, branch_code, is_default } = body;

    if (!account_type || !provider_name || !account_name || !account_number) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // If this is set as default, unset other defaults
    if (is_default) {
      await db("settlement_accounts")
        .where({ merchant_id: merchantUser.id })
        .update({ is_default: false });
    }

    // Check if this is the first account, making it the default if so
    const existingAccounts = await db("settlement_accounts").where({ merchant_id: merchantUser.id }).count("id as cnt").first();
    const count = Number((existingAccounts as any)?.cnt || 0);

    const [newAccount] = await db("settlement_accounts")
      .insert({
        merchant_id: merchantUser.id,
        account_type,
        provider_name,
        account_name,
        account_number,
        branch_code: branch_code || null,
        is_default: count === 0 ? true : !!is_default,
      })
      .returning("*");

    return Response.json({ data: newAccount }, { status: 201 });
  } catch (error) {
    console.error("POST settlement-accounts error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
