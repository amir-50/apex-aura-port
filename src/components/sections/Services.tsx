import { motion } from "framer-motion";
import { site } from "@/config/site";

export function Services() {
  if (!site.services.enabled) return null;
  const { services } = site;

  return (
    <section id="services" className="section-pad relative">
      <div className="container-luxe mx-auto">
        <div className="max-w-2xl">
          <span className="eyebrow">{services.eyebrow}</span>
          <h2 className="mt-5 text-4xl md:text-5xl lg:text-6xl text-gradient">
            {services.title}
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.items.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              className="group relative rounded-3xl glass-card p-8 hover-lift overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gold/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative">
                <div className="text-4xl text-gold-gradient">{s.icon}</div>
                <h3 className="mt-6 font-display text-2xl">{s.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {s.description}
                </p>
                <div className="mt-8 text-xs uppercase tracking-[0.25em] text-muted-foreground/70">
                  0{i + 1}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
