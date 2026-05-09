import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useSiteConfig } from "@/config/SiteConfigProvider";

/**
 * Client-side SEO sync. Reads the per-page entry from
 * site.seo.pages[<pathname>] and live-updates document <title>
 * and meta tags whenever the route or admin overrides change.
 *
 * This complements (and overrides) the static head() in each route
 * file, allowing non-technical admins to edit SEO without code.
 */
function setMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  if (!href) return;
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

export function SeoHead() {
  const { site } = useSiteConfig();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof document === "undefined") return;
    const seo = (site as any).seo ?? {};
    const pages = seo.pages ?? {};
    const page = pages[pathname] ?? pages["/"] ?? {};

    const title = page.title || seo.title || document.title;
    const description = page.description || seo.description || "";
    const ogImage = page.ogImage || seo.ogImage || "";
    const canonical = page.canonical || "";

    document.title = title;

    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    if (ogImage) {
      setMeta('meta[property="og:image"]', "property", "og:image", ogImage);
      setMeta('meta[name="twitter:image"]', "name", "twitter:image", ogImage);
    }
    if (canonical) setLink("canonical", canonical);
  }, [site, pathname]);

  return null;
}
