import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { useSiteConfig } from "@/config/SiteConfigProvider";

export function Contact() {
  if (!site.contact.enabled) return null;
  const { contact } = site;
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  return (
    <section id="contact" className="section-pad">
      <div className="container-luxe mx-auto">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <span className="eyebrow">{contact.eyebrow}</span>
            <h2 className="mt-5 text-4xl md:text-5xl lg:text-6xl text-gradient">
              {contact.title}
            </h2>
            <p className="mt-6 text-muted-foreground max-w-md">{contact.body}</p>

            <ul className="mt-10 space-y-5 text-sm">
              <li className="flex items-center gap-4">
                <span className="p-2.5 rounded-full glass"><Mail size={16} /></span>
                <a href={`mailto:${contact.email}`} className="hover:text-gold">{contact.email}</a>
              </li>
              <li className="flex items-center gap-4">
                <span className="p-2.5 rounded-full glass"><Phone size={16} /></span>
                <a href={`tel:${contact.phone}`} className="hover:text-gold">{contact.phone}</a>
              </li>
              <li className="flex items-center gap-4">
                <span className="p-2.5 rounded-full glass"><MapPin size={16} /></span>
                <span>{contact.address}</span>
              </li>
            </ul>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            className="lg:col-span-7 glass-card rounded-3xl p-8 md:p-10 space-y-5"
          >
            <Field label="Name">
              <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input" />
            </Field>
            <Field label="Email">
              <input required type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="input" />
            </Field>
            <Field label="Tell us about your project">
              <textarea required rows={5} value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} className="input resize-none" />
            </Field>

            <button className="btn-luxe w-full !py-4">
              {sent ? "Message sent ✦" : <>Send Message <ArrowRight size={16} /></>}
            </button>
          </motion.form>
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          background: oklch(1 0 0 / 0.03);
          border: 1px solid var(--glass-border);
          border-radius: 0.875rem;
          padding: 0.875rem 1rem;
          font-size: 0.95rem;
          color: var(--foreground);
          transition: border-color .3s, background .3s;
        }
        .input:focus { outline: none; border-color: var(--gold); background: oklch(1 0 0 / 0.05); }
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
