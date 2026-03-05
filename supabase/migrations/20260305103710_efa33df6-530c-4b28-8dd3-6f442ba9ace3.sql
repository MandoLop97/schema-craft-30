
-- Create published_pages table
CREATE TABLE public.published_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL,
  content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'published',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.published_pages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read published pages (the template needs to read them)
CREATE POLICY "Anyone can read published pages"
  ON public.published_pages FOR SELECT
  USING (true);

-- Allow anyone to insert/update (builder doesn't have auth)
CREATE POLICY "Anyone can insert published pages"
  ON public.published_pages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update published pages"
  ON public.published_pages FOR UPDATE
  USING (true);

-- Create unique index on domain so we upsert by domain
CREATE UNIQUE INDEX idx_published_pages_domain ON public.published_pages (domain);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_published_pages_updated_at
  BEFORE UPDATE ON public.published_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
