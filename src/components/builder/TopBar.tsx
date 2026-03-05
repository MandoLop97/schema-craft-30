import { Undo2, Redo2, Save, Eye, Download, Monitor, Tablet, Smartphone, Globe } from 'lucide-react';
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
  device: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (d: 'desktop' | 'tablet' | 'mobile') => void;
  dirty: boolean;
}

export function TopBar({ onSave, onUndo, onRedo, canUndo, canRedo, onPreview, onExport, onPublish, device, onDeviceChange, dirty }: TopBarProps) {
  return (
    <div className="h-12 border-b bg-background flex items-center px-3 gap-1 shrink-0">
      <span className="text-sm font-semibold tracking-tight mr-3">NEXORA</span>
      <Separator orientation="vertical" className="h-6" />

      <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} title="Undo">
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} title="Redo">
        <Redo2 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button variant="ghost" size="icon" onClick={() => onDeviceChange('desktop')} data-active={device === 'desktop'} className={device === 'desktop' ? 'bg-muted' : ''}>
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
      <Button size="sm" onClick={onPublish} className="gap-1.5 bg-green-600 hover:bg-green-700 text-white">
        <Globe className="h-4 w-4" /> Publicar
      </Button>
    </div>
  );
}
