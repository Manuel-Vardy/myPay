// POST   /api/merchant/settings/passkeys — register a passkey credential
// DELETE /api/merchant/settings/passkeys — remove a passkey by credential id
import { type NextRequest } from "next/server";
import db from "@/lib/db";
import { requireMerchant } from "@/lib/guards";

type PasskeyEntry = {
  id: string; // WebAuthn credential id (base64url)
  name: string;
  transports?: string[];
  created_at: string;
};

function parsePasskeys(raw: unknown): PasskeyEntry[] {
  const value = typeof raw === "string" ? JSON.parse(raw || "[]") : raw;
  return Array.isArray(value) ? value : [];
}

export async function POST(request: NextRequest) {
  const guard = await requireMerchant();
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const body = await request.json();
    const credentialId = String(body.credential_id || "").trim();
    const name = String(body.name || "").trim().slice(0, 100) || "My Passkey";

    if (!credentialId) {
      return Response.json({ error: "credential_id is required" }, { status: 400 });
    }

    const user = await db("users").where({ id: session.userId }).first("passkeys");
    const passkeys = parsePasskeys(user?.passkeys);

    if (passkeys.some((p) => p.id === credentialId)) {
      return Response.json({ error: "This passkey is already registered" }, { status: 409 });
    }
    if (passkeys.length >= 10) {
      return Response.json({ error: "Passkey limit reached (10)" }, { status: 400 });
    }

    passkeys.push({
      id: credentialId,
      name,
      transports: Array.isArray(body.transports) ? body.transports.slice(0, 5) : undefined,
      created_at: new Date().toISOString(),
    });

    await db("users")
      .where({ id: session.userId })
      .update({ passkeys: JSON.stringify(passkeys) });

    return Response.json({ data: passkeys, message: "Passkey added" }, { status: 201 });
  } catch (error) {
    console.error("POST passkey error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const guard = await requireMerchant();
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const body = await request.json();
    const credentialId = String(body.credential_id || "");
    if (!credentialId) {
      return Response.json({ error: "credential_id is required" }, { status: 400 });
    }

    const user = await db("users").where({ id: session.userId }).first("passkeys");
    const passkeys = parsePasskeys(user?.passkeys);
    const remaining = passkeys.filter((p) => p.id !== credentialId);

    if (remaining.length === passkeys.length) {
      return Response.json({ error: "Passkey not found" }, { status: 404 });
    }

    await db("users")
      .where({ id: session.userId })
      .update({ passkeys: JSON.stringify(remaining) });

    return Response.json({ data: remaining, message: "Passkey removed" });
  } catch (error) {
    console.error("DELETE passkey error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
