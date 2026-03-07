
-- Products table
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  original_price numeric(10,2),
  badge text DEFAULT '',
  image_url text DEFAULT '',
  category text DEFAULT '',
  sku text DEFAULT '',
  in_stock boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Anyone can insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete products" ON public.products FOR DELETE USING (true);

-- Media files table
CREATE TABLE public.media_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text DEFAULT 'image',
  file_size integer DEFAULT 0,
  alt_text text DEFAULT '',
  folder text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read media" ON public.media_files FOR SELECT USING (true);
CREATE POLICY "Anyone can insert media" ON public.media_files FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update media" ON public.media_files FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete media" ON public.media_files FOR DELETE USING (true);

-- Trigger for products updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
