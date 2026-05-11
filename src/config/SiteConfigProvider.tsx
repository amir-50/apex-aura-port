import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { site as defaultSite, type SiteConfig } from "@/config/site";
import { supabase } from "@/integrations/supabase/client";

/**
 * Live site config layer.
 *
 * - Defaults from src/config/site.ts
 * - Live overrides loaded from Cloud `site_config` row (singleton id=1)
 * - Realtime sync across devices/visitors
 * - Admins persist via UPDATE; RLS blocks non-admins server-side
 * - Falls back to localStorage when offline / not signed in
 */

const STORAGE_KEY = "luxe.site.config.v1";

type Ctx = {
  site: SiteConfig;
  update: (patch: DeepPartial<SiteConfig>) => void;
  setSection: <K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) => void;
  reset: () => void;
  exportJson: () => string;
  importJson: (json: string) => boolean;
};

type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] };

const SiteConfigContext = createContext<Ctx | null>(null);

function deepMerge<T>(base: T, override: any): T {
  if (override === undefined || override === null) return base;
  if (Array.isArray(override)) return override as T;
  if (typeof base !== "object" || typeof override !== "object") return override as T;
  const out: any = { ...(base as any) };
  for (const k of Object.keys(override)) out[k] = deepMerge((base as any)?.[k], override[k]);
  return out;
}

function loadLocal(): DeepPartial<SiteConfig> {
  if (typeof window === "undefined") return {};
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}
function saveLocal(o: DeepPartial<SiteConfig>) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(o)); } catch {}
}

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<DeepPartial<SiteConfig>>({});
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate: try Cloud first, fall back to local cache
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = loadLocal();
      if (!cancelled && Object.keys(local).length) setOverrides(local);
      const { data } = await supabase.from("site_config").select("data").eq("id", 1).maybeSingle();
      if (cancelled) return;
      if (data?.data && typeof data.data === "object") {
        setOverrides(data.data as DeepPartial<SiteConfig>);
        saveLocal(data.data as DeepPartial<SiteConfig>);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Realtime: live sync across all visitors
  useEffect(() => {
    const channel = supabase
      .channel("site_config_changes")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "site_config" }, (payload: any) => {
        const next = payload.new?.data;
        if (next && typeof next === "object") {
          setOverrides(next);
          saveLocal(next);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const site = useMemo(() => deepMerge(defaultSite, overrides), [overrides]);

  // Apply CSS tokens / fonts / reduced motion live
  useEffect(() => {
    if (typeof document === "undefined") return;
    const t = (site as any).theme;
    const root = document.documentElement;
    if (t) {
      if (t.background) root.style.setProperty("--background", t.background);
      if (t.foreground) root.style.setProperty("--foreground", t.foreground);
      if (t.primary) {
        root.style.setProperty("--primary", t.primary);
        root.style.setProperty("--gold", t.primary);
        root.style.setProperty("--ring", `${t.primary} / 60%`);
      }
      if (t.accent) root.style.setProperty("--accent", t.accent);
      if (t.radius) root.style.setProperty("--radius", t.radius);
    }
    const ty = (site as any).typography;
    if (ty) {
      if (ty.displayFont) root.style.setProperty("--font-display", `"${ty.displayFont}", Georgia, serif`);
      if (ty.bodyFont) root.style.setProperty("--font-sans", `"${ty.bodyFont}", system-ui, sans-serif`);
      if (ty.baseSize) root.style.fontSize = ty.baseSize;
      if (ty.letterSpacing) root.style.setProperty("--heading-tracking", ty.letterSpacing);
      const fonts = [ty.displayFont, ty.bodyFont].filter(Boolean) as string[];
      const id = "luxe-dynamic-fonts";
      const families = Array.from(new Set(fonts))
        .map((f) => `family=${encodeURIComponent(f)}:wght@300;400;500;600;700`).join("&");
      const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
      const existing = document.getElementById(id);
      if (existing) (existing as HTMLLinkElement).href = href;
      else { const link = document.createElement("link"); link.id = id; link.rel = "stylesheet"; link.href = href; document.head.appendChild(link); }
    }
    const reduced = (site as any).motion?.reduced === true;
    root.dataset.reducedMotion = reduced ? "true" : "false";
    const styleId = "luxe-reduced-motion";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (reduced) {
      if (!styleEl) { styleEl = document.createElement("style"); styleEl.id = styleId; document.head.appendChild(styleEl); }
      styleEl.textContent = `*,*::before,*::after{animation-duration:.001ms !important;animation-delay:0ms !important;animation-iteration-count:1 !important;transition-duration:.001ms !important;scroll-behavior:auto !important}`;
    } else if (styleEl) styleEl.remove();
  }, [site]);

  // Persist (debounced) — to Cloud if admin, always to local cache
  const persist = useCallback((next: DeepPartial<SiteConfig>) => {
    saveLocal(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const { error } = await supabase.from("site_config").update({ data: next as any }).eq("id", 1);
      if (error && !/permission|policy|denied/i.test(error.message)) console.warn("site_config save:", error.message);
    }, 400);
  }, []);

  const update = useCallback((patch: DeepPartial<SiteConfig>) => {
    setOverrides((prev) => { const next = deepMerge(prev, patch); persist(next); return next; });
  }, [persist]);

  const setSection = useCallback(<K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) => {
    update({ [key]: value } as any);
  }, [update]);

  const reset = useCallback(() => { setOverrides({}); persist({}); }, [persist]);
  const exportJson = useCallback(() => JSON.stringify(site, null, 2), [site]);
  const importJson = useCallback((json: string) => {
    try { const parsed = JSON.parse(json); setOverrides(parsed); persist(parsed); return true; } catch { return false; }
  }, [persist]);

  return (
    <SiteConfigContext.Provider value={{ site, update, setSection, reset, exportJson, importJson }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) throw new Error("useSiteConfig must be used inside <SiteConfigProvider>");
  return ctx;
}
