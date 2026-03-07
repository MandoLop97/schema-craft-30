import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, Loader2, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import { MediaGallery } from './MediaGallery';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

export function ImageUploadField({ label, value, onChange }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Máximo 10MB');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from('builder-assets')
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('builder-assets')
        .getPublicUrl(path);

      // Also register in media_files table
      await supabase.from('media_files').insert({
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        alt_text: file.name.replace(/\.[^/.]+$/, ''),
      });

      onChange(urlData.publicUrl);
      toast.success('Imagen subida');
    } catch (err: any) {
      toast.error(err.message || 'Error al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-1.5">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Label>

      {/* Preview */}
      {value && (
        <div className="relative group rounded-lg overflow-hidden border border-border bg-muted/20" style={{ height: 80 }}>
          <img
            src={value}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <button
            className="absolute top-1 right-1 p-0.5 rounded bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onChange('')}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Upload + Gallery + URL */}
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          className="text-[10px] h-7 shrink-0 gap-1"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
          {uploading ? '...' : 'Subir'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-[10px] h-7 shrink-0 gap-1"
          onClick={() => setGalleryOpen(true)}
        >
          <FolderOpen className="h-3 w-3" />
          Galería
        </Button>
        <Input
          className="h-7 text-[10px] flex-1 font-mono"
          placeholder="URL..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = '';
        }}
      />

      <MediaGallery
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onSelect={(url) => onChange(url)}
      />
    </div>
  );
}
