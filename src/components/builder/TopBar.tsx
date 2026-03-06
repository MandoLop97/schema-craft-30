import { Undo2, Redo2, Save, Eye, Download, Monitor, Tablet, Smartphone, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { t } from '@/lib/i18n';

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
}

export function TopBar({ onSave, onUndo, onRedo, canUndo, canRedo, onPreview, onExport, onPublish, onSaveDraft, device, onDeviceChange, dirty, pageTitle }: TopBarProps) {
  const locale = t();

  return (
    <div className="h-12 border-b flex items-center px-3 gap-1 shrink-0" style={{ backgroundColor: 'hsla(210, 60%, 50%, 0.08)' }}>
      <span className="text-sm font-bold tracking-tight mr-0.5 text-foreground">NEXORA</span>
      {pageTitle && (
        <>
          <span className="text-muted-foreground/50 text-sm mx-0.5">/</span>
          <span className="text-xs font-medium text-muted-foreground truncate max-w-[160px] bg-muted/60 px-2 py-0.5 rounded-md">{pageTitle}</span>
        </>
      )}
      <Separator orientation="vertical" className="h-5 ml-2" />

      <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} title={locale.undo} className="transition-transform active:scale-90">
        <Undo2 className="h-3.5 w-3.5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} title={locale.redo} className="transition-transform active:scale-90">
        <Redo2 className="h-3.5 w-3.5" />
      </Button>

      <Separator orientation="vertical" className="h-5" />

      <div className="flex items-center bg-muted/50 rounded-md p-0.5 gap-0.5">
        {(['desktop', 'tablet', 'mobile'] as const).map((d) => {
          const Icon = d === 'desktop' ? Monitor : d === 'tablet' ? Tablet : Smartphone;
          return (
            <Button
              key={d}
              variant="ghost"
              size="icon"
              onClick={() => onDeviceChange(d)}
              className={`h-7 w-7 transition-all duration-200 active:scale-90 ${device === d ? 'bg-background shadow-sm' : ''}`}
            >
              <Icon className="h-3.5 w-3.5" />
            </Button>
          );
        })}
      </div>

      <div className="flex-1" />

      <Button variant="ghost" size="sm" onClick={onPreview} className="gap-1.5 text-xs transition-transform active:scale-95">
        <Eye className="h-3.5 w-3.5" /> {locale.preview}
      </Button>
      <Button variant="ghost" size="sm" onClick={onExport} className="gap-1.5 text-xs transition-transform active:scale-95">
        <Download className="h-3.5 w-3.5" /> {locale.export}
      </Button>
      <Separator orientation="vertical" className="h-5" />
      <Button size="sm" variant="outline" onClick={onSave} className="gap-1.5 text-xs h-7 transition-transform active:scale-95">
        <Save className="h-3.5 w-3.5" />
        {locale.save}
        {dirty && (
          <span
            className="nxr-dirty-dot inline-block w-1.5 h-1.5 rounded-full ml-0.5"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          />
        )}
      </Button>
      <Button size="sm" variant="outline" onClick={onSaveDraft} className="gap-1.5 text-xs h-7 transition-transform active:scale-95">
        {locale.saveDraft}
      </Button>
      <Button size="sm" onClick={onPublish} className="gap-1.5 text-xs h-7 bg-primary text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95">
        <Globe className="h-3.5 w-3.5" /> {locale.publish}
      </Button>
    </div>
  );
}
