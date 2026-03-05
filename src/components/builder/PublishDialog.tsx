import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Schema } from '@/types/schema';
import { toast } from 'sonner';
import { Globe, Loader2 } from 'lucide-react';

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schema: Schema;
  mode: 'draft' | 'published';
}

export function PublishDialog({ open, onOpenChange, schema, mode }: PublishDialogProps) {
  const [domain, setDomain] = useState('');
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    const trimmed = domain.trim().toLowerCase();
    if (!trimmed) {
      toast.error('Ingresa un dominio');
      return;
    }

    setPublishing(true);
    try {
      const { error } = await supabase
        .from('published_pages')
        .upsert(
          {
            domain: trimmed,
            content_json: schema as any,
            status: mode,
          },
          { onConflict: 'domain' }
        );

      if (error) throw error;

      toast.success(mode === 'published' ? `Página publicada para ${trimmed}` : `Borrador guardado para ${trimmed}`);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(`Error al publicar: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" /> {mode === 'published' ? 'Publicar página' : 'Guardar borrador'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="domain">Dominio destino</Label>
            <Input
              id="domain"
              placeholder="mitienda.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePublish()}
            />
            <p className="text-xs text-muted-foreground">
              El template leerá este contenido usando el dominio como clave.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handlePublish} disabled={publishing}>
            {publishing && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'published' ? 'Publicar' : 'Guardar borrador'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
