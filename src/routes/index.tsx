import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { Projects } from "@/components/sections/Projects";
import { Testimonials } from "@/components/sections/Testimonials";
import { Journal } from "@/components/sections/Journal";
import { Contact } from "@/components/sections/Contact";
import { useSiteConfig } from "@/config/SiteConfigProvider";

export const Route = createFileRoute("/")({
  component: Index,
});

// Section registry — homepage composes itself from site.sections.order
const SECTIONS = {
  hero: Hero,
  about: About,
  services: Services,
  projects: Projects,
  testimonials: Testimonials,
  journal: Journal,
  contact: Contact,
} as const;

function Index() {
  const { site } = useSiteConfig();
  return (
    <>
      {site.sections.order.map((key) => {
        const C = SECTIONS[key];
        return C ? <C key={key} /> : null;
      })}
    </>
  );
}
