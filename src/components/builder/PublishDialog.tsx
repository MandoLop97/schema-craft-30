import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Schema } from '@/types/schema';
import { toast } from 'sonner';
import { Globe, Loader2, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';
import { t } from '@/lib/i18n';
import { validateForPublish, PublishValidationResult, ValidationIssue } from '@/lib/publish-validator';

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

  // Run validation when dialog opens
  const validation = useMemo<PublishValidationResult | null>(() => {
    if (!open) return null;
    return validateForPublish(schema);
  }, [open, schema]);

  const hasErrors = validation ? validation.errors.length > 0 : false;
  const hasWarnings = validation ? validation.warnings.length > 0 : false;
  const canPublish = !hasErrors && mode === 'published';
  const canSaveDraft = mode === 'draft'; // Drafts can be saved even with errors

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

    // Block publish if validation errors (not drafts)
    if (mode === 'published' && hasErrors) {
      toast.error('Cannot publish: fix validation errors first');
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
          {/* Validation Results */}
          {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
            <div className="space-y-2">
              {validation.errors.length > 0 && (
                <div className="rounded-md border p-3 space-y-1" style={{ borderColor: 'hsl(var(--destructive) / 0.5)', backgroundColor: 'hsl(var(--destructive) / 0.05)' }}>
                  <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'hsl(var(--destructive))' }}>
                    <XCircle className="h-3.5 w-3.5" />
                    {validation.errors.length} error{validation.errors.length > 1 ? 's' : ''} — must fix to publish
                  </div>
                  {validation.errors.slice(0, 5).map((issue, i) => (
                    <ValidationLine key={`e-${i}`} issue={issue} />
                  ))}
                  {validation.errors.length > 5 && (
                    <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      +{validation.errors.length - 5} more...
                    </p>
                  )}
                </div>
              )}
              {validation.warnings.length > 0 && (
                <div className="rounded-md border p-3 space-y-1" style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--muted) / 0.3)' }}>
                  <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'hsl(var(--foreground) / 0.7)' }}>
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {validation.warnings.length} warning{validation.warnings.length > 1 ? 's' : ''}
                  </div>
                  {validation.warnings.slice(0, 3).map((issue, i) => (
                    <ValidationLine key={`w-${i}`} issue={issue} />
                  ))}
                  {validation.warnings.length > 3 && (
                    <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      +{validation.warnings.length - 3} more...
                    </p>
                  )}
                </div>
              )}
              {validation.valid && (
                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'hsl(142 76% 36%)' }}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Schema is valid for publishing
                </div>
              )}
            </div>
          )}

          {validation && validation.issues.length === 0 && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'hsl(142 76% 36%)' }}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Schema is valid — no issues found
            </div>
          )}

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
          <Button 
            onClick={handlePublish} 
            disabled={publishing || !onPublishSubmit || (mode === 'published' && hasErrors)}
          >
            {publishing && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'published' ? locale.publish : locale.saveDraft}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ValidationLine({ issue }: { issue: ValidationIssue }) {
  return (
    <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))', paddingLeft: '1.25rem' }}>
      • {issue.message}
      {issue.nodeType && <span style={{ opacity: 0.6 }}> ({issue.nodeType})</span>}
    </p>
  );
}
