import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Search, X, Check, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface MediaFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  alt_text: string;
  folder: string;
  created_at: string;
}

interface MediaGalleryProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export function MediaGallery({ open, onClose, onSelect }: MediaGalleryProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('media_files')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setFiles(data as MediaFile[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) {
      fetchFiles();
      setSelectedUrl(null);
    }
  }, [open, fetchFiles]);

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList) return;
    setUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        if (!file.type.startsWith('image/')) continue;
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error } = await supabase.storage.from('builder-assets').upload(path, file, { cacheControl: '3600', upsert: false });
        if (error) throw error;

        const { data: urlData } = supabase.storage.from('builder-assets').getPublicUrl(path);

        await supabase.from('media_files').insert({
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
          alt_text: file.name.replace(/\.[^/.]+$/, ''),
        });
      }
      toast.success('Archivos subidos');
      fetchFiles();
    } catch (err: any) {
      toast.error(err.message || 'Error al subir');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (file: MediaFile) => {
    await supabase.from('media_files').delete().eq('id', file.id);
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    if (selectedUrl === file.file_url) setSelectedUrl(null);
    toast.success('Eliminado');
  };

  const filtered = search
    ? files.filter((f) => f.file_name.toLowerCase().includes(search.toLowerCase()) || f.alt_text.toLowerCase().includes(search.toLowerCase()))
    : files;

  const handleConfirm = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b shrink-0">
          <DialogTitle className="text-sm font-bold flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Galería de Medios
          </DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar archivos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs pl-8"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5" disabled={uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            Subir
          </Button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { handleUpload(e.target.files); e.target.value = ''; }} />
        </div>

        {/* Grid */}
        <ScrollArea className="flex-1 px-5 py-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{search ? 'Sin resultados' : 'No hay archivos. Sube imágenes para comenzar.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filtered.map((file) => {
                const isSelected = selectedUrl === file.file_url;
                return (
                  <div
                    key={file.id}
                    className={`group relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-150 ${
                      isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-border'
                    }`}
                    onClick={() => setSelectedUrl(file.file_url)}
                  >
                    <div className="aspect-square bg-muted/30">
                      <img src={file.file_url} alt={file.alt_text} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                    <button
                      className="absolute top-1.5 left-1.5 h-5 w-5 rounded-full bg-destructive/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); handleDelete(file); }}
                    >
                      <Trash2 className="h-2.5 w-2.5 text-white" />
                    </button>
                    <p className="text-[9px] truncate px-1.5 py-1 text-muted-foreground">{file.file_name}</p>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t shrink-0">
          <span className="text-[10px] text-muted-foreground">{filtered.length} archivo(s)</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={onClose}>Cancelar</Button>
            <Button size="sm" className="text-xs h-8" disabled={!selectedUrl} onClick={handleConfirm}>Seleccionar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
