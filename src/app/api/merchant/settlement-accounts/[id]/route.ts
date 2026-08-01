import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireMerchant } from "@/lib/guards";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireMerchant();
    if (guard.error) return guard.error;
    const session = guard.session;

    const merchantUser = await db("merchants").where({ user_id: session.userId }).first();
    if (!merchantUser) {
      return Response.json({ error: "Merchant profile not found" }, { status: 404 });
    }

    const { id: accountId } = await params;

    // Check if account belongs to merchant
    const account = await db("settlement_accounts")
      .where({ id: accountId, merchant_id: merchantUser.id })
      .first();

    if (!account) {
      return Response.json({ error: "Account not found" }, { status: 404 });
    }

    // Protect default account if there are others
    if (account.is_default) {
      const otherAccountsCount = await db("settlement_accounts")
        .where({ merchant_id: merchantUser.id })
        .whereNot("id", accountId)
        .count("id as cnt")
        .first();
        
      if (Number((otherAccountsCount as any)?.cnt || 0) > 0) {
        return Response.json(
          { error: "Cannot delete the default account. Set another account as default first." },
          { status: 400 }
        );
      }
    }

    await db("settlement_accounts").where({ id: accountId }).delete();

    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE settlement-account error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
