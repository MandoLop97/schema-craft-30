import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Schema } from '@/types/schema';
import { PageRenderer } from '@/components/schema/PageRenderer';
import { t } from '@/lib/i18n';
import { X, Monitor, Tablet, Smartphone } from 'lucide-react';

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schema: Schema;
}

const DEVICES = [
  { key: 'desktop' as const, icon: Monitor, width: '100%' },
  { key: 'tablet' as const, icon: Tablet, width: '768px' },
  { key: 'mobile' as const, icon: Smartphone, width: '375px' },
];

export function PreviewDialog({ open, onOpenChange, schema }: PreviewDialogProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const locale = t();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b flex flex-row items-center justify-between shrink-0">
          <DialogTitle className="text-sm font-semibold">{locale.previewTitle}</DialogTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted/50 rounded-md p-0.5 gap-0.5">
              {DEVICES.map(({ key, icon: Icon }) => (
                <Button
                  key={key}
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 ${device === key ? 'bg-background shadow-sm' : ''}`}
                  onClick={() => setDevice(key)}
                >
                  <Icon className="h-3.5 w-3.5" />
                </Button>
              ))}
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto bg-muted/30 flex justify-center p-4">
          <div
            style={{
              width: DEVICES.find((d) => d.key === device)?.width,
              maxWidth: '100%',
              transition: 'width 300ms ease',
            }}
            className="bg-background shadow-lg border rounded-md overflow-hidden"
          >
            <PageRenderer schema={schema} mode="preview" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
