import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { site as defaultSite, type SiteConfig } from "@/config/site";

/**
 * Live site config layer.
 *
 * - Loads defaults from src/config/site.ts (your "Laravel-ready" schema)
 * - Persists admin overrides to localStorage under STORAGE_KEY
 * - Exposes update/reset/export/import for the admin dashboard
 *
 * To swap in a real Laravel/WordPress backend later:
 *   1. Replace `loadOverrides()` with `await fetch('/api/site')`
 *   2. Replace `persist()` with `await fetch('/api/site', { method: 'PUT', body })`
 * The shape never changes — every section component already consumes `useSiteConfig()`.
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
  for (const k of Object.keys(override)) {
    out[k] = deepMerge((base as any)?.[k], override[k]);
  }
  return out;
}

function loadOverrides(): DeepPartial<SiteConfig> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persist(overrides: DeepPartial<SiteConfig>) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides)); } catch {}
}

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<DeepPartial<SiteConfig>>({});

  // Hydrate after mount (avoid SSR mismatch)
  useEffect(() => { setOverrides(loadOverrides()); }, []);

  // Cross-tab sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setOverrides(loadOverrides());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const site = useMemo(() => deepMerge(defaultSite, overrides), [overrides]);

  // Apply theme tokens live
  useEffect(() => {
    if (typeof document === "undefined") return;
    const t = (site as any).theme;
    if (!t) return;
    const root = document.documentElement;
    if (t.background) root.style.setProperty("--background", t.background);
    if (t.foreground) root.style.setProperty("--foreground", t.foreground);
    if (t.primary) {
      root.style.setProperty("--primary", t.primary);
      root.style.setProperty("--gold", t.primary);
      root.style.setProperty("--ring", `${t.primary} / 60%`);
    }
    if (t.accent) root.style.setProperty("--accent", t.accent);
    if (t.radius) root.style.setProperty("--radius", t.radius);
  }, [site]);

  const update = useCallback((patch: DeepPartial<SiteConfig>) => {
    setOverrides((prev) => {
      const next = deepMerge(prev, patch);
      persist(next);
      return next;
    });
  }, []);

  const setSection = useCallback(<K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) => {
    update({ [key]: value } as any);
  }, [update]);

  const reset = useCallback(() => {
    setOverrides({});
    persist({});
  }, []);

  const exportJson = useCallback(() => JSON.stringify(site, null, 2), [site]);
  const importJson = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json);
      setOverrides(parsed);
      persist(parsed);
      return true;
    } catch { return false; }
  }, []);

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
