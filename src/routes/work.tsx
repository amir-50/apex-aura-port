import { createFileRoute } from "@tanstack/react-router";
import { Projects } from "@/components/sections/Projects";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: "Work — LUXE Studio" },
      { name: "description", content: "Selected projects across brand, web, 3D and motion." },
      { property: "og:title", content: "Work — LUXE Studio" },
      { property: "og:description", content: "Selected projects across brand, web, 3D and motion." },
    ],
  }),
  component: () => <div className="pt-24"><Projects /></div>,
});
