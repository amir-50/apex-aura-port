import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Dribbble, Linkedin, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { useSiteConfig } from "@/config/SiteConfigProvider";

const ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  Instagram,
  Twitter,
  Dribbble,
  Linkedin,
};

export function Footer() {
  const { site } = useSiteConfig(); const { footer, brand } = site;
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <footer className="relative mt-24 border-t border-border/50">
      <div className="container-luxe mx-auto px-6 md:px-10 lg:px-16 pt-20 pb-10">
        <div className="grid gap-14 lg:gap-10 lg:grid-cols-12">
          {/* Brand + newsletter */}
          <div className="lg:col-span-5">
            <Link to="/" className="font-display text-3xl text-gradient">
              {brand.logoText}
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              {brand.tagline}
            </p>

            {footer.newsletter.enabled && (
              <div className="mt-10 glass-card rounded-2xl p-6">
                <h4 className="font-display text-lg">{footer.newsletter.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {footer.newsletter.description}
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setDone(true);
                    setEmail("");
                  }}
                  className="mt-5 flex gap-2"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={footer.newsletter.placeholder}
                    className="flex-1 rounded-full bg-background/50 border border-border px-5 py-3 text-sm outline-none focus:border-gold transition-colors"
                  />
                  <button className="btn-luxe !py-3 !px-5 !text-xs whitespace-nowrap">
                    {footer.newsletter.cta}
                  </button>
                </form>
                {done && (
                  <p className="mt-3 text-xs text-gold">Welcome aboard ✦</p>
                )}
              </div>
            )}
          </div>

          {/* Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {footer.columns.map((col) => (
              <div key={col.title}>
                <h5 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {col.title}
                </h5>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-sm text-foreground/80 hover:text-gold transition-colors"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-t border-border/40 pt-8">
          <p className="text-xs text-muted-foreground">{footer.copyright}</p>
          <div className="flex items-center gap-4">
            {footer.socials.map((s) => {
              const Icon = ICONS[s.icon] ?? ArrowUpRight;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="p-2 rounded-full glass hover:text-gold hover:border-gold/40 transition-colors"
                >
                  <Icon size={16} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
