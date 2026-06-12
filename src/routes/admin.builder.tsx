import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, ExternalLink, Trash2 } from "lucide-react";
import { emptyTree } from "@/lib/builder/types";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/builder")({
  component: BuilderList,
  head: () => ({ meta: [{ title: "Page Builder" }, { name: "robots", content: "noindex" }] }),
});

function BuilderList() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [pages, setPages] = useState<any[]>([]);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
    else if (!isAdmin) navigate({ to: "/account" });
  }, [user, isAdmin, loading, navigate]);

  const load = async () => {
    const { data } = await supabase.from("builder_pages").select("*").order("updated_at", { ascending: false });
    setPages(data ?? []);
  };
  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const create = async () => {
    if (!slug.trim() || !title.trim()) { toast.error("Slug and title required"); return; }
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const { data, error } = await supabase.from("builder_pages")
      .insert({ slug: cleanSlug, title, tree: emptyTree() as any, created_by: user!.id })
      .select().single();
    if (error) { toast.error(error.message); return; }
    navigate({ to: "/admin/builder/$id", params: { id: data.id } });
  };

  const del = async (id: string) => {
    if (!confirm("Delete this page?")) return;
    await supabase.from("builder_pages").delete().eq("id", id);
    load();
  };

  if (loading || !isAdmin) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;

  return (
    <div className="min-h-screen pt-28 pb-24 px-6">
      <div className="container-luxe mx-auto max-w-5xl">
        <Link to="/admin" className="text-xs text-muted-foreground hover:text-foreground">← Back to Admin</Link>
        <h1 className="font-display text-4xl text-gradient mt-4">Page Builder</h1>
        <p className="text-sm text-muted-foreground mt-2">Build pages visually. Drag widgets, edit live, publish.</p>

        <div className="glass-card rounded-2xl p-6 mt-8">
          <div className="font-display text-xl mb-4">Create new page</div>
          <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-3">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}/>
            <Input placeholder="slug (e.g. landing-2026)" value={slug} onChange={(e) => setSlug(e.target.value)}/>
            <Button onClick={create}><Plus size={16} className="mr-2"/>Create</Button>
          </div>
        </div>

        <div className="mt-10 space-y-2">
          {pages.length === 0 && <div className="text-sm text-muted-foreground">No pages yet.</div>}
          {pages.map((p) => (
            <div key={p.id} className="glass rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-medium">{p.title} <span className="text-xs text-muted-foreground">/p/{p.slug}</span></div>
                <div className="text-xs text-muted-foreground">{p.published ? "Published" : "Draft"} · updated {new Date(p.updated_at).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                {p.published && <a href={`/p/${p.slug}`} target="_blank" rel="noreferrer" className="p-2 hover:text-primary"><ExternalLink size={16}/></a>}
                <Link to="/admin/builder/$id" params={{ id: p.id }} className="p-2 hover:text-primary"><Pencil size={16}/></Link>
                <button onClick={() => del(p.id)} className="p-2 hover:text-destructive"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
