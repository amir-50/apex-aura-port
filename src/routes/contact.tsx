import { createFileRoute } from "@tanstack/react-router";
import { Contact } from "@/components/sections/Contact";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — LUXE Studio" },
      { name: "description", content: "Start a project with LUXE. Currently accepting two new engagements per quarter." },
      { property: "og:title", content: "Contact — LUXE Studio" },
      { property: "og:description", content: "Start a project with LUXE." },
    ],
  }),
  component: () => <div className="pt-24"><Contact /></div>,
});
