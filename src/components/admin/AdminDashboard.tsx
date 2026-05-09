import { useEffect, useRef, useState } from "react";
import { Settings2, X, Eye, EyeOff, RotateCcw, Download, Upload, GripVertical, Image as ImageIcon } from "lucide-react";
import { useSiteConfig } from "@/config/SiteConfigProvider";

/**
 * In-browser admin dashboard. Floating panel at bottom-right.
 * Mirrors the schema in src/config/site.ts — when you build a Laravel admin,
 * point it at the same JSON shape and the site updates live via fetch.
 */
export function AdminDashboard() {
  const { site, update, reset, exportJson, importJson } = useSiteConfig();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("sections");

  // Open with ?admin=1 or Ctrl/Cmd+Shift+A
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault(); setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("admin") === "1") {
      setOpen(true);
    }
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[60] p-3 rounded-full glass shadow-elegant hover:text-gold transition-colors"
        aria-label="Open admin"
        title="Admin (⌘/Ctrl+Shift+A)"
      >
        <Settings2 size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex">
          <div className="flex-1 bg-background/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="w-full sm:w-[440px] h-full overflow-y-auto bg-card border-l border-border shadow-elegant">
            <header className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border p-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg">Site Admin</h3>
                <p className="text-xs text-muted-foreground">Live-editable. Saved to this browser.</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-muted">
                <X size={18} />
              </button>
            </header>

            <nav className="px-4 pt-4 flex flex-wrap gap-1.5 text-xs">
              {(["sections","theme","typography","motion","seo","brand","header","hero","about","services","projects","testimonials","journal","contact","footer","data"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-full transition-colors ${tab === t ? "bg-gold text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"}`}
                >
                  {t}
                </button>
              ))}
            </nav>

            <div className="p-4 space-y-4">
              {tab === "sections" && <SectionsTab />}
              {tab === "theme" && <ThemeTab />}
              {tab === "typography" && <TypographyTab />}
              {tab === "motion" && <MotionTab />}
              {tab === "seo" && <SeoTab />}
              {tab === "brand" && <BrandTab />}
              {tab === "header" && <HeaderTab />}
              {tab === "hero" && <HeroTab />}
              {tab === "about" && <AboutTab />}
              {tab === "services" && <ServicesTab />}
              {tab === "projects" && <ProjectsTab />}
              {tab === "testimonials" && <TestimonialsTab />}
              {tab === "journal" && <JournalTab />}
              {tab === "contact" && <ContactTab />}
              {tab === "footer" && <FooterTab />}
              {tab === "data" && (
                <DataTab json={exportJson()} onImport={importJson} />
              )}
            </div>

            <footer className="p-4 border-t border-border flex justify-between items-center">
              <button onClick={() => { if (confirm("Reset all overrides?")) reset(); }} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1.5">
                <RotateCcw size={12}/> Reset to defaults
              </button>
              <span className="text-[10px] text-muted-foreground">{Object.keys(site).length} sections</span>
            </footer>
          </aside>
        </div>
      )}
    </>
  );
}

type Tab = "sections"|"theme"|"typography"|"brand"|"header"|"hero"|"about"|"services"|"projects"|"testimonials"|"journal"|"contact"|"footer"|"data";

const FONT_OPTIONS = ["Fraunces","Playfair Display","Cormorant Garamond","DM Serif Display","Inter","Manrope","Space Grotesk","Plus Jakarta Sans","Syne","Outfit","Bricolage Grotesque","Instrument Serif"];

/* ──────────────────── Reusable form atoms ───────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
const inputCls = "w-full bg-background/60 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-colors";
function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className={inputCls + " " + (props.className ?? "")} />; }
function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea {...props} className={inputCls + " resize-none " + (props.className ?? "")} />; }
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button onClick={() => onChange(!checked)} className="flex items-center gap-2 w-full text-left p-2.5 rounded-lg glass hover:border-gold/50 transition-colors">
      {checked ? <Eye size={14} className="text-gold"/> : <EyeOff size={14} className="text-muted-foreground"/>}
      <span className="text-sm flex-1">{label}</span>
      <span className={`w-9 h-5 rounded-full relative transition-colors ${checked ? "bg-gold" : "bg-muted"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-background transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`}/>
      </span>
    </button>
  );
}
function Card({ children }: { children: React.ReactNode }) { return <div className="glass-card rounded-xl p-3 space-y-2.5">{children}</div>; }

function ImageInput({ value, onChange, label = "Image" }: { value: string | null | undefined; onChange: (v: string | null) => void; label?: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const onFile = (f: File | undefined) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(f);
  };
  return (
    <div className="space-y-2">
      <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div className="h-14 w-14 rounded-lg border border-border bg-background/40 overflow-hidden flex items-center justify-center shrink-0">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImageIcon size={16} className="text-muted-foreground" />}
        </div>
        <div className="flex-1 space-y-1.5">
          <TextInput placeholder="Image URL" value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} />
          <div className="flex gap-1.5">
            <button type="button" onClick={() => fileRef.current?.click()} className="text-[11px] glass px-2.5 py-1.5 rounded-md hover:text-gold transition-colors flex items-center gap-1">
              <Upload size={11} /> Upload
            </button>
            {value && (
              <button type="button" onClick={() => onChange(null)} className="text-[11px] glass px-2.5 py-1.5 rounded-md hover:text-destructive transition-colors">
                Remove
              </button>
            )}
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
    </div>
  );
}

function TypographyTab() {
  const { site, update } = useSiteConfig();
  const ty = (site as any).typography ?? {};
  const set = (patch: any) => update({ typography: { ...ty, ...patch } } as any);
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Pick fonts (auto-loaded from Google Fonts) and tune type scale. Updates apply live.</p>
      <Field label="Display font (headings)">
        <select className={inputCls} value={ty.displayFont ?? "Fraunces"} onChange={(e) => set({ displayFont: e.target.value })}>
          {FONT_OPTIONS.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
        </select>
      </Field>
      <Field label="Body font">
        <select className={inputCls} value={ty.bodyFont ?? "Inter"} onChange={(e) => set({ bodyFont: e.target.value })}>
          {FONT_OPTIONS.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Heading weight">
          <select className={inputCls} value={ty.headingWeight ?? "500"} onChange={(e) => set({ headingWeight: e.target.value })}>
            {["300","400","500","600","700"].map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </Field>
        <Field label="Body weight">
          <select className={inputCls} value={ty.bodyWeight ?? "400"} onChange={(e) => set({ bodyWeight: e.target.value })}>
            {["300","400","500","600"].map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Base font size">
        <TextInput value={ty.baseSize ?? "16px"} onChange={(e) => set({ baseSize: e.target.value })} placeholder="16px" />
      </Field>
      <Field label="Heading letter-spacing">
        <TextInput value={ty.letterSpacing ?? "-0.02em"} onChange={(e) => set({ letterSpacing: e.target.value })} placeholder="-0.02em" />
      </Field>
      <div className="glass-card rounded-xl p-4 mt-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Live preview</div>
        <div className="font-display text-3xl text-gradient">The quick brown fox</div>
        <div className="font-display italic text-2xl text-gold-gradient mt-1">jumps over the lazy dog</div>
        <p className="text-sm text-muted-foreground mt-3">Body copy renders in your selected sans for comfortable reading at every scale.</p>
      </div>
    </div>
  );
}

/* ──────────────────── Tabs ───────────────────── */
function SectionsTab() {
  const { site, update } = useSiteConfig();
  const order = site.sections.order;
  const move = (i: number, dir: -1 | 1) => {
    const next = [...order];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    update({ sections: { order: next } });
  };
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Show, hide and reorder homepage sections.</p>
      {order.map((key, i) => {
        const sec = (site as any)[key];
        const enabled = sec?.enabled ?? true;
        return (
          <div key={key} className="flex items-center gap-2">
            <div className="flex flex-col">
              <button onClick={() => move(i, -1)} className="text-muted-foreground hover:text-foreground text-xs">▲</button>
              <button onClick={() => move(i, 1)} className="text-muted-foreground hover:text-foreground text-xs">▼</button>
            </div>
            <div className="flex-1">
              <Toggle
                checked={enabled}
                onChange={(v) => update({ [key]: { ...sec, enabled: v } } as any)}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ThemeTab() {
  const { site, update } = useSiteConfig();
  const t = site.theme;
  const set = (k: string, v: string) => update({ theme: { ...t, [k]: v } as any });
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">All colors use CSS <code>oklch</code>. Updates apply live.</p>
      {(["background","foreground","primary","accent"] as const).map((k) => (
        <Field key={k} label={k}>
          <TextInput value={t[k]} onChange={(e) => set(k, e.target.value)} />
        </Field>
      ))}
      <Field label="Border radius">
        <TextInput value={t.radius} onChange={(e) => set("radius", e.target.value)} />
      </Field>
    </div>
  );
}

function BrandTab() {
  const { site, update } = useSiteConfig();
  const b = site.brand;
  const set = (patch: Partial<typeof b>) => update({ brand: { ...b, ...patch } });
  return (
    <div className="space-y-3">
      <Field label="Brand name"><TextInput value={b.name} onChange={(e) => set({ name: e.target.value })}/></Field>
      <Field label="Logo text (used if no image)"><TextInput value={b.logoText} onChange={(e) => set({ logoText: e.target.value })}/></Field>
      <ImageInput label="Logo image" value={b.logoImage} onChange={(v) => set({ logoImage: v })} />
      <Field label="Tagline"><TextInput value={b.tagline} onChange={(e) => set({ tagline: e.target.value })}/></Field>
    </div>
  );
}

function HeaderTab() {
  const { site, update } = useSiteConfig();
  const h = site.header;
  const set = (patch: any) => update({ header: { ...h, ...patch } });
  return (
    <div className="space-y-3">
      <Toggle checked={h.sticky} onChange={(v) => set({ sticky: v })} label="Sticky header" />
      <Card>
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">CTA Button</div>
        <Field label="Label"><TextInput value={h.cta.label} onChange={(e) => set({ cta: { ...h.cta, label: e.target.value } })}/></Field>
        <Field label="Link"><TextInput value={h.cta.href} onChange={(e) => set({ cta: { ...h.cta, href: e.target.value } })}/></Field>
      </Card>
      <ListEditor
        title="Navigation menu"
        items={h.nav}
        onChange={(nav) => set({ nav })}
        empty={{ label: "New", href: "/" }}
        render={(item, on) => (
          <>
            <TextInput placeholder="Label" value={item.label} onChange={(e) => on({ ...item, label: e.target.value })}/>
            <TextInput placeholder="/href" value={item.href} onChange={(e) => on({ ...item, href: e.target.value })}/>
          </>
        )}
      />
    </div>
  );
}

function HeroTab() {
  const { site, update } = useSiteConfig();
  const h = site.hero;
  const set = (patch: any) => update({ hero: { ...h, ...patch } });
  return (
    <div className="space-y-3">
      <Toggle checked={h.enabled} onChange={(v) => set({ enabled: v })} label="Show Hero" />
      <Field label="Eyebrow"><TextInput value={h.eyebrow} onChange={(e) => set({ eyebrow: e.target.value })}/></Field>
      <Field label="Title (one line per row)">
        <TextArea rows={2} value={h.titleLines.join("\n")} onChange={(e) => set({ titleLines: e.target.value.split("\n") })}/>
      </Field>
      <Field label="Subtitle"><TextArea rows={3} value={h.subtitle} onChange={(e) => set({ subtitle: e.target.value })}/></Field>
      <Card>
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Primary CTA</div>
        <TextInput placeholder="Label" value={h.primaryCta.label} onChange={(e) => set({ primaryCta: { ...h.primaryCta, label: e.target.value } })}/>
        <TextInput placeholder="Href" value={h.primaryCta.href} onChange={(e) => set({ primaryCta: { ...h.primaryCta, href: e.target.value } })}/>
      </Card>
      <Card>
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Secondary CTA</div>
        <TextInput placeholder="Label" value={h.secondaryCta.label} onChange={(e) => set({ secondaryCta: { ...h.secondaryCta, label: e.target.value } })}/>
        <TextInput placeholder="Href" value={h.secondaryCta.href} onChange={(e) => set({ secondaryCta: { ...h.secondaryCta, href: e.target.value } })}/>
      </Card>
      <Toggle checked={(h as any).showOrb !== false} onChange={(v) => set({ showOrb: v })} label="Show 3D scene" />
      <Field label="Availability badge"><TextInput value={(h as any).availability ?? ""} onChange={(e) => set({ availability: e.target.value })}/></Field>
      <ImageInput label="Background image (optional)" value={(h as any).backgroundImage} onChange={(v) => set({ backgroundImage: v })} />
      <Field label="Marquee items (comma-separated)">
        <TextInput value={((h as any).marquee ?? []).join(", ")} onChange={(e) => set({ marquee: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}/>
      </Field>
    </div>
  );
}

function AboutTab() {
  const { site, update } = useSiteConfig();
  const a = site.about;
  const set = (patch: any) => update({ about: { ...a, ...patch } });
  return (
    <div className="space-y-3">
      <Toggle checked={a.enabled} onChange={(v) => set({ enabled: v })} label="Show About" />
      <Field label="Title"><TextArea rows={2} value={a.title} onChange={(e) => set({ title: e.target.value })}/></Field>
      <ImageInput label="Portrait image" value={a.image} onChange={(v) => set({ image: v ?? "" })} />
      <Field label="Body (one paragraph per line)">
        <TextArea rows={4} value={a.body.join("\n")} onChange={(e) => set({ body: e.target.value.split("\n").filter(Boolean) })}/>
      </Field>
      <Field label="Skills (comma-separated)">
        <TextInput value={a.skills.join(", ")} onChange={(e) => set({ skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}/>
      </Field>
      <ListEditor
        title="Stats"
        items={a.stats}
        onChange={(stats) => set({ stats })}
        empty={{ value: 0, suffix: "", label: "" }}
        render={(item, on) => (
          <>
            <TextInput type="number" placeholder="Value" value={item.value} onChange={(e) => on({ ...item, value: Number(e.target.value) })}/>
            <TextInput placeholder="Suffix" value={item.suffix} onChange={(e) => on({ ...item, suffix: e.target.value })}/>
            <TextInput placeholder="Label" value={item.label} onChange={(e) => on({ ...item, label: e.target.value })}/>
          </>
        )}
      />
    </div>
  );
}

function ServicesTab() {
  const { site, update } = useSiteConfig();
  const s = site.services;
  const set = (patch: any) => update({ services: { ...s, ...patch } });
  return (
    <div className="space-y-3">
      <Toggle checked={s.enabled} onChange={(v) => set({ enabled: v })} label="Show Services" />
      <Field label="Title"><TextInput value={s.title} onChange={(e) => set({ title: e.target.value })}/></Field>
      <ListEditor
        title="Services"
        items={s.items}
        onChange={(items) => set({ items })}
        empty={{ title: "New service", description: "", icon: "✦" }}
        render={(item, on) => (
          <>
            <TextInput placeholder="Icon" value={item.icon} onChange={(e) => on({ ...item, icon: e.target.value })}/>
            <TextInput placeholder="Title" value={item.title} onChange={(e) => on({ ...item, title: e.target.value })}/>
            <TextArea rows={2} placeholder="Description" value={item.description} onChange={(e) => on({ ...item, description: e.target.value })}/>
          </>
        )}
      />
    </div>
  );
}

function ProjectsTab() {
  const { site, update } = useSiteConfig();
  const p = site.projects;
  const set = (patch: any) => update({ projects: { ...p, ...patch } });
  return (
    <div className="space-y-3">
      <Toggle checked={p.enabled} onChange={(v) => set({ enabled: v })} label="Show Projects" />
      <Field label="Title"><TextInput value={p.title} onChange={(e) => set({ title: e.target.value })}/></Field>
      <Field label="Filters (comma-separated)">
        <TextInput value={p.filters.join(", ")} onChange={(e) => set({ filters: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}/>
      </Field>
      <ListEditor
        title="Projects"
        items={p.items}
        onChange={(items) => set({ items })}
        empty={{ title: "New project", category: "Web", year: "2025", cover: "", tags: [] }}
        render={(item, on) => (
          <>
            <TextInput placeholder="Title" value={item.title} onChange={(e) => on({ ...item, title: e.target.value })}/>
            <div className="grid grid-cols-2 gap-2">
              <TextInput placeholder="Category" value={item.category} onChange={(e) => on({ ...item, category: e.target.value })}/>
              <TextInput placeholder="Year" value={item.year} onChange={(e) => on({ ...item, year: e.target.value })}/>
            </div>
            <ImageInput label="Cover image" value={item.cover} onChange={(v) => on({ ...item, cover: v ?? "" })}/>
            <TextInput placeholder="Tags (comma-separated)" value={(item.tags ?? []).join(", ")} onChange={(e) => on({ ...item, tags: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })}/>
          </>
        )}
      />
    </div>
  );
}

function TestimonialsTab() {
  const { site, update } = useSiteConfig();
  const t = site.testimonials;
  const set = (patch: any) => update({ testimonials: { ...t, ...patch } });
  return (
    <div className="space-y-3">
      <Toggle checked={t.enabled} onChange={(v) => set({ enabled: v })} label="Show Testimonials" />
      <Field label="Title"><TextInput value={t.title} onChange={(e) => set({ title: e.target.value })}/></Field>
      <ListEditor
        title="Testimonials"
        items={t.items}
        onChange={(items) => set({ items })}
        empty={{ quote: "", author: "", role: "" }}
        render={(item, on) => (
          <>
            <TextArea rows={3} placeholder="Quote" value={item.quote} onChange={(e) => on({ ...item, quote: e.target.value })}/>
            <TextInput placeholder="Author" value={item.author} onChange={(e) => on({ ...item, author: e.target.value })}/>
            <TextInput placeholder="Role" value={item.role} onChange={(e) => on({ ...item, role: e.target.value })}/>
          </>
        )}
      />
    </div>
  );
}

function JournalTab() {
  const { site, update } = useSiteConfig();
  const j = site.journal;
  const set = (patch: any) => update({ journal: { ...j, ...patch } });
  return (
    <div className="space-y-3">
      <Toggle checked={j.enabled} onChange={(v) => set({ enabled: v })} label="Show Journal" />
      <Field label="Title"><TextInput value={j.title} onChange={(e) => set({ title: e.target.value })}/></Field>
      <ListEditor
        title="Posts"
        items={j.items}
        onChange={(items) => set({ items })}
        empty={{ title: "", excerpt: "", date: "", href: "#", cover: "" }}
        render={(item, on) => (
          <>
            <TextInput placeholder="Title" value={item.title} onChange={(e) => on({ ...item, title: e.target.value })}/>
            <TextArea rows={2} placeholder="Excerpt" value={item.excerpt} onChange={(e) => on({ ...item, excerpt: e.target.value })}/>
            <div className="grid grid-cols-2 gap-2">
              <TextInput placeholder="Date" value={item.date} onChange={(e) => on({ ...item, date: e.target.value })}/>
              <TextInput placeholder="Href" value={item.href} onChange={(e) => on({ ...item, href: e.target.value })}/>
            </div>
            <ImageInput label="Cover image" value={item.cover} onChange={(v) => on({ ...item, cover: v ?? "" })}/>
          </>
        )}
      />
    </div>
  );
}

function ContactTab() {
  const { site, update } = useSiteConfig();
  const c = site.contact;
  const set = (patch: any) => update({ contact: { ...c, ...patch } });
  return (
    <div className="space-y-3">
      <Toggle checked={c.enabled} onChange={(v) => set({ enabled: v })} label="Show Contact" />
      <Field label="Title"><TextInput value={c.title} onChange={(e) => set({ title: e.target.value })}/></Field>
      <Field label="Body"><TextArea rows={3} value={c.body} onChange={(e) => set({ body: e.target.value })}/></Field>
      <Field label="Email"><TextInput value={c.email} onChange={(e) => set({ email: e.target.value })}/></Field>
      <Field label="Phone"><TextInput value={c.phone} onChange={(e) => set({ phone: e.target.value })}/></Field>
      <Field label="Address"><TextInput value={c.address} onChange={(e) => set({ address: e.target.value })}/></Field>
    </div>
  );
}

function FooterTab() {
  const { site, update } = useSiteConfig();
  const f = site.footer;
  const set = (patch: any) => update({ footer: { ...f, ...patch } });
  return (
    <div className="space-y-3">
      <Field label="Copyright"><TextInput value={f.copyright} onChange={(e) => set({ copyright: e.target.value })}/></Field>
      <Card>
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Newsletter</div>
        <Toggle checked={f.newsletter.enabled} onChange={(v) => set({ newsletter: { ...f.newsletter, enabled: v } })} label="Show newsletter"/>
        <TextInput placeholder="Title" value={f.newsletter.title} onChange={(e) => set({ newsletter: { ...f.newsletter, title: e.target.value } })}/>
        <TextArea rows={2} placeholder="Description" value={f.newsletter.description} onChange={(e) => set({ newsletter: { ...f.newsletter, description: e.target.value } })}/>
        <TextInput placeholder="CTA label" value={f.newsletter.cta} onChange={(e) => set({ newsletter: { ...f.newsletter, cta: e.target.value } })}/>
      </Card>
      <ListEditor
        title="Socials"
        items={f.socials}
        onChange={(socials) => set({ socials })}
        empty={{ label: "Site", href: "https://", icon: "Twitter" }}
        render={(item, on) => (
          <>
            <TextInput placeholder="Label" value={item.label} onChange={(e) => on({ ...item, label: e.target.value })}/>
            <TextInput placeholder="URL" value={item.href} onChange={(e) => on({ ...item, href: e.target.value })}/>
            <TextInput placeholder="Icon (Instagram, Twitter, Dribbble, Linkedin)" value={item.icon} onChange={(e) => on({ ...item, icon: e.target.value })}/>
          </>
        )}
      />
      <ListEditor
        title="Footer columns"
        items={f.columns}
        onChange={(columns) => set({ columns })}
        empty={{ title: "New column", links: [] }}
        render={(item, on) => (
          <>
            <TextInput placeholder="Column title" value={item.title} onChange={(e) => on({ ...item, title: e.target.value })}/>
            <ListEditor
              title="Links"
              items={item.links}
              onChange={(links) => on({ ...item, links })}
              empty={{ label: "New", href: "#" }}
              render={(link, onLink) => (
                <>
                  <TextInput placeholder="Label" value={link.label} onChange={(e) => onLink({ ...link, label: e.target.value })}/>
                  <TextInput placeholder="Href" value={link.href} onChange={(e) => onLink({ ...link, href: e.target.value })}/>
                </>
              )}
            />
          </>
        )}
      />
    </div>
  );
}

function DataTab({ json, onImport }: { json: string; onImport: (j: string) => boolean }) {
  const [text, setText] = useState(json);
  useEffect(() => setText(json), [json]);
  const download = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "site.config.json"; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Export this JSON and serve it from your Laravel/WordPress backend at <code>/api/site</code>.
        The site already consumes the same shape — just swap the loader.
      </p>
      <div className="flex gap-2">
        <button onClick={download} className="btn-ghost-luxe !py-2 !px-3 !text-xs"><Download size={12}/> Export</button>
        <button onClick={() => { if (onImport(text)) alert("Imported!"); else alert("Invalid JSON"); }} className="btn-luxe !py-2 !px-3 !text-xs"><Upload size={12}/> Import</button>
      </div>
      <TextArea rows={18} value={text} onChange={(e) => setText(e.target.value)} className="font-mono text-[11px]"/>
    </div>
  );
}

/* ──────────────────── Generic list editor ───────────────────── */
function ListEditor<T>({ title, items, onChange, render, empty }: {
  title: string;
  items: T[];
  onChange: (items: T[]) => void;
  render: (item: T, onChange: (next: T) => void) => React.ReactNode;
  empty: T;
}) {
  const set = (i: number, next: T) => { const c = [...items]; c[i] = next; onChange(c); };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir; if (j < 0 || j >= items.length) return;
    const c = [...items]; [c[i], c[j]] = [c[j], c[i]]; onChange(c);
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{title}</span>
        <button onClick={() => onChange([...items, empty])} className="text-xs text-gold hover:underline">+ Add</button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="glass-card rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <GripVertical size={12}/>
              <span>#{i + 1}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => move(i, -1)} className="hover:text-foreground">▲</button>
              <button onClick={() => move(i, 1)} className="hover:text-foreground">▼</button>
              <button onClick={() => remove(i)} className="hover:text-destructive">✕</button>
            </div>
          </div>
          {render(item, (next) => set(i, next))}
        </div>
      ))}
      {items.length === 0 && <p className="text-xs text-muted-foreground italic">No items yet.</p>}
    </div>
  );
}
