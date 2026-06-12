export type WidgetType =
  | "root"
  | "section"
  | "columns"
  | "heading"
  | "text"
  | "image"
  | "button"
  | "spacer"
  | "divider"
  | "video"
  | "html";

export interface WidgetNode {
  id: string;
  type: WidgetType;
  children: string[];
  props: Record<string, any>;
}

export interface PageTree {
  root: WidgetNode;
  [id: string]: WidgetNode;
}

export const newId = () => Math.random().toString(36).slice(2, 10);

export const emptyTree = (): PageTree => ({
  root: { id: "root", type: "root", children: [], props: {} },
});

export const widgetDefaults: Record<Exclude<WidgetType, "root">, Record<string, any>> = {
  section:  { padding: "80px 24px", background: "transparent", maxWidth: "1200px", align: "center" },
  columns:  { count: 2, gap: "24px" },
  heading:  { text: "Your heading", level: "h2", align: "left", color: "", size: "" },
  text:     { text: "Write something compelling here. Replace this text with your own copy.", align: "left", color: "", size: "16px" },
  image:    { src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80", alt: "", radius: "12px", width: "100%" },
  button:   { label: "Click me", href: "#", variant: "primary", align: "left" },
  spacer:   { height: "40px" },
  divider:  { color: "rgba(255,255,255,0.1)", thickness: "1px" },
  video:    { src: "", poster: "", autoplay: false, loop: true, muted: true },
  html:     { code: "<div style='padding:16px;border:1px dashed #555'>Custom HTML</div>" },
};

export const widgetCatalog: { type: Exclude<WidgetType, "root">; label: string; icon: string }[] = [
  { type: "section",  label: "Section",  icon: "▭" },
  { type: "columns",  label: "Columns",  icon: "▥" },
  { type: "heading",  label: "Heading",  icon: "H" },
  { type: "text",     label: "Text",     icon: "T" },
  { type: "image",    label: "Image",    icon: "▣" },
  { type: "button",   label: "Button",   icon: "◉" },
  { type: "spacer",   label: "Spacer",   icon: "↕" },
  { type: "divider",  label: "Divider",  icon: "—" },
  { type: "video",    label: "Video",    icon: "▶" },
  { type: "html",     label: "HTML",     icon: "</>" },
];
