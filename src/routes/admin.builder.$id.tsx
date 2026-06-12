import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { RenderTree } from "@/lib/builder/Renderer";
import { PropertyPanel } from "@/lib/builder/PropertyPanel";
import { addWidget, deleteNode, duplicateNode, moveNode, updateProps } from "@/lib/builder/tree-ops";
import { emptyTree, widgetCatalog, type PageTree, type WidgetType } from "@/lib/builder/types";
import { Save, Eye, Undo2, Redo2, ArrowUp, ArrowDown, Monitor, Tablet, Smartphone } from "lucide-react";

export const Route = createFileRoute("/admin/builder/$id")({
  component: BuilderEditor,
  head: () => ({ meta: [{ title: "Edit Page" }, { name: "robots", content: "noindex" }] }),
});

function BuilderEditor() {
  const { id } = Route.useParams();
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const [page, setPage] = useState<any>(null);
  const [tree, setTree] = useState<PageTree>(emptyTree());
  const [selected, setSelected] = useState<string | null>(null);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const history = useRef<PageTree[]>([]);
  const future = useRef<PageTree[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
    else if (!isAdmin) navigate({ to: "/account" });
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const { data, error } = await supabase.from("builder_pages").select("*").eq("id", id).maybeSingle();
      if (error || !data) { toast.error("Page not found"); navigate({ to: "/admin/builder" }); return; }
      setPage(data);
      setTree((data.tree as any) ?? emptyTree());
    })();
  }, [id, isAdmin, navigate]);

  const commit = useCallback((next: PageTree) => {
    history.current.push(tree);
    future.current = [];
    setTree(next);
    setDirty(true);
  }, [tree]);

  const undo = () => {
    const prev = history.current.pop(); if (!prev) return;
    future.current.push(tree); setTree(prev); setDirty(true);
  };
  const redo = () => {
    const nxt = future.current.pop(); if (!nxt) return;
    history.current.push(tree); setTree(nxt); setDirty(true);
  };

  const addInto = (type: Exclude<WidgetType, "root">, parentId = "root") => {
    const { tree: next, id: newId } = addWidget(tree, parentId, type);
    commit(next); setSelected(newId);
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("builder_pages")
      .update({ title: page.title, description: page.description, slug: page.slug, tree: tree as any, published: page.published })
      .eq("id", id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Saved"); setDirty(false); }
  };

  if (loading || !isAdmin || !page) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;

  const deviceWidth = device === "desktop" ? "100%" : device === "tablet" ? 768 : 390;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top toolbar */}
      <header className="h-14 border-b flex items-center justify-between px-4 gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/admin/builder" className="text-xs text-muted-foreground hover:text-foreground">← Pages</Link>
          <Input
            value={page.title}
            onChange={(e) => { setPage({ ...page, title: e.target.value }); setDirty(true); }}
            className="h-8 w-56"
          />
          <span className="text-xs text-muted-foreground">/p/{page.slug}</span>
          {dirty && <span className="text-xs text-amber-400">● unsaved</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={undo}><Undo2 size={14}/></Button>
          <Button size="sm" variant="ghost" onClick={redo}><Redo2 size={14}/></Button>
          <div className="flex items-center border rounded-md">
            <button onClick={() => setDevice("desktop")} className={`p-2 ${device === "desktop" ? "text-primary" : "text-muted-foreground"}`}><Monitor size={14}/></button>
            <button onClick={() => setDevice("tablet")} className={`p-2 ${device === "tablet" ? "text-primary" : "text-muted-foreground"}`}><Tablet size={14}/></button>
            <button onClick={() => setDevice("mobile")} className={`p-2 ${device === "mobile" ? "text-primary" : "text-muted-foreground"}`}><Smartphone size={14}/></button>
          </div>
          <div className="flex items-center gap-2 pl-3 border-l">
            <Label className="text-xs">Published</Label>
            <Switch checked={page.published} onCheckedChange={(v) => { setPage({ ...page, published: v }); setDirty(true); }}/>
          </div>
          {page.published && <a href={`/p/${page.slug}`} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><Eye size={14}/>Preview</a>}
          <Button size="sm" onClick={save} disabled={saving}><Save size={14} className="mr-2"/>{saving ? "Saving…" : "Save"}</Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left widget panel */}
        <aside className="w-56 border-r overflow-y-auto p-3 shrink-0">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Widgets</div>
          <div className="grid grid-cols-2 gap-2">
            {widgetCatalog.map((w) => (
              <button
                key={w.type}
                onClick={() => addInto(w.type, selected && tree[selected] && (tree[selected].type === "section" || tree[selected].type === "columns") ? selected : "root")}
                className="aspect-square glass rounded-lg flex flex-col items-center justify-center gap-1 text-xs hover:border-primary/40 hover:scale-105 transition"
              >
                <span className="text-xl">{w.icon}</span>
                {w.label}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-muted-foreground mt-3">Tip: select a Section or Columns first to nest into it. Otherwise widgets append to the page root.</div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 overflow-auto bg-muted/20 p-6" onClick={() => setSelected(null)}>
          <div
            style={{ maxWidth: deviceWidth, margin: "0 auto", minHeight: "100%", background: "hsl(var(--background))" }}
            className="rounded-lg shadow-2xl overflow-hidden transition-all"
          >
            {tree.root.children.length === 0 && (
              <div className="p-20 text-center text-muted-foreground">
                <div className="font-display text-2xl mb-2">Empty page</div>
                <div className="text-sm">Click a widget on the left to add it. Start with a Section.</div>
              </div>
            )}
            <RenderTree tree={tree} editable selectedId={selected} onSelect={setSelected}/>
          </div>
        </main>

        {/* Right property panel */}
        <aside className="w-80 border-l overflow-y-auto shrink-0">
          {selected && tree[selected] && tree[selected].type !== "root" && (
            <div className="flex gap-2 p-3 border-b">
              <Button size="sm" variant="outline" onClick={() => commit(moveNode(tree, selected, "up"))}><ArrowUp size={14}/></Button>
              <Button size="sm" variant="outline" onClick={() => commit(moveNode(tree, selected, "down"))}><ArrowDown size={14}/></Button>
            </div>
          )}
          <PropertyPanel
            tree={tree}
            selectedId={selected}
            onChange={(nid, props) => commit(updateProps(tree, nid, props))}
            onDelete={(nid) => { commit(deleteNode(tree, nid)); setSelected(null); }}
            onDuplicate={(nid) => commit(duplicateNode(tree, nid))}
          />
        </aside>
      </div>
    </div>
  );
}
