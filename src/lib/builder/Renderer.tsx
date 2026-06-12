import type { PageTree, WidgetNode } from "./types";

interface RenderOpts {
  tree: PageTree;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  editable?: boolean;
}

export function RenderTree({ tree, selectedId, onSelect, editable }: RenderOpts) {
  const root = tree.root;
  return (
    <>
      {root.children.map((cid) => (
        <RenderNode key={cid} id={cid} tree={tree} selectedId={selectedId} onSelect={onSelect} editable={editable} />
      ))}
    </>
  );
}

function RenderNode({ id, tree, selectedId, onSelect, editable }: { id: string } & RenderOpts) {
  const node = tree[id];
  if (!node) return null;
  const isSelected = editable && selectedId === id;
  const wrap = (children: React.ReactNode, style?: React.CSSProperties) => (
    <div
      data-widget={node.type}
      data-id={id}
      onClick={editable ? (e) => { e.stopPropagation(); onSelect?.(id); } : undefined}
      style={{
        outline: isSelected ? "2px solid hsl(var(--primary))" : undefined,
        outlineOffset: isSelected ? "2px" : undefined,
        cursor: editable ? "pointer" : undefined,
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );

  switch (node.type) {
    case "section": {
      const p = node.props;
      return wrap(
        <div style={{ maxWidth: p.maxWidth, margin: "0 auto", textAlign: p.align }}>
          {node.children.length === 0 && editable && (
            <div style={{ padding: 40, border: "1px dashed rgba(255,255,255,0.2)", borderRadius: 12, color: "rgba(255,255,255,0.4)" }}>
              Empty section — drop widgets here or pick from the left panel
            </div>
          )}
          {node.children.map((cid) => (
            <RenderNode key={cid} id={cid} tree={tree} selectedId={selectedId} onSelect={onSelect} editable={editable} />
          ))}
        </div>,
        { padding: p.padding, background: p.background }
      );
    }
    case "columns": {
      const p = node.props;
      const cols = Math.max(1, Math.min(6, Number(p.count) || 2));
      const perCol: string[][] = Array.from({ length: cols }, () => []);
      node.children.forEach((cid, i) => perCol[i % cols].push(cid));
      return wrap(
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: p.gap }}>
          {perCol.map((ids, i) => (
            <div key={i} style={{ minHeight: ids.length ? undefined : 80, border: editable && !ids.length ? "1px dashed rgba(255,255,255,0.15)" : undefined, borderRadius: 8 }}>
              {ids.map((cid) => (
                <RenderNode key={cid} id={cid} tree={tree} selectedId={selectedId} onSelect={onSelect} editable={editable} />
              ))}
            </div>
          ))}
        </div>
      );
    }
    case "heading": {
      const p = node.props;
      const Tag = (p.level || "h2") as any;
      return wrap(<Tag style={{ textAlign: p.align, color: p.color || undefined, fontSize: p.size || undefined, margin: 0 }}>{p.text}</Tag>);
    }
    case "text": {
      const p = node.props;
      return wrap(<p style={{ textAlign: p.align, color: p.color || undefined, fontSize: p.size, margin: 0, lineHeight: 1.6 }}>{p.text}</p>);
    }
    case "image": {
      const p = node.props;
      return wrap(<img src={p.src} alt={p.alt} style={{ width: p.width, borderRadius: p.radius, display: "block" }} />);
    }
    case "button": {
      const p = node.props;
      const cls = p.variant === "primary"
        ? "inline-block px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
        : "inline-block px-6 py-3 rounded-full border border-white/20 text-foreground hover:bg-white/5 transition";
      return wrap(
        <div style={{ textAlign: p.align }}>
          <a href={p.href} className={cls} onClick={editable ? (e) => e.preventDefault() : undefined}>{p.label}</a>
        </div>
      );
    }
    case "spacer":  return wrap(<div style={{ height: node.props.height }} />);
    case "divider": return wrap(<hr style={{ border: 0, borderTop: `${node.props.thickness} solid ${node.props.color}`, margin: 0 }} />);
    case "video": {
      const p = node.props;
      if (!p.src) return wrap(<div style={{ padding: 24, border: "1px dashed rgba(255,255,255,0.2)", borderRadius: 8, textAlign: "center" }}>Video — set src in properties</div>);
      return wrap(<video src={p.src} poster={p.poster} autoPlay={p.autoplay} loop={p.loop} muted={p.muted} controls={!p.autoplay} style={{ width: "100%", borderRadius: 12 }} />);
    }
    case "html":    return wrap(<div dangerouslySetInnerHTML={{ __html: node.props.code }} />);
    default: return null;
  }
}
