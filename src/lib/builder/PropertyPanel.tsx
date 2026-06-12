import type { PageTree, WidgetNode } from "./types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Props {
  tree: PageTree;
  selectedId: string | null;
  onChange: (id: string, props: Record<string, any>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function PropertyPanel({ tree, selectedId, onChange, onDelete, onDuplicate }: Props) {
  if (!selectedId || !tree[selectedId]) {
    return <div className="p-4 text-xs text-muted-foreground">Select an element on the canvas to edit its properties.</div>;
  }
  const node = tree[selectedId];
  const set = (k: string, v: any) => onChange(selectedId, { ...node.props, [k]: v });

  const fields = getFields(node);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Element</div>
          <div className="font-display text-lg capitalize">{node.type}</div>
        </div>
        {node.type !== "root" && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onDuplicate(selectedId)}>Duplicate</Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(selectedId)}><Trash2 size={14}/></Button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f.key} className="space-y-1">
            <Label className="text-xs">{f.label}</Label>
            {f.type === "textarea" ? (
              <Textarea value={node.props[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} rows={4}/>
            ) : f.type === "select" ? (
              <select className="w-full bg-background border rounded-md h-9 px-2 text-sm" value={node.props[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)}>
                {f.options!.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : f.type === "bool" ? (
              <input type="checkbox" checked={!!node.props[f.key]} onChange={(e) => set(f.key, e.target.checked)} />
            ) : f.type === "number" ? (
              <Input type="number" value={node.props[f.key] ?? ""} onChange={(e) => set(f.key, Number(e.target.value))}/>
            ) : (
              <Input value={node.props[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} placeholder={f.placeholder}/>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

type Field = { key: string; label: string; type: "text" | "textarea" | "select" | "bool" | "number"; options?: string[]; placeholder?: string };

function getFields(node: WidgetNode): Field[] {
  switch (node.type) {
    case "section":  return [
      { key: "padding", label: "Padding", type: "text", placeholder: "80px 24px" },
      { key: "background", label: "Background (color/gradient)", type: "text", placeholder: "transparent" },
      { key: "maxWidth", label: "Max Width", type: "text", placeholder: "1200px" },
      { key: "align", label: "Text Align", type: "select", options: ["left", "center", "right"] },
    ];
    case "columns":  return [
      { key: "count", label: "Column count", type: "number" },
      { key: "gap", label: "Gap", type: "text", placeholder: "24px" },
    ];
    case "heading":  return [
      { key: "text", label: "Text", type: "textarea" },
      { key: "level", label: "Tag", type: "select", options: ["h1","h2","h3","h4","h5","h6"] },
      { key: "align", label: "Align", type: "select", options: ["left","center","right"] },
      { key: "color", label: "Color", type: "text", placeholder: "hsl(var(--primary))" },
      { key: "size", label: "Font size", type: "text", placeholder: "3rem" },
    ];
    case "text":     return [
      { key: "text", label: "Text", type: "textarea" },
      { key: "align", label: "Align", type: "select", options: ["left","center","right"] },
      { key: "color", label: "Color", type: "text" },
      { key: "size", label: "Font size", type: "text" },
    ];
    case "image":    return [
      { key: "src", label: "Image URL", type: "text" },
      { key: "alt", label: "Alt text", type: "text" },
      { key: "width", label: "Width", type: "text", placeholder: "100%" },
      { key: "radius", label: "Border radius", type: "text" },
    ];
    case "button":   return [
      { key: "label", label: "Label", type: "text" },
      { key: "href", label: "Link", type: "text" },
      { key: "variant", label: "Style", type: "select", options: ["primary","outline"] },
      { key: "align", label: "Align", type: "select", options: ["left","center","right"] },
    ];
    case "spacer":   return [{ key: "height", label: "Height", type: "text" }];
    case "divider":  return [
      { key: "color", label: "Color", type: "text" },
      { key: "thickness", label: "Thickness", type: "text" },
    ];
    case "video":    return [
      { key: "src", label: "Video URL (mp4)", type: "text" },
      { key: "poster", label: "Poster image", type: "text" },
      { key: "autoplay", label: "Autoplay", type: "bool" },
      { key: "loop", label: "Loop", type: "bool" },
      { key: "muted", label: "Muted", type: "bool" },
    ];
    case "html":     return [{ key: "code", label: "HTML", type: "textarea" }];
    default: return [];
  }
}
