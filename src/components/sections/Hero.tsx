import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { site } from "@/config/site";
import { Scene3D } from "@/components/three/Scene3D";

export function Hero() {
  if (!site.hero.enabled) return null;
  const { hero } = site;

  return (
    <section className="relative min-h-[100svh] gradient-hero overflow-hidden">
      {/* 3D scene */}
      <div className="absolute inset-0 opacity-90">
        <Scene3D />
      </div>
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background pointer-events-none" />

      <div className="relative container-luxe mx-auto px-6 md:px-10 lg:px-16 pt-40 md:pt-48 pb-24">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="eyebrow"
        >
          {hero.eyebrow}
        </motion.span>

        <h1 className="mt-6 text-5xl sm:text-7xl md:text-8xl lg:text-[8.5rem] leading-[0.95] max-w-5xl">
          {hero.titleLines.map((line, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="block"
            >
              {i === hero.titleLines.length - 1 ? (
                <span className="text-gold-gradient italic font-display">{line}</span>
              ) : (
                <span className="text-gradient">{line}</span>
              )}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed"
        >
          {hero.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Link to={hero.primaryCta.href} className="btn-luxe">
            {hero.primaryCta.label} <ArrowRight size={16} />
          </Link>
          <Link to={hero.secondaryCta.href} className="btn-ghost-luxe">
            {hero.secondaryCta.label}
          </Link>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
        Scroll
      </div>
    </section>
  );
}
