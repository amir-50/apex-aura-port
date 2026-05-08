import { createFileRoute } from "@tanstack/react-router";
import { Services } from "@/components/sections/Services";
import { Testimonials } from "@/components/sections/Testimonials";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — LUXE Studio" },
      { name: "description", content: "End-to-end services: brand identity, web experiences, interactive 3D and art direction." },
      { property: "og:title", content: "Services — LUXE Studio" },
      { property: "og:description", content: "Brand, web, 3D and art direction services." },
    ],
  }),
  component: () => <div className="pt-24"><Services /><Testimonials /></div>,
});
