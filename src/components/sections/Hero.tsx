import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useSiteConfig } from "@/config/SiteConfigProvider";
import { Scene3D } from "@/components/three/Scene3D";

export function Hero() {
  const { site } = useSiteConfig();
  if (!site.hero.enabled) return null;
  const { hero } = site;

  return (
    <section className="relative min-h-[100svh] gradient-hero overflow-hidden">
      {/* Optional background image */}
      {hero.backgroundImage && (
        <div
          className="absolute inset-0 opacity-30 mix-blend-luminosity"
          style={{ backgroundImage: `url(${hero.backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
      )}

      {/* 3D scene — right-aligned, large, editorial */}
      {hero.showOrb !== false && (
        <div className="absolute inset-y-0 right-[-10%] w-[120%] md:w-[75%] lg:w-[65%] opacity-90 pointer-events-none">
          <Scene3D />
        </div>
      )}

      {/* Layered atmospherics */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background pointer-events-none" />
      {/* Grain texture */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      <div className="relative container-luxe mx-auto px-6 md:px-10 lg:px-16 pt-36 md:pt-44 pb-32">
        {/* Top meta row */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex items-center gap-3 flex-wrap mb-10"
        >
          <span className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-[11px] uppercase tracking-[0.2em] text-foreground/85">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
            </span>
            {hero.availability ?? "Available now"}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <Sparkles size={11} className="text-gold" /> {hero.eyebrow}
          </span>
        </motion.div>

        {/* Editorial headline */}
        <h1 className="relative text-[3.25rem] sm:text-7xl md:text-8xl lg:text-[9.5rem] leading-[0.92] tracking-tight max-w-6xl">
          {hero.titleLines.map((line, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, delay: 0.15 + i * 0.18, ease: [0.22, 1, 0.36, 1] }}
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

        {/* Body row: subtitle + CTAs + side meta */}
        <div className="mt-12 grid gap-10 lg:grid-cols-12 items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="lg:col-span-7"
          >
            <p className="max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed">
              {hero.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={hero.primaryCta.href} className="btn-luxe group">
                {hero.primaryCta.label}
                <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link to={hero.secondaryCta.href} className="btn-ghost-luxe">
                {hero.secondaryCta.label}
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="lg:col-span-5 lg:justify-self-end"
          >
            <div className="glass-card rounded-2xl p-5 max-w-sm">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                <span>Currently</span>
                <span className="text-gold">2026</span>
              </div>
              <div className="mt-3 font-display text-2xl leading-tight">
                Crafting two flagship engagements per quarter for category-defining brands.
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Awards / clients marquee */}
      {hero.marquee && hero.marquee.length > 0 && (
        <div className="relative border-y border-border/60 bg-background/40 backdrop-blur-sm py-5 overflow-hidden">
          <div className="flex gap-16 whitespace-nowrap animate-[marquee_30s_linear_infinite]">
            {[...hero.marquee, ...hero.marquee, ...hero.marquee].map((m, i) => (
              <span
                key={i}
                className="font-display italic text-2xl md:text-3xl text-foreground/40 hover:text-gold transition-colors"
              >
                {m} <span className="text-gold/60 mx-6">✦</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Scroll cue */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.4em] text-muted-foreground hidden md:block">
        <span className="inline-block animate-bounce">↓</span> Scroll
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
}
