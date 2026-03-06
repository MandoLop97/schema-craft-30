import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Schema } from '@/types/schema';
import { t } from '@/lib/i18n';
import { Copy, Check, Download } from 'lucide-react';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schema: Schema;
}

export function ExportDialog({ open, onOpenChange, schema }: ExportDialogProps) {
  const [copied, setCopied] = useState(false);
  const locale = t();
  const json = JSON.stringify(schema, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schema-${schema.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" /> {locale.exportTitle}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{locale.exportDescription}</p>
        <div className="relative">
          <pre className="bg-muted/50 border rounded-lg p-3 text-xs font-mono max-h-64 overflow-auto whitespace-pre-wrap break-all">
            {json}
          </pre>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{locale.cancel}</Button>
          <Button variant="outline" onClick={handleDownload} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> JSON
          </Button>
          <Button onClick={handleCopy} className="gap-1.5">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? locale.copied : locale.copyToClipboard}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
