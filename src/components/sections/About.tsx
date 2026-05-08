import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { useSiteConfig } from "@/config/SiteConfigProvider";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1.6, bounce: 0 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString() + suffix);

  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, to, mv]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

export function About() {
  if (!site.about.enabled) return null;
  const { about } = site;

  return (
    <section id="about" className="section-pad">
      <div className="container-luxe mx-auto">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-20 items-start">
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[4/5] overflow-hidden rounded-3xl glass-card"
            >
              <img
                src={about.image}
                alt="Portrait"
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </motion.div>
          </div>

          <div className="lg:col-span-7">
            <span className="eyebrow">{about.eyebrow}</span>
            <h2 className="mt-5 text-4xl md:text-5xl lg:text-6xl text-gradient max-w-2xl">
              {about.title}
            </h2>
            {about.body.map((p, i) => (
              <p key={i} className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
                {p}
              </p>
            ))}

            <div className="mt-10 flex flex-wrap gap-2">
              {about.skills.map((s) => (
                <span
                  key={s}
                  className="rounded-full glass px-4 py-2 text-xs tracking-wide text-foreground/85"
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6">
              {about.stats.map((s) => (
                <div key={s.label} className="border-l border-gold/40 pl-4">
                  <div className="font-display text-3xl md:text-4xl text-gold-gradient">
                    <Counter to={s.value} suffix={s.suffix} />
                  </div>
                  <div className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
