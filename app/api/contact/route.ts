import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactInputSchema, hasHoneypot } from "@/lib/validation";
import { siteConfig } from "@/lib/site-config";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Silently drop honeypot hits.
  if (hasHoneypot(payload)) {
    return NextResponse.json({ ok: true });
  }

  const parsed = contactInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please fill in name, a valid email, and a message of 20+ characters." },
      { status: 400 },
    );
  }

  const { name, email, company, message } = parsed.data;
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !toEmail || !fromEmail) {
    console.error("contact: missing RESEND_API_KEY, CONTACT_TO_EMAIL or CONTACT_FROM_EMAIL");
    return NextResponse.json(
      { error: "Contact is temporarily unavailable." },
      { status: 503 },
    );
  }

  const resend = new Resend(apiKey);
  const subject = `[${siteConfig.shortName}] Contact from ${name}`;
  const text =
    `From: ${name} <${email}>\n` +
    (company ? `Company: ${company}\n` : "") +
    `\n${message}\n`;

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [toEmail],
    replyTo: email,
    subject,
    text,
  });

  if (error) {
    console.error("contact: resend error", error);
    return NextResponse.json(
      { error: "Could not send your message. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, id: data?.id });
}
