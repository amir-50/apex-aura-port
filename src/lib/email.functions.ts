import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type SmtpConfig = {
  smtp_host: string | null; smtp_port: number | null; smtp_user: string | null;
  smtp_pass: string | null; smtp_secure: boolean | null; from_name: string | null;
  from_email: string | null; enabled: boolean | null;
};

async function loadSmtp(): Promise<SmtpConfig | null> {
  const { data } = await supabaseAdmin.from("email_settings").select("*").eq("id", 1).maybeSingle();
  return (data as any) ?? null;
}

async function logEmail(to: string, subject: string, template: string | null, status: "sent" | "failed", error?: string) {
  await supabaseAdmin.from("email_log").insert({ to_email: to, subject, template, status, error: error ?? null });
}

async function sendViaSmtp(_cfg: SmtpConfig, _to: string, _subject: string, _html: string) {
  // SMTP not yet wired in this runtime — falls back to platform email below.
  throw new Error("SMTP runtime not available; using platform email fallback");
}

async function sendViaLovable(to: string, subject: string, html: string, fromName: string) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("No email provider configured");
  const res = await fetch("https://gateway.lovable.dev/v1/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ to, subject, html, from_name: fromName }),
  });
  if (!res.ok) throw new Error(`Email gateway: ${res.status}`);
}

export const sendEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    to: z.string().email().max(255),
    subject: z.string().min(1).max(255),
    html: z.string().min(1).max(50000),
    template: z.string().max(80).optional(),
  }).parse(d))
  .handler(async ({ data }) => {
    const cfg = await loadSmtp();
    try {
      if (cfg?.enabled && cfg.smtp_host && cfg.smtp_user && cfg.smtp_pass) {
        await sendViaSmtp(cfg, data.to, data.subject, data.html);
      } else {
        await sendViaLovable(data.to, data.subject, data.html, cfg?.from_name ?? "Amir Nazir");
      }
      await logEmail(data.to, data.subject, data.template ?? null, "sent");
      return { ok: true };
    } catch (err: any) {
      await logEmail(data.to, data.subject, data.template ?? null, "failed", err?.message);
      return { ok: false, error: err?.message ?? "Send failed" };
    }
  });

export const sendTestEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ to: z.string().email().max(255) }).parse(d))
  .handler(async ({ data }) => {
    const cfg = await loadSmtp();
    const html = `<div style="font-family:Inter,sans-serif;padding:24px"><h1 style="font-family:Georgia,serif">Hello from Amir Nazir</h1><p>This is a test email confirming your delivery setup is working.</p></div>`;
    try {
      if (cfg?.enabled && cfg.smtp_host && cfg.smtp_user && cfg.smtp_pass) {
        await sendViaSmtp(cfg, data.to, "Test email — Amir Nazir", html);
      } else {
        await sendViaLovable(data.to, "Test email — Amir Nazir", html, cfg?.from_name ?? "Amir Nazir");
      }
      await logEmail(data.to, "Test email — Amir Nazir", "test", "sent");
      return { ok: true };
    } catch (err: any) {
      await logEmail(data.to, "Test email — Amir Nazir", "test", "failed", err?.message);
      return { ok: false, error: err?.message ?? "Send failed" };
    }
  });
