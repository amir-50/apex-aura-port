
CREATE TABLE public.builder_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT 'Untitled',
  description TEXT DEFAULT '',
  tree JSONB NOT NULL DEFAULT '{"root":{"id":"root","type":"root","children":[],"props":{}}}'::jsonb,
  published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.builder_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.builder_pages TO authenticated;
GRANT ALL ON public.builder_pages TO service_role;

ALTER TABLE public.builder_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published pages"
ON public.builder_pages FOR SELECT
USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage pages"
ON public.builder_pages FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER touch_builder_pages_updated_at
BEFORE UPDATE ON public.builder_pages
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_builder_pages_slug ON public.builder_pages(slug);
CREATE INDEX idx_builder_pages_published ON public.builder_pages(published);
