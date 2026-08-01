import { type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { getCryptoProvider } from "@/lib/payments";

export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const webhooks = await db("platform_settings")
      .whereLike("key", "integration:%:webhook");
      
    // return array of webhooks with key, url, eventTypes (excluding secret)
    const result = webhooks.map(w => {
      const provider = w.key.split(":")[1];
      return {
        provider,
        id: w.value.id,
        url: w.value.url,
        eventTypes: w.value.eventTypes
      };
    });

    return Response.json(result);
  } catch (error) {
    console.error("Failed to fetch webhooks", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const { provider, url, eventTypes } = body;

    if (!provider || !url || !Array.isArray(eventTypes)) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    let webhookId = "";
    let webhookSecret = "";

    if (provider === "triton") {
      const crypto = getCryptoProvider();
      // Since getCryptoProvider currently returns TritonProvider, we can use it directly
      const triton = crypto as any; 
      
      const res = await triton.registerWebhook(url, eventTypes);
      webhookId = res.id;
      webhookSecret = res.signingSecret;
    } else if (provider === "moolre") {
      webhookId = randomUUID();
      webhookSecret = "";
    } else {
      return Response.json({ error: "Unsupported provider" }, { status: 400 });
    }

    // Save to DB
    const key = `integration:${provider}:webhook`;
    const value = JSON.stringify({
      id: webhookId,
      secret: webhookSecret,
      url,
      eventTypes
    });

    await db("platform_settings")
      .insert({
        key,
        value,
        updated_by: guard.session.userId,
      })
      .onConflict("key")
      .merge({
        value,
        updated_at: db.fn.now(),
        updated_by: guard.session.userId,
      });

    return Response.json({ success: true, id: webhookId });
  } catch (error: any) {
    console.error("Failed to register webhook", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const provider = new URL(request.url).searchParams.get("provider");
    if (!provider) return Response.json({ error: "Missing provider" }, { status: 400 });

    const deleted = await db("platform_settings")
      .where({ key: `integration:${provider}:webhook` })
      .delete();

    return deleted
      ? Response.json({ success: true })
      : Response.json({ error: "Webhook not found" }, { status: 404 });
  } catch (error) {
    console.error("Failed to delete webhook", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
