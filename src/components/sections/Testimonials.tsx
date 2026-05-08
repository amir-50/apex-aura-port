import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { site } from "@/config/site";

export function Testimonials() {
  if (!site.testimonials.enabled) return null;
  const { testimonials } = site;

  return (
    <section className="section-pad">
      <div className="container-luxe mx-auto">
        <div className="max-w-2xl">
          <span className="eyebrow">{testimonials.eyebrow}</span>
          <h2 className="mt-5 text-4xl md:text-5xl lg:text-6xl text-gradient">
            {testimonials.title}
          </h2>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonials.items.map((t, i) => (
            <motion.figure
              key={t.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="glass-card rounded-3xl p-8 hover-lift"
            >
              <Quote className="text-gold" size={28} />
              <blockquote className="mt-5 font-display text-lg md:text-xl leading-snug text-foreground/95">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-8 border-t border-border/50 pt-5">
                <div className="text-sm font-medium">{t.author}</div>
                <div className="text-xs text-muted-foreground mt-1">{t.role}</div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
