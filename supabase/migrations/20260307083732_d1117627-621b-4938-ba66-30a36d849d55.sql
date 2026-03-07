CREATE TABLE public.page_schemas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT '',
  schema_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  template_type text NOT NULL DEFAULT 'page',
  category text NOT NULL DEFAULT 'Páginas',
  canvas_size jsonb,
  mock_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.page_schemas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read page_schemas" ON public.page_schemas FOR SELECT USING (true);
CREATE POLICY "Anyone can insert page_schemas" ON public.page_schemas FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update page_schemas" ON public.page_schemas FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete page_schemas" ON public.page_schemas FOR DELETE USING (true);

CREATE TRIGGER update_page_schemas_updated_at
  BEFORE UPDATE ON public.page_schemas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();