import { createFileRoute } from "@tanstack/react-router";
import { Journal } from "@/components/sections/Journal";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal — LUXE Studio" },
      { name: "description", content: "Field notes on craft, process and the slow web." },
      { property: "og:title", content: "Journal — LUXE Studio" },
      { property: "og:description", content: "Field notes on craft, process and the slow web." },
    ],
  }),
  component: () => <div className="pt-24"><Journal /></div>,
});
