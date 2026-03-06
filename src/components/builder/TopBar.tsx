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
        <Button variant="ghost" size="icon" onClick={onBackToPages} title="Back to Pages" className="mr-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
      <span className="text-sm font-semibold tracking-tight mr-1">NEXORA</span>
      {pageTitle && (
        <>
          <span className="text-muted-foreground text-sm">/</span>
          <span className="text-sm text-muted-foreground truncate max-w-[150px]">{pageTitle}</span>
        </>
      )}
      <Separator orientation="vertical" className="h-6 ml-2" />

      <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} title="Undo">
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} title="Redo">
        <Redo2 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button variant="ghost" size="icon" onClick={() => onDeviceChange('desktop')} className={device === 'desktop' ? 'bg-muted' : ''}>
        <Monitor className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onDeviceChange('tablet')} className={device === 'tablet' ? 'bg-muted' : ''}>
        <Tablet className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onDeviceChange('mobile')} className={device === 'mobile' ? 'bg-muted' : ''}>
        <Smartphone className="h-4 w-4" />
      </Button>

      <div className="flex-1" />

      <Button variant="ghost" size="sm" onClick={onPreview} className="gap-1.5">
        <Eye className="h-4 w-4" /> Preview
      </Button>
      <Button variant="ghost" size="sm" onClick={onExport} className="gap-1.5">
        <Download className="h-4 w-4" /> Export
      </Button>
      <Button size="sm" onClick={onSave} className="gap-1.5">
        <Save className="h-4 w-4" /> {dirty ? 'Save*' : 'Save'}
      </Button>
      <Button size="sm" variant="outline" onClick={onSaveDraft} className="gap-1.5">
        <Save className="h-4 w-4" /> Borrador
      </Button>
      <Button size="sm" onClick={onPublish} className="gap-1.5 bg-green-600 hover:bg-green-700 text-white">
        <Globe className="h-4 w-4" /> Publicar
      </Button>
    </div>
  );
}
