import { Undo2, Redo2, Save, Eye, Download, Monitor, Tablet, Smartphone, Globe, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface TopBarProps {
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onPreview: () => void;
  onExport: () => void;
  onPublish: () => void;
  onSaveDraft: () => void;
  device: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (d: 'desktop' | 'tablet' | 'mobile') => void;
  dirty: boolean;
  pageTitle?: string;
  onBackToPages?: () => void;
}

export function TopBar({ onSave, onUndo, onRedo, canUndo, canRedo, onPreview, onExport, onPublish, onSaveDraft, device, onDeviceChange, dirty, pageTitle, onBackToPages }: TopBarProps) {
  return (
    <div className="h-12 border-b flex items-center px-3 gap-1 shrink-0" style={{ backgroundColor: 'hsla(210, 60%, 50%, 0.08)' }}>
      {onBackToPages && (
        <Button variant="ghost" size="icon" onClick={onBackToPages} title="Back to Pages" className="mr-1 hover:bg-primary/10">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
      <span className="text-sm font-bold tracking-tight mr-1 text-foreground">NEXORA</span>
      {pageTitle && (
        <>
          <span className="text-muted-foreground/50 text-sm mx-0.5">/</span>
          <span className="text-xs font-medium text-muted-foreground truncate max-w-[160px] bg-muted/60 px-2 py-0.5 rounded-md">{pageTitle}</span>
        </>
      )}
      <Separator orientation="vertical" className="h-5 ml-2" />

      <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} title="Undo">
        <Undo2 className="h-3.5 w-3.5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} title="Redo">
        <Redo2 className="h-3.5 w-3.5" />
      </Button>

      <Separator orientation="vertical" className="h-5" />

      <div className="flex items-center bg-muted/50 rounded-md p-0.5 gap-0.5">
        <Button variant="ghost" size="icon" onClick={() => onDeviceChange('desktop')} className={`h-7 w-7 ${device === 'desktop' ? 'bg-background shadow-sm' : ''}`}>
          <Monitor className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDeviceChange('tablet')} className={`h-7 w-7 ${device === 'tablet' ? 'bg-background shadow-sm' : ''}`}>
          <Tablet className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDeviceChange('mobile')} className={`h-7 w-7 ${device === 'mobile' ? 'bg-background shadow-sm' : ''}`}>
          <Smartphone className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex-1" />

      <Button variant="ghost" size="sm" onClick={onPreview} className="gap-1.5 text-xs">
        <Eye className="h-3.5 w-3.5" /> Preview
      </Button>
      <Button variant="ghost" size="sm" onClick={onExport} className="gap-1.5 text-xs">
        <Download className="h-3.5 w-3.5" /> Export
      </Button>
      <Separator orientation="vertical" className="h-5" />
      <Button size="sm" variant="outline" onClick={onSave} className="gap-1.5 text-xs h-7">
        <Save className="h-3.5 w-3.5" /> {dirty ? 'Save*' : 'Save'}
      </Button>
      <Button size="sm" variant="outline" onClick={onSaveDraft} className="gap-1.5 text-xs h-7">
        Borrador
      </Button>
      <Button size="sm" onClick={onPublish} className="gap-1.5 text-xs h-7 bg-primary text-primary-foreground hover:bg-primary/90">
        <Globe className="h-3.5 w-3.5" /> Publicar
      </Button>
    </div>
  );
}
