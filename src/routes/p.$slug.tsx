import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RenderTree } from "@/lib/builder/Renderer";
import { emptyTree, type PageTree } from "@/lib/builder/types";

export const Route = createFileRoute("/p/$slug")({
  component: PublicPage,
  head: () => ({ meta: [{ title: "Page" }] }),
});

function PublicPage() {
  const { slug } = Route.useParams();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("builder_pages").select("*").eq("slug", slug).eq("published", true).maybeSingle();
      setPage(data);
      setLoading(false);
      if (data?.title) document.title = data.title;
    })();
  }, [slug]);

  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  if (!page) return <div className="min-h-screen grid place-items-center text-muted-foreground">Page not found.</div>;

  const tree = (page.tree as PageTree) ?? emptyTree();
  return (
    <div className="min-h-screen">
      <RenderTree tree={tree}/>
    </div>
  );
}
