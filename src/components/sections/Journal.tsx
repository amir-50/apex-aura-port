import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useSiteConfig } from "@/config/SiteConfigProvider";

export function Journal() {
  const { site } = useSiteConfig();
  if (!site.journal.enabled) return null;
  const { journal } = site;

  return (
    <section id="journal" className="section-pad">
      <div className="container-luxe mx-auto">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div className="max-w-xl">
            <span className="eyebrow">{journal.eyebrow}</span>
            <h2 className="mt-5 text-4xl md:text-5xl lg:text-6xl text-gradient">
              {journal.title}
            </h2>
          </div>
          <a href="#" className="btn-ghost-luxe !py-2.5 !px-5 !text-xs">
            All entries <ArrowUpRight size={14} />
          </a>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {journal.items.map((post, i) => (
            <motion.a
              key={post.title}
              href={post.href}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              className="group glass-card rounded-3xl overflow-hidden hover-lift"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={post.cover}
                  alt={post.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{post.date}</div>
                <h3 className="mt-3 font-display text-xl group-hover:text-gold transition-colors">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
