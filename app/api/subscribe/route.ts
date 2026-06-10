import { NextResponse } from "next/server";
import { hasHoneypot, subscribeInputSchema } from "@/lib/validation";

const BUTTONDOWN_URL = "https://api.buttondown.com/v1/subscribers";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Silently drop honeypot hits so bots cannot tell their submission failed.
  if (hasHoneypot(payload)) {
    return NextResponse.json({ ok: true });
  }

  const parsed = subscribeInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide a valid email." }, { status: 400 });
  }

  const apiKey = process.env.BUTTONDOWN_API_KEY;
  if (!apiKey) {
    console.error("subscribe: BUTTONDOWN_API_KEY not configured");
    return NextResponse.json(
      { error: "Subscriptions are temporarily unavailable." },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(BUTTONDOWN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${apiKey}`,
      },
      body: JSON.stringify({ email_address: parsed.data.email }),
    });

    if (res.ok || res.status === 201) {
      return NextResponse.json({ ok: true });
    }

    // Buttondown returns 400 when the email already exists. We do not want to
    // leak list membership, so map duplicate-email to success.
    const body = await res.text();
    if (res.status === 400 && /already subscribed|already exists/i.test(body)) {
      return NextResponse.json({ ok: true });
    }

    console.error(`subscribe: buttondown ${res.status} ${body}`);
    return NextResponse.json(
      { error: "Could not complete subscription. Please try again." },
      { status: 502 },
    );
  } catch (err) {
    console.error("subscribe: network error", err);
    return NextResponse.json(
      { error: "Could not reach the newsletter service." },
      { status: 502 },
    );
  }
}
