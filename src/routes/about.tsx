import { createFileRoute } from "@tanstack/react-router";
import { About } from "@/components/sections/About";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — LUXE Studio" },
      { name: "description", content: "Meet the studio behind LUXE — a multidisciplinary practice in design, motion and engineering." },
      { property: "og:title", content: "About — LUXE Studio" },
      { property: "og:description", content: "A multidisciplinary practice in design, motion and engineering." },
    ],
  }),
  component: () => <div className="pt-24"><About /></div>,
});
