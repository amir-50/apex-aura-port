import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { useSiteConfig } from "@/config/SiteConfigProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  service: z.string().max(80).optional(),
  budget: z.string().max(40).optional(),
  timeline: z.string().max(40).optional(),
  details: z.string().trim().max(2000).optional(),
});

export function Booking() {
  const { site } = useSiteConfig();
  const b = (site as any).booking ?? {};
  if (b.enabled === false) return null;

  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", budget: "", timeline: "", details: "" });
  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  const services = b.services ?? ["Brand Identity", "Web Experience", "Interactive 3D", "Art Direction"];
  const budgets = b.budgets ?? ["< $10k", "$10–25k", "$25–60k", "$60k+"];
  const timelines = b.timelines ?? ["ASAP", "1–2 months", "3–6 months", "Flexible"];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error("Please review the form fields."); return; }
    setBusy(true);
    const { error } = await supabase.from("bookings").insert({
      ...parsed.data,
      phone: parsed.data.phone || null,
    } as any);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
    toast.success("Booking request received.");
  };

  return (
    <section id="booking" className="section-pad">
      <div className="container-luxe mx-auto">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <span className="eyebrow">{b.eyebrow ?? "Book a Project"}</span>
            <h2 className="mt-5 text-4xl md:text-5xl lg:text-6xl text-gradient">
              {b.title ?? "Reserve your engagement."}
            </h2>
            <p className="mt-6 text-muted-foreground max-w-md">
              {b.body ?? "Share a few details about your project. You'll receive a confirmation email and we'll respond within 48 hours with next steps."}
            </p>
            <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
              {(b.perks ?? ["Strategy call within 48h", "Tailored proposal in 5 days", "Fixed-scope, fixed-price"]).map((p: string) => (
                <li key={p} className="flex items-center gap-3"><CheckCircle2 size={14} className="text-gold"/> {p}</li>
              ))}
            </ul>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7 }}
            onSubmit={submit}
            className="lg:col-span-7 glass-card rounded-3xl p-8 md:p-10 space-y-5"
          >
            {sent ? (
              <div className="text-center py-12">
                <CheckCircle2 className="mx-auto text-gold" size={48} />
                <h3 className="font-display text-2xl mt-4">Request received</h3>
                <p className="text-sm text-muted-foreground mt-2">We'll be in touch shortly.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Name"><input required maxLength={100} className="bk-input" value={form.name} onChange={(e) => set("name", e.target.value)}/></Field>
                  <Field label="Email"><input required type="email" maxLength={255} className="bk-input" value={form.email} onChange={(e) => set("email", e.target.value)}/></Field>
                  <Field label="Phone (optional)"><input maxLength={40} className="bk-input" value={form.phone} onChange={(e) => set("phone", e.target.value)}/></Field>
                  <Field label="Service">
                    <select className="bk-input" value={form.service} onChange={(e) => set("service", e.target.value)}>
                      <option value="">Select…</option>
                      {services.map((s: string) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Budget">
                    <select className="bk-input" value={form.budget} onChange={(e) => set("budget", e.target.value)}>
                      <option value="">Select…</option>
                      {budgets.map((s: string) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Timeline">
                    <select className="bk-input" value={form.timeline} onChange={(e) => set("timeline", e.target.value)}>
                      <option value="">Select…</option>
                      {timelines.map((s: string) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Project details">
                  <textarea rows={4} maxLength={2000} className="bk-input resize-none" value={form.details} onChange={(e) => set("details", e.target.value)} />
                </Field>
                <button disabled={busy} className="btn-luxe w-full !py-4">
                  {busy ? "…" : <>Submit Booking Request <ArrowRight size={16} /></>}
                </button>
              </>
            )}
          </motion.form>
        </div>
      </div>

      <style>{`
        .bk-input { width:100%; background:oklch(1 0 0 /.03); border:1px solid var(--glass-border);
          border-radius:.875rem; padding:.85rem 1rem; font-size:.95rem; color:var(--foreground); transition:border-color .3s,background .3s; }
        .bk-input:focus { outline:none; border-color:var(--gold); background:oklch(1 0 0 /.05); }
      `}</style>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
