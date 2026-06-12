import { type PageTree, type WidgetType, newId, widgetDefaults } from "./types";

export function addWidget(tree: PageTree, parentId: string, type: Exclude<WidgetType, "root">, index?: number): { tree: PageTree; id: string } {
  const id = newId();
  const next: PageTree = JSON.parse(JSON.stringify(tree));
  next[id] = { id, type, children: [], props: { ...widgetDefaults[type] } };
  const parent = next[parentId] ?? next.root;
  const at = index ?? parent.children.length;
  parent.children.splice(at, 0, id);
  return { tree: next, id };
}

export function updateProps(tree: PageTree, id: string, props: Record<string, any>): PageTree {
  const next: PageTree = JSON.parse(JSON.stringify(tree));
  if (next[id]) next[id].props = props;
  return next;
}

function findParent(tree: PageTree, id: string): string | null {
  for (const k of Object.keys(tree)) {
    if (tree[k].children?.includes(id)) return k;
  }
  return null;
}

export function deleteNode(tree: PageTree, id: string): PageTree {
  if (id === "root") return tree;
  const next: PageTree = JSON.parse(JSON.stringify(tree));
  const parentId = findParent(next, id);
  if (parentId) next[parentId].children = next[parentId].children.filter((c) => c !== id);
  const removeRec = (nid: string) => {
    const n = next[nid];
    if (!n) return;
    n.children.forEach(removeRec);
    delete next[nid];
  };
  removeRec(id);
  return next;
}

export function duplicateNode(tree: PageTree, id: string): PageTree {
  if (id === "root") return tree;
  const next: PageTree = JSON.parse(JSON.stringify(tree));
  const parentId = findParent(next, id);
  if (!parentId) return tree;
  const cloneRec = (nid: string): string => {
    const orig = next[nid];
    const nid2 = newId();
    next[nid2] = { ...orig, id: nid2, children: orig.children.map(cloneRec), props: { ...orig.props } };
    return nid2;
  };
  const newRoot = cloneRec(id);
  const parent = next[parentId];
  const idx = parent.children.indexOf(id);
  parent.children.splice(idx + 1, 0, newRoot);
  return next;
}

export function moveNode(tree: PageTree, id: string, direction: "up" | "down"): PageTree {
  const next: PageTree = JSON.parse(JSON.stringify(tree));
  const parentId = findParent(next, id);
  if (!parentId) return tree;
  const arr = next[parentId].children;
  const i = arr.indexOf(id);
  const j = direction === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= arr.length) return tree;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  return next;
}
