import React, { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';

// ═══════════════════════════════════════════════════════════════════════════
// ARRAY EDITOR — Reusable editor for array-type props in the Inspector
// ═══════════════════════════════════════════════════════════════════════════

export interface ArrayFieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'image' | 'toggle';
  placeholder?: string;
  rows?: number;
  defaultValue?: any;
}

export interface ArrayEditorProps {
  /** Label shown above the editor */
  label: string;
  /** The current array of items */
  items: any[];
  /** Field definitions for each item */
  fields: ArrayFieldDef[];
  /** Called when items change */
  onChange: (items: any[]) => void;
  /** Default values for a new item */
  newItemDefaults?: Record<string, any>;
  /** Text for the add button */
  addLabel?: string;
  /** Max items allowed */
  maxItems?: number;
  /** Callback for image uploads */
  onImageUpload?: (file: File) => Promise<string>;
}

export function ArrayEditor({
  label,
  items,
  fields,
  onChange,
  newItemDefaults,
  addLabel = '+ Add Item',
  maxItems,
  onImageUpload,
}: ArrayEditorProps) {
  const handleFieldChange = useCallback((index: number, key: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value };
    onChange(updated);
  }, [items, onChange]);

  const handleRemove = useCallback((index: number) => {
    onChange(items.filter((_, i) => i !== index));
  }, [items, onChange]);

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    const updated = [...items];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange(updated);
  }, [items, onChange]);

  const handleMoveDown = useCallback((index: number) => {
    if (index >= items.length - 1) return;
    const updated = [...items];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onChange(updated);
  }, [items, onChange]);

  const handleAdd = useCallback(() => {
    if (maxItems && items.length >= maxItems) return;
    const defaults = newItemDefaults || Object.fromEntries(
      fields.map((f) => [f.key, f.defaultValue ?? (f.type === 'toggle' ? false : f.type === 'number' ? 0 : '')])
    );
    onChange([...items, defaults]);
  }, [items, fields, newItemDefaults, maxItems, onChange]);

  return (
    <div className="space-y-2">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      {items.map((item, i) => (
        <div key={i} className="space-y-1.5 border border-border rounded-md p-2 relative bg-muted/10">
          {/* Actions row */}
          <div className="flex items-center justify-end gap-0.5 -mt-0.5 -mr-0.5">
            <button
              className="h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-30"
              onClick={() => handleMoveUp(i)}
              disabled={i === 0}
              title="Move up"
              type="button"
            >
              <ChevronUp className="h-3 w-3" />
            </button>
            <button
              className="h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-30"
              onClick={() => handleMoveDown(i)}
              disabled={i === items.length - 1}
              title="Move down"
              type="button"
            >
              <ChevronDown className="h-3 w-3" />
            </button>
            <button
              className="h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              onClick={() => handleRemove(i)}
              title="Remove"
              type="button"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>

          {/* Fields */}
          {fields.map((field) => (
            <ArrayItemField
              key={field.key}
              field={field}
              value={item[field.key]}
              onChange={(v) => handleFieldChange(i, field.key, v)}
              onImageUpload={onImageUpload}
            />
          ))}
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="text-xs w-full gap-1"
        onClick={handleAdd}
        disabled={!!maxItems && items.length >= maxItems}
      >
        <Plus className="h-3 w-3" />
        {addLabel}
      </Button>
    </div>
  );
}

function ArrayItemField({
  field,
  value,
  onChange,
  onImageUpload,
}: {
  field: ArrayFieldDef;
  value: any;
  onChange: (v: any) => void;
  onImageUpload?: (file: File) => Promise<string>;
}) {
  switch (field.type) {
    case 'textarea':
      return (
        <div className="grid gap-0.5">
          <Label className="text-[9px] text-muted-foreground">{field.label}</Label>
          <Textarea
            className="text-xs min-h-[40px]"
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
            rows={field.rows || 2}
            placeholder={field.placeholder}
          />
        </div>
      );
    case 'number':
      return (
        <div className="grid gap-0.5">
          <Label className="text-[9px] text-muted-foreground">{field.label}</Label>
          <Input
            className="h-7 text-xs"
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            placeholder={field.placeholder}
          />
        </div>
      );
    case 'image':
      return (
        <ImageUploadField
          label={field.label}
          value={String(value ?? '')}
          onChange={onChange}
        />
      );
    case 'toggle':
      return (
        <div className="flex items-center justify-between">
          <Label className="text-[9px] text-muted-foreground">{field.label}</Label>
          <Switch checked={Boolean(value)} onCheckedChange={onChange} />
        </div>
      );
    default: // text
      return (
        <div className="grid gap-0.5">
          <Label className="text-[9px] text-muted-foreground">{field.label}</Label>
          <Input
            className="h-7 text-xs"
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
          />
        </div>
      );
  }
}
