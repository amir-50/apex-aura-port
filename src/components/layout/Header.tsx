import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useSiteConfig } from "@/config/SiteConfigProvider";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { brand, header } = site;

  return (
    <header
      className={`${header.sticky ? "sticky" : "absolute"} top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-6"
      }`}
    >
      <div
        className={`container-luxe mx-6 md:mx-10 lg:mx-auto flex items-center justify-between rounded-full px-5 md:px-7 transition-all duration-500 ${
          scrolled ? "glass shadow-elegant py-2.5" : "py-3"
        }`}
      >
        <Link to="/" className="flex items-center gap-2">
          {brand.logoImage ? (
            <img src={brand.logoImage} alt={brand.name} className="h-7" />
          ) : (
            <span className="font-display text-xl tracking-tight text-gradient">
              {brand.logoText}
            </span>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {header.nav.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: item.href === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link to={header.cta.href} className="btn-luxe !py-2.5 !px-5 !text-xs">
            {header.cta.label}
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 text-foreground"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mx-6 mt-3 glass rounded-3xl p-6 animate-fade-up">
          <nav className="flex flex-col gap-4">
            {header.nav.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className="text-base text-foreground/90 hover:text-gold transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to={header.cta.href}
              onClick={() => setOpen(false)}
              className="btn-luxe mt-2 w-full"
            >
              {header.cta.label}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
