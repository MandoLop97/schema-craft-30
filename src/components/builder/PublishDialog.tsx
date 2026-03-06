import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Schema } from '@/types/schema';
import { toast } from 'sonner';
import { Globe, Loader2 } from 'lucide-react';
import { t } from '@/lib/i18n';

export interface PublishPayload {
  domain: string;
  schema: Schema;
  mode: 'draft' | 'published';
}

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schema: Schema;
  mode: 'draft' | 'published';
  onPublishSubmit?: (payload: PublishPayload) => Promise<void>;
}

export function PublishDialog({ open, onOpenChange, schema, mode, onPublishSubmit }: PublishDialogProps) {
  const [domain, setDomain] = useState('');
  const [publishing, setPublishing] = useState(false);
  const locale = t();

  const handlePublish = async () => {
    const trimmed = domain.trim().toLowerCase();
    if (!trimmed) {
      toast.error(locale.invalidDomain);
      return;
    }

    if (!onPublishSubmit) {
      toast.error(locale.noPublishHandler);
      return;
    }

    setPublishing(true);
    try {
      await onPublishSubmit({ domain: trimmed, schema, mode });
      toast.success(mode === 'published' ? locale.publishSuccess(trimmed) : locale.draftSuccess(trimmed));
      onOpenChange(false);
    } catch (err: any) {
      toast.error(locale.publishError(err.message));
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" /> {mode === 'published' ? locale.publishPage : locale.saveDraftTitle}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="domain">{locale.targetDomain}</Label>
            <Input
              id="domain"
              placeholder="mitienda.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePublish()}
            />
            <p className="text-xs text-muted-foreground">{locale.domainHint}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{locale.cancel}</Button>
          <Button onClick={handlePublish} disabled={publishing || !onPublishSubmit}>
            {publishing && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'published' ? locale.publish : locale.saveDraft}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
