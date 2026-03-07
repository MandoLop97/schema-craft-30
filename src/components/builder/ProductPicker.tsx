import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, Check, Loader2, ShoppingBag, Package } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  badge: string;
  image_url: string;
  category: string;
  sku: string;
  in_stock: boolean;
}

interface ProductPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (product: Product) => void;
}

export function ProductPicker({ open, onClose, onSelect }: ProductPickerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setProducts(data as Product[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) {
      fetchProducts();
      setSelectedId(null);
    }
  }, [open, fetchProducts]);

  const filtered = search
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  const handleConfirm = () => {
    const product = products.find((p) => p.id === selectedId);
    if (product) {
      onSelect(product);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl h-[70vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b shrink-0">
          <DialogTitle className="text-sm font-bold flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Seleccionar Producto
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="px-5 py-3 border-b shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, categoría, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs pl-8 pr-8"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Product list */}
        <ScrollArea className="flex-1 px-5 py-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{search ? 'Sin resultados' : 'No hay productos registrados.'}</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filtered.map((product) => {
                const isSelected = selectedId === product.id;
                return (
                  <div
                    key={product.id}
                    className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'bg-primary/10 border border-primary/30'
                        : 'hover:bg-muted/60 border border-transparent'
                    }`}
                    onClick={() => setSelectedId(product.id)}
                  >
                    {/* Image */}
                    <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted/30 shrink-0 border border-border/50">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-semibold">${product.price.toFixed(2)}</span>
                        {product.original_price && (
                          <span className="text-[10px] text-muted-foreground line-through">${product.original_price.toFixed(2)}</span>
                        )}
                        {product.badge && (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{product.badge}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{product.category}</span>
                        <span className="text-muted-foreground/30">·</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{product.sku}</span>
                      </div>
                    </div>

                    {/* Check */}
                    {isSelected && (
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t shrink-0">
          <span className="text-[10px] text-muted-foreground">{filtered.length} producto(s)</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={onClose}>Cancelar</Button>
            <Button size="sm" className="text-xs h-8" disabled={!selectedId} onClick={handleConfirm}>Usar Producto</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
