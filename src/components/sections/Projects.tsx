import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useSiteConfig } from "@/config/SiteConfigProvider";

export function Projects() {
  const { site } = useSiteConfig();
  if (!site.projects.enabled) return null;
  const { projects } = site;
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All"
    ? projects.items
    : projects.items.filter((p) => p.category === filter);

  return (
    <section id="work" className="section-pad">
      <div className="container-luxe mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="eyebrow">{projects.eyebrow}</span>
            <h2 className="mt-5 text-4xl md:text-5xl lg:text-6xl text-gradient max-w-2xl">
              {projects.title}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {projects.filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-2 text-xs tracking-wide transition-all ${
                  filter === f
                    ? "bg-gold text-primary-foreground"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <motion.a
              key={p.title}
              href="#"
              layout
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-3xl glass-card hover-lift"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={p.cover}
                  alt={p.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              </div>

              <div className="absolute inset-x-0 bottom-0 p-6">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{p.category} · {p.year}</span>
                  <ArrowUpRight size={16} className="text-gold transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </div>
                <h3 className="mt-2 font-display text-2xl text-foreground">{p.title}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      · {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
