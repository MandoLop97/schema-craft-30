import { useState, useRef, useEffect, useCallback } from 'react';
import { SchemaNode, NodeProps, NodeStyle, ANIMATION_PRESETS, AnimationPreset, GlobalStyleDef } from '@/types/schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Trash2, Copy, ChevronUp, ChevronDown, ShoppingBag, RotateCcw, Monitor, Tablet, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { t } from '@/lib/i18n';
import { getBlockDef, InspectorFieldDef } from '@/lib/block-registry';
import { ImageUploadField } from './ImageUploadField';
import { GradientEditor } from './GradientEditor';
import { ProductPicker } from './ProductPicker';
import { useThemeTokens } from '@/components/schema/ThemeContext';

interface InspectorProps {
  node: SchemaNode;
  onUpdateProps: (props: Partial<NodeProps>) => void;
  onUpdateStyle: (style: Partial<NodeStyle>) => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  onImageUpload?: (file: File) => Promise<string>;
  onUpdateCustomCSS?: (css: string) => void;
  device?: 'desktop' | 'tablet' | 'mobile';
  globalStyles?: Record<string, GlobalStyleDef>;
  onUpdateAppliedGlobalStyles?: (ids: string[]) => void;
}

function PropField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="grid gap-1">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input className="h-8 text-xs transition-shadow duration-200 focus:ring-2 focus:ring-primary/20" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function parseCssValue(raw: string): { num: number; unit: string } | null {
  if (!raw) return null;
  const match = raw.trim().match(/^(-?[\d.]+)\s*(px|rem|em|%|vh|vw|vmin|vmax|ch|ex|s|ms|deg)?$/i);
  if (!match) return null;
  return { num: parseFloat(match[1]), unit: match[2] || '' };
}

const UNIT_STEPS: Record<string, number> = {
  px: 1, rem: 0.125, em: 0.125, '%': 1, vh: 1, vw: 1, s: 0.05, ms: 50, deg: 5, '': 0.1,
};

const UNIT_RANGES: Record<string, { min: number; max: number }> = {
  px: { min: 0, max: 200 }, rem: { min: 0, max: 20 }, em: { min: 0, max: 20 },
  '%': { min: 0, max: 100 }, vh: { min: 0, max: 100 }, vw: { min: 0, max: 100 },
  s: { min: 0, max: 5 }, ms: { min: 0, max: 5000 }, deg: { min: 0, max: 360 }, '': { min: 0, max: 10 },
};

function NumericStyleField({ label, value, onChange, placeholder, allowNegative = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; allowNegative?: boolean;
}) {
  const [localValue, setLocalValue] = useState(value);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => { setLocalValue(value); }, [value]);
  const parsed = parseCssValue(localValue);
  const step = parsed ? (UNIT_STEPS[parsed.unit] ?? 1) : 1;
  const range = parsed ? (UNIT_RANGES[parsed.unit] ?? { min: 0, max: 100 }) : { min: 0, max: 100 };
  const effectiveMin = allowNegative ? -range.max : range.min;
  const increment = useCallback((delta: number) => {
    const p = parseCssValue(localValue);
    if (!p) return;
    const newNum = Math.round((p.num + delta * step) * 1000) / 1000;
    const clamped = Math.max(effectiveMin, Math.min(range.max, newNum));
    const newVal = `${clamped}${p.unit}`;
    setLocalValue(newVal);
    onChange(newVal);
  }, [localValue, step, range, effectiveMin, onChange]);
  const startHold = (delta: number) => { increment(delta); intervalRef.current = setInterval(() => increment(delta), 120); };
  const stopHold = () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
  const handleSliderChange = ([v]: number[]) => {
    const p = parseCssValue(localValue);
    const unit = p?.unit || 'px';
    const rounded = Math.round(v * 1000) / 1000;
    const newVal = `${rounded}${unit}`;
    setLocalValue(newVal);
    onChange(newVal);
  };
  const handleInputCommit = () => { onChange(localValue); };
  return (
    <div className="grid gap-1">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-1">
        <Input className="h-8 text-xs flex-1 font-mono transition-shadow duration-200 focus:ring-2 focus:ring-primary/20" value={localValue}
          onChange={(e) => setLocalValue(e.target.value)} onBlur={handleInputCommit}
          onKeyDown={(e) => { if (e.key === 'Enter') handleInputCommit(); if (e.key === 'ArrowUp') { e.preventDefault(); increment(1); } if (e.key === 'ArrowDown') { e.preventDefault(); increment(-1); } }}
          placeholder={placeholder} />
        <div className="flex flex-col">
          <button className="h-4 w-5 flex items-center justify-center rounded-t border border-border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            onMouseDown={() => startHold(1)} onMouseUp={stopHold} onMouseLeave={stopHold} title="Increment" type="button"><ChevronUp className="h-2.5 w-2.5" /></button>
          <button className="h-4 w-5 flex items-center justify-center rounded-b border border-t-0 border-border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            onMouseDown={() => startHold(-1)} onMouseUp={stopHold} onMouseLeave={stopHold} title="Decrement" type="button"><ChevronDown className="h-2.5 w-2.5" /></button>
        </div>
      </div>
      {parsed && <Slider min={effectiveMin} max={range.max} step={step} value={[parsed.num]} onValueChange={handleSliderChange} className="mt-0.5" />}
    </div>
  );
}

const PRESET_COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#1e293b',
  '#fef2f2', '#fefce8', '#f0fdf4', '#eff6ff', '#faf5ff', '#fdf2f8',
];

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setLocalValue(value); }, [value]);
  const handleCommit = (v: string) => { setLocalValue(v); onChange(v); };
  const displayColor = localValue && !localValue.includes('var(') ? localValue : '#ffffff';
  return (
    <div className="grid gap-1">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="flex gap-1.5 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <button className="h-8 w-8 rounded-md border border-border shrink-0 cursor-pointer transition-shadow hover:ring-2 hover:ring-primary/20" style={{ backgroundColor: displayColor }} title="Pick color" />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" side="left" align="start">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input ref={inputRef} type="color" value={displayColor} onChange={(e) => handleCommit(e.target.value)} className="h-8 w-8 rounded cursor-pointer border-0 p-0 bg-transparent" />
                <span className="text-xs text-muted-foreground">Custom</span>
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button key={c} className={`h-6 w-6 rounded-md border cursor-pointer transition-all hover:scale-110 ${localValue === c ? 'ring-2 ring-primary ring-offset-1' : 'border-border'}`}
                    style={{ backgroundColor: c }} onClick={() => handleCommit(c)} title={c} />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Input className="h-8 text-xs flex-1 font-mono transition-shadow duration-200 focus:ring-2 focus:ring-primary/20" value={localValue}
          onChange={(e) => setLocalValue(e.target.value)} onBlur={() => onChange(localValue)} onKeyDown={(e) => { if (e.key === 'Enter') onChange(localValue); }}
          placeholder="#hex, rgb(), hsl()" />
      </div>
    </div>
  );
}

function ToggleField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

function SliderField({ label, value, onChange, min = 0, max = 100, step = 1 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <div className="grid gap-1">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <Slider min={min} max={max} step={step} value={[value]} onValueChange={([v]) => onChange(v)} className="flex-1" />
        <span className="text-[10px] font-mono text-muted-foreground w-10 text-right">{value}</span>
      </div>
    </div>
  );
}

function TextareaField({ label, value, onChange, rows = 3, placeholder }: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <div className="grid gap-1">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Textarea className="text-xs min-h-[60px] transition-shadow duration-200 focus:ring-2 focus:ring-primary/20" value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} />
    </div>
  );
}

function LinkField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const isValid = !value || /^(https?:\/\/|\/|#|mailto:)/.test(value);
  return (
    <div className="grid gap-1">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input className={`h-8 text-xs font-mono transition-shadow duration-200 focus:ring-2 focus:ring-primary/20 ${!isValid ? 'border-destructive' : ''}`}
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || 'https://...'} />
      {!isValid && <p className="text-[9px] text-destructive">URL inválida</p>}
    </div>
  );
}

function InspectorFieldRenderer({ field, value, onChange, onImageUpload }: {
  field: InspectorFieldDef; value: any; onChange: (v: any) => void; onImageUpload?: (file: File) => Promise<string>;
}) {
  switch (field.type) {
    case 'color': return <ColorField label={field.label} value={String(value ?? '')} onChange={onChange} />;
    case 'select': return (
      <div className="grid gap-1">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{field.label}</Label>
        <Select value={String(value ?? '')} onValueChange={onChange}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{field.options?.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}</SelectContent>
        </Select>
      </div>
    );
    case 'number': return <PropField label={field.label} value={String(value ?? '')} onChange={(v) => onChange(parseFloat(v) || 0)} />;
    case 'image': return <ImageUploadField label={field.label} value={String(value ?? '')} onChange={onChange} />;
    case 'toggle': return <ToggleField label={field.label} value={Boolean(value)} onChange={onChange} />;
    case 'slider': return <SliderField label={field.label} value={Number(value ?? field.min ?? 0)} onChange={onChange} min={field.min} max={field.max} step={field.step} />;
    case 'textarea': return <TextareaField label={field.label} value={String(value ?? '')} onChange={onChange} rows={field.rows} placeholder={field.placeholder} />;
    case 'link': return <LinkField label={field.label} value={String(value ?? '')} onChange={onChange} placeholder={field.placeholder} />;
    case 'group': return (
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center gap-1 w-full text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-1 hover:text-foreground transition-colors">
          <span>▸</span> {field.label}
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-2 space-y-2 border-l border-border ml-1">
          {field.children?.map((child) => (
            <InspectorFieldRenderer key={child.key} field={child} value={(value as any)?.[child.key] ?? ''} onChange={(v) => onChange({ ...(value || {}), [child.key]: v })} onImageUpload={onImageUpload} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
    default: return <PropField label={field.label} value={String(value ?? '')} onChange={onChange} placeholder={field.placeholder} />;
  }
}

/* ── Built-in prop editors ── */

function TextPropsEditor({ node, onUpdate }: { node: SchemaNode; onUpdate: (p: Partial<NodeProps>) => void }) {
  return (
    <>
      <PropField label="Text" value={node.props.text || ''} onChange={(v) => onUpdate({ text: v })} />
      <div className="grid gap-1">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Level</Label>
        <Select value={node.props.level || 'p'} onValueChange={(v) => onUpdate({ level: v as any })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span'].map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}</SelectContent>
        </Select>
      </div>
    </>
  );
}

function ButtonPropsEditor({ node, onUpdate }: { node: SchemaNode; onUpdate: (p: Partial<NodeProps>) => void }) {
  const linkValue = node.props.link || node.props.href || '';
  return (
    <>
      <PropField label="Text" value={node.props.text || ''} onChange={(v) => onUpdate({ text: v })} />
      <div className="grid gap-1">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Variant</Label>
        <Select value={node.props.variant || 'default'} onValueChange={(v) => onUpdate({ variant: v })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{['default', 'outline', 'secondary', 'ghost', 'link'].map((v) => (<SelectItem key={v} value={v}>{v}</SelectItem>))}</SelectContent>
        </Select>
      </div>
      <PropField label="Link (href)" value={linkValue} onChange={(v) => onUpdate({ href: v, link: v })} />
    </>
  );
}

function ImagePropsEditor({ node, onUpdate }: { node: SchemaNode; onUpdate: (p: Partial<NodeProps>) => void }) {
  return (
    <>
      <ImageUploadField label="Image URL" value={node.props.src || ''} onChange={(v) => onUpdate({ src: v })} />
      <PropField label="Alt Text" value={node.props.alt || ''} onChange={(v) => onUpdate({ alt: v })} />
    </>
  );
}

function LinksEditor({ links, onChange }: { links: { text: string; href: string }[]; onChange: (links: { text: string; href: string }[]) => void }) {
  return (
    <>
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Links</Label>
      {links.map((link, i) => (
        <div key={i} className="flex gap-1 items-start">
          <div className="grid grid-cols-2 gap-1 flex-1">
            <Input className="h-7 text-xs" placeholder="Text" value={link.text} onChange={(e) => {
              const updated = [...links]; updated[i] = { ...link, text: e.target.value }; onChange(updated);
            }} />
            <Input className="h-7 text-xs" placeholder="Href" value={link.href} onChange={(e) => {
              const updated = [...links]; updated[i] = { ...link, href: e.target.value }; onChange(updated);
            }} />
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => {
            onChange(links.filter((_, idx) => idx !== i));
          }}><Trash2 className="h-3 w-3" /></Button>
        </div>
      ))}
      <Button variant="outline" size="sm" className="text-xs w-full" onClick={() => onChange([...links, { text: 'Link', href: '#' }])}>+ Add Link</Button>
    </>
  );
}

function NavbarPropsEditor({ node, onUpdate }: { node: SchemaNode; onUpdate: (p: Partial<NodeProps>) => void }) {
  return (
    <>
      <PropField label="Logo Text" value={node.props.logoText || ''} onChange={(v) => onUpdate({ logoText: v })} />
      <LinksEditor links={node.props.links || []} onChange={(links) => onUpdate({ links })} />
      <Separator className="my-3" />
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Menú Móvil</Label>
      <div className="space-y-1">
        <Label className="text-xs">Estilo del menú móvil</Label>
        <Select value={node.props.mobileMenuStyle || 'sidebar'} onValueChange={(v) => onUpdate({ mobileMenuStyle: v })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="sidebar">Lateral (Sidebar)</SelectItem>
            <SelectItem value="dropdown">Desplegable (Dropdown)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Separator className="my-3" />
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Banner de anuncio</Label>
      <PropField label="Texto del banner" value={node.props.announcementText || ''} onChange={(v) => onUpdate({ announcementText: v })} placeholder="Ej: Free shipping on orders over $100" />
      <PropField label="Link del banner" value={node.props.announcementHref || ''} onChange={(v) => onUpdate({ announcementHref: v })} placeholder="https://..." />
      <PropField label="Color de fondo" value={node.props.announcementBg || ''} onChange={(v) => onUpdate({ announcementBg: v })} placeholder="hsl(var(--foreground))" />
      <PropField label="Color de texto" value={node.props.announcementColor || ''} onChange={(v) => onUpdate({ announcementColor: v })} placeholder="hsl(var(--background))" />
    </>
  );
}

function FooterPropsEditor({ node, onUpdate }: { node: SchemaNode; onUpdate: (p: Partial<NodeProps>) => void }) {
  return (
    <>
      <PropField label="Logo Text" value={node.props.logoText || ''} onChange={(v) => onUpdate({ logoText: v })} />
      <PropField label="Copyright" value={node.props.copyright || ''} onChange={(v) => onUpdate({ copyright: v })} />
      <LinksEditor links={node.props.links || []} onChange={(links) => onUpdate({ links })} />
    </>
  );
}

function AnnouncementBarPropsEditor({ node, onUpdate }: { node: SchemaNode; onUpdate: (p: Partial<NodeProps>) => void }) {
  return (
    <>
      <PropField label="Text" value={node.props.text || ''} onChange={(v) => onUpdate({ text: v })} />
      <PropField label="Link (href)" value={node.props.href || ''} onChange={(v) => onUpdate({ href: v })} />
    </>
  );
}

function FeatureBarPropsEditor({ node, onUpdate }: { node: SchemaNode; onUpdate: (p: Partial<NodeProps>) => void }) {
  const items = node.props.items || [];
  return (
    <>
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Features</Label>
      {items.map((item, i) => (
        <div key={i} className="space-y-1 border rounded-md p-2 relative">
          <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-5 w-5 text-muted-foreground hover:text-destructive" onClick={() => {
            onUpdate({ items: items.filter((_, idx) => idx !== i) });
          }}><Trash2 className="h-3 w-3" /></Button>
          <Input className="h-7 text-xs" placeholder="Icon" value={item.icon || ''} onChange={(e) => { const updated = [...items]; updated[i] = { ...item, icon: e.target.value }; onUpdate({ items: updated }); }} />
          <Input className="h-7 text-xs" placeholder="Title" value={item.title} onChange={(e) => { const updated = [...items]; updated[i] = { ...item, title: e.target.value }; onUpdate({ items: updated }); }} />
          <Input className="h-7 text-xs" placeholder="Description" value={item.description} onChange={(e) => { const updated = [...items]; updated[i] = { ...item, description: e.target.value }; onUpdate({ items: updated }); }} />
        </div>
      ))}
      <Button variant="outline" size="sm" className="text-xs w-full" onClick={() => onUpdate({ items: [...items, { icon: 'star', title: 'Feature', description: 'Description' }] })}>+ Add Feature</Button>
    </>
  );
}

function HeroSectionPropsEditor({ node, onUpdate }: { node: SchemaNode; onUpdate: (p: Partial<NodeProps>) => void }) {
  const heading = node.props.heading || node.props.text || '';
  const ctaLink = node.props.ctaLink || node.props.ctaHref || '';
  const bgImage = node.props.src || node.props.image || '';
  return (
    <>
      <PropField label="Heading" value={heading} onChange={(v) => onUpdate({ heading: v, text: v })} />
      <PropField label="Subtitle" value={node.props.subtitle || ''} onChange={(v) => onUpdate({ subtitle: v })} />
      <PropField label="Overlay Text" value={node.props.overlayText || ''} onChange={(v) => onUpdate({ overlayText: v })} />
      <PropField label="CTA Text" value={node.props.ctaText || ''} onChange={(v) => onUpdate({ ctaText: v })} />
      <PropField label="CTA Link" value={ctaLink} onChange={(v) => onUpdate({ ctaLink: v, ctaHref: v })} />
      <PropField label="Secondary CTA Text" value={node.props.secondaryCtaText || ''} onChange={(v) => onUpdate({ secondaryCtaText: v })} />
      <PropField label="Secondary CTA Link" value={node.props.secondaryCtaLink || ''} onChange={(v) => onUpdate({ secondaryCtaLink: v })} />
      <Separator className="my-2" />
      <ImageUploadField label="Background Image" value={bgImage} onChange={(v) => onUpdate({ src: v, image: v })} />
      <div className="grid gap-1">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Overlay Opacity</Label>
        <div className="flex items-center gap-2">
          <Slider min={0} max={1} step={0.05} value={[parseFloat(node.props.overlayOpacity || '0.55')]} onValueChange={([v]) => onUpdate({ overlayOpacity: String(v) })} className="flex-1" />
          <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{parseFloat(node.props.overlayOpacity || '0.55').toFixed(2)}</span>
        </div>
      </div>
    </>
  );
}

function TestimonialPropsEditor({ node, onUpdate }: { node: SchemaNode; onUpdate: (p: Partial<NodeProps>) => void }) {
  const quote = node.props.quote || node.props.text || '';
  const author = node.props.author || node.props.label || '';
  const stars = String(node.props.stars ?? node.props.variant ?? '5');
  return (
    <>
      <PropField label="Quote" value={quote} onChange={(v) => onUpdate({ quote: v, text: v })} />
      <PropField label="Author" value={author} onChange={(v) => onUpdate({ author: v, label: v })} />
      <PropField label="Stars (1-5)" value={stars} onChange={(v) => onUpdate({ stars: parseInt(v) || 5, variant: v })} />
    </>
  );
}

function NewsletterPropsEditor({ node, onUpdate }: { node: SchemaNode; onUpdate: (p: Partial<NodeProps>) => void }) {
  const heading = node.props.heading || node.props.text || '';
  const subtitle = node.props.subtitle || node.props.label || '';
  return (
    <>
      <PropField label="Heading" value={heading} onChange={(v) => onUpdate({ heading: v, text: v })} />
      <PropField label="Subtext" value={subtitle} onChange={(v) => onUpdate({ subtitle: v, label: v })} />
      <PropField label="Placeholder" value={node.props.placeholder || ''} onChange={(v) => onUpdate({ placeholder: v })} />
    </>
  );
}

function PanelsPropsEditor({ node, onUpdate }: { node: SchemaNode; onUpdate: (p: Partial<NodeProps>) => void }) {
  const panels = node.props.panels || [];
  return (
    <>
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Panels</Label>
      {panels.map((panel, i) => (
        <div key={i} className="space-y-1 border rounded-md p-2 relative">
          <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-5 w-5 text-muted-foreground hover:text-destructive" onClick={() => {
            onUpdate({ panels: panels.filter((_, idx) => idx !== i) });
          }}><Trash2 className="h-3 w-3" /></Button>
          <Input className="h-7 text-xs" placeholder="Title" value={panel.title} onChange={(e) => { const updated = [...panels]; updated[i] = { ...panel, title: e.target.value }; onUpdate({ panels: updated }); }} />
          <Input className="h-7 text-xs" placeholder="Content" value={panel.description} onChange={(e) => { const updated = [...panels]; updated[i] = { ...panel, description: e.target.value }; onUpdate({ panels: updated }); }} />
        </div>
      ))}
      <Button variant="outline" size="sm" className="text-xs w-full" onClick={() => onUpdate({ panels: [...panels, { title: 'New Panel', description: 'Panel content' }] })}>+ Add Panel</Button>
    </>
  );
}

function VideoEmbedPropsEditor({ node, onUpdate }: { node: SchemaNode; onUpdate: (p: Partial<NodeProps>) => void }) {
  return (
    <>
      <PropField label="Video URL" value={node.props.videoUrl || ''} onChange={(v) => onUpdate({ videoUrl: v })} />
      <PropField label="Alt Text" value={node.props.alt || ''} onChange={(v) => onUpdate({ alt: v })} />
    </>
  );
}

function FormBlockPropsEditor({ node, onUpdate }: { node: SchemaNode; onUpdate: (p: Partial<NodeProps>) => void }) {
  const fields: any[] = node.props.formFields || [];
  return (
    <>
      <PropField label="Título del formulario" value={node.props.formTitle || ''} onChange={(v) => onUpdate({ formTitle: v })} />
      <Separator className="my-2" />
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Campos</Label>
      {fields.map((field: any, i: number) => (
        <div key={i} className="space-y-1 border rounded-md p-2 relative">
          <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-5 w-5 text-muted-foreground hover:text-destructive" onClick={() => {
            onUpdate({ formFields: fields.filter((_: any, idx: number) => idx !== i) });
          }}><Trash2 className="h-3 w-3" /></Button>
          <div className="grid grid-cols-2 gap-1">
            <Select value={field.type || 'text'} onValueChange={(v) => { const updated = [...fields]; updated[i] = { ...field, type: v }; onUpdate({ formFields: updated }); }}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Texto</SelectItem><SelectItem value="email">Email</SelectItem>
                <SelectItem value="tel">Teléfono</SelectItem><SelectItem value="textarea">Área de texto</SelectItem>
                <SelectItem value="select">Selector</SelectItem>
              </SelectContent>
            </Select>
            <Input className="h-7 text-xs" placeholder="Label" value={field.label || ''} onChange={(e) => { const updated = [...fields]; updated[i] = { ...field, label: e.target.value }; onUpdate({ formFields: updated }); }} />
          </div>
          <Input className="h-7 text-xs" placeholder="Placeholder" value={field.placeholder || ''} onChange={(e) => { const updated = [...fields]; updated[i] = { ...field, placeholder: e.target.value }; onUpdate({ formFields: updated }); }} />
          {field.type === 'select' && (
            <Input className="h-7 text-xs" placeholder="Opciones (separadas por coma)" value={field.options || ''} onChange={(e) => { const updated = [...fields]; updated[i] = { ...field, options: e.target.value }; onUpdate({ formFields: updated }); }} />
          )}
          <div className="flex items-center gap-2">
            <Switch checked={field.required !== false} onCheckedChange={(v) => { const updated = [...fields]; updated[i] = { ...field, required: v }; onUpdate({ formFields: updated }); }} />
            <span className="text-[10px] text-muted-foreground">Requerido</span>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" className="text-xs w-full" onClick={() => onUpdate({ formFields: [...fields, { type: 'text', label: 'Nuevo campo', placeholder: '', required: false }] })}>+ Agregar Campo</Button>
      <Separator className="my-2" />
      <PropField label="Texto del botón" value={node.props.formBtnText || 'Enviar'} onChange={(v) => onUpdate({ formBtnText: v })} />
      <div className="grid gap-1">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Estilo del botón</Label>
        <Select value={node.props.formBtnVariant || 'filled'} onValueChange={(v) => onUpdate({ formBtnVariant: v })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="filled">Relleno</SelectItem><SelectItem value="outline">Contorno</SelectItem></SelectContent>
        </Select>
      </div>
    </>
  );
}

/** Card layout selector with inherited vs custom indicator */
function CardLayoutField({ value, onChange }: { value?: string; onChange: (v: string | undefined) => void }) {
  const themeTokens = useThemeTokens();
  const themeDefault = themeTokens?.defaultCardLayout || 'vertical';
  const isCustom = !!value;
  const effectiveValue = value || themeDefault;
  return (
    <div className="grid gap-1">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Layout</Label>
        {isCustom ? (
          <button onClick={() => onChange(undefined)} className="flex items-center gap-1 text-[9px] text-primary hover:underline cursor-pointer" title="Volver al diseño del tema">
            <RotateCcw className="h-2.5 w-2.5" />Heredado
          </button>
        ) : (<span className="text-[9px] text-muted-foreground italic">Heredado del tema</span>)}
      </div>
      <Select value={effectiveValue} onValueChange={(v) => onChange(v)}>
        <SelectTrigger className={`h-8 text-xs ${!isCustom ? 'border-dashed' : ''}`}><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="vertical">Vertical</SelectItem><SelectItem value="horizontal">Horizontal</SelectItem>
          <SelectItem value="minimal">Minimal</SelectItem><SelectItem value="overlay">Overlay</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function ProductCardPropsEditor({ node, onUpdate }: { node: SchemaNode; onUpdate: (p: Partial<NodeProps>) => void }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const p = node.props;
  return (
    <>
      <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-8" onClick={() => setPickerOpen(true)}>
        <ShoppingBag className="h-3.5 w-3.5" />Seleccionar Producto
      </Button>
      <ProductPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(product) => {
        onUpdate({ name: product.name, text: product.name, price: `$${product.price.toFixed(2)}`, originalPrice: product.original_price ? `$${product.original_price.toFixed(2)}` : '', badge: product.badge || '', image: product.image_url, src: product.image_url, alt: product.name });
      }} />
      <Separator className="my-1" />
      <CardLayoutField value={p.cardLayout} onChange={(v) => onUpdate({ cardLayout: v })} />
      <div className="grid gap-1">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Image Ratio</Label>
        <Select value={p.imageRatio || '1/1'} onValueChange={(v) => onUpdate({ imageRatio: v })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1/1">1:1 Cuadrado</SelectItem><SelectItem value="4/3">4:3</SelectItem>
            <SelectItem value="3/4">3:4 Retrato</SelectItem><SelectItem value="16/9">16:9 Panorámico</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Separator className="my-1" />
      <ImageUploadField label="Imagen" value={p.image || p.src || ''} onChange={(v) => onUpdate({ src: v, image: v })} />
      <PropField label="Nombre" value={p.name || p.text || ''} onChange={(v) => onUpdate({ text: v, name: v })} />
      <PropField label="Precio" value={p.price || ''} onChange={(v) => onUpdate({ price: v })} />
      <PropField label="Precio Original" value={p.originalPrice || ''} onChange={(v) => onUpdate({ originalPrice: v })} />
      <PropField label="Badge" value={p.badge || ''} onChange={(v) => onUpdate({ badge: v })} />
      <Separator className="my-1" />
      <PropField label="Texto del Botón" value={p.ctaText || 'Add to Cart'} onChange={(v) => onUpdate({ ctaText: v })} />
      <div className="grid gap-1">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Estilo del Botón</Label>
        <Select value={p.btnVariant || 'outline'} onValueChange={(v) => onUpdate({ btnVariant: v })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="outline">Contorno</SelectItem><SelectItem value="filled">Relleno</SelectItem></SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Mostrar Botón</Label>
        <Switch checked={p.hideButton !== true} onCheckedChange={(v) => onUpdate({ hideButton: !v })} />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Mostrar Badge</Label>
        <Switch checked={p.showBadge !== false} onCheckedChange={(v) => onUpdate({ showBadge: v })} />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Mostrar Precio Original</Label>
        <Switch checked={p.showOriginalPrice !== false} onCheckedChange={(v) => onUpdate({ showOriginalPrice: v })} />
      </div>
    </>
  );
}

/* ── Props Tab ── */

function PositionAnchorControls({ node, onUpdateStyle }: { node: SchemaNode; onUpdateStyle: (s: Partial<NodeStyle>) => void }) {
  const pos = node.style.position;
  if (pos !== 'absolute' && pos !== 'fixed') return null;
  const anchors: { label: string; icon: string; style: Partial<NodeStyle> }[] = [
    { label: 'Top Left', icon: '↖', style: { top: '5%', left: '5%', right: '', bottom: '' } },
    { label: 'Top Center', icon: '↑', style: { top: '5%', left: '50%', right: '', bottom: '', transform: 'translateX(-50%)' } },
    { label: 'Top Right', icon: '↗', style: { top: '5%', right: '5%', left: '', bottom: '' } },
    { label: 'Center Left', icon: '←', style: { top: '50%', left: '5%', right: '', bottom: '', transform: 'translateY(-50%)' } },
    { label: 'Center', icon: '•', style: { top: '50%', left: '50%', right: '', bottom: '', transform: 'translate(-50%, -50%)' } },
    { label: 'Center Right', icon: '→', style: { top: '50%', right: '5%', left: '', bottom: '', transform: 'translateY(-50%)' } },
    { label: 'Bottom Left', icon: '↙', style: { bottom: '5%', left: '5%', right: '', top: '' } },
    { label: 'Bottom Center', icon: '↓', style: { bottom: '5%', left: '50%', right: '', top: '', transform: 'translateX(-50%)' } },
    { label: 'Bottom Right', icon: '↘', style: { bottom: '5%', right: '5%', left: '', top: '' } },
  ];
  return (
    <div className="space-y-2">
      <Separator className="my-2" />
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Posición Rápida</Label>
      <div className="grid grid-cols-3 gap-1">
        {anchors.map((a) => (
          <button key={a.label} className="h-7 rounded border border-border bg-muted/30 hover:bg-primary/10 hover:border-primary/30 text-xs font-medium transition-colors cursor-pointer"
            onClick={() => onUpdateStyle(a.style)} title={a.label}>{a.icon}</button>
        ))}
      </div>
      <NumericStyleField label="Top" value={node.style.top || ''} onChange={(v) => onUpdateStyle({ top: v || undefined })} placeholder="5%" allowNegative />
      <NumericStyleField label="Left" value={node.style.left || ''} onChange={(v) => onUpdateStyle({ left: v || undefined })} placeholder="5%" allowNegative />
      <NumericStyleField label="Right" value={node.style.right || ''} onChange={(v) => onUpdateStyle({ right: v || undefined })} placeholder="" allowNegative />
      <NumericStyleField label="Bottom" value={node.style.bottom || ''} onChange={(v) => onUpdateStyle({ bottom: v || undefined })} placeholder="" allowNegative />
      <NumericStyleField label="Z-Index" value={node.style.zIndex || ''} onChange={(v) => onUpdateStyle({ zIndex: v || undefined })} placeholder="1" />
    </div>
  );
}

/** Scroll Animation controls for PropsTab */
function ScrollAnimationControls({ node, onUpdate }: { node: SchemaNode; onUpdate: (p: Partial<NodeProps>) => void }) {
  return (
    <>
      <Separator className="my-2" />
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Animación al Scroll</Label>
      <div className="grid gap-1">
        <Select value={node.props.scrollAnimation || 'none'} onValueChange={(v) => onUpdate({ scrollAnimation: v as any })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Ninguna</SelectItem>
            <SelectItem value="fadeIn">Fade In</SelectItem>
            <SelectItem value="slideUp">Slide Up</SelectItem>
            <SelectItem value="slideLeft">Slide Left</SelectItem>
            <SelectItem value="slideRight">Slide Right</SelectItem>
            <SelectItem value="scaleIn">Scale In</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {node.props.scrollAnimation && node.props.scrollAnimation !== 'none' && (
        <>
          <PropField label="Delay" value={node.props.scrollAnimationDelay || '0s'} onChange={(v) => onUpdate({ scrollAnimationDelay: v })} placeholder="0s" />
          <PropField label="Duration" value={node.props.scrollAnimationDuration || '0.6s'} onChange={(v) => onUpdate({ scrollAnimationDuration: v })} placeholder="0.6s" />
        </>
      )}
    </>
  );
}

function PropsTab({ node, onUpdateProps, onUpdateStyle, onImageUpload }: { node: SchemaNode; onUpdateProps: (p: Partial<NodeProps>) => void; onUpdateStyle: (s: Partial<NodeStyle>) => void; onImageUpload?: (file: File) => Promise<string> }) {
  const p = node.props;
  return (
    <div className="space-y-3 p-3">
      {node.type === 'Text' && <TextPropsEditor node={node} onUpdate={onUpdateProps} />}
      {node.type === 'Button' && <ButtonPropsEditor node={node} onUpdate={onUpdateProps} />}
      {node.type === 'Image' && <ImagePropsEditor node={node} onUpdate={onUpdateProps} />}
      {node.type === 'Badge' && <PropField label="Text" value={p.text || ''} onChange={(v) => onUpdateProps({ text: v })} />}
      {node.type === 'Input' && <PropField label="Placeholder" value={p.placeholder || ''} onChange={(v) => onUpdateProps({ placeholder: v })} />}
      {node.type === 'Section' && (
        <>
          <div className="grid gap-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Display</Label>
            <Select value={node.style.display || 'block'} onValueChange={(v) => onUpdateStyle({ display: v as any })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{['block', 'flex', 'grid'].map((v) => (<SelectItem key={v} value={v}>{v}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Flex Direction</Label>
            <Select value={node.style.flexDirection || 'column'} onValueChange={(v) => onUpdateStyle?.({ flexDirection: v as any })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{['column', 'row', 'column-reverse', 'row-reverse'].map((v) => (<SelectItem key={v} value={v}>{v}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Align Items</Label>
            <Select value={node.style.alignItems || 'stretch'} onValueChange={(v) => onUpdateStyle?.({ alignItems: v as any })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{['stretch', 'flex-start', 'center', 'flex-end'].map((v) => (<SelectItem key={v} value={v}>{v}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Justify Content</Label>
            <Select value={node.style.justifyContent || 'flex-start'} onValueChange={(v) => onUpdateStyle?.({ justifyContent: v as any })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'].map((v) => (<SelectItem key={v} value={v}>{v}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <Separator className="my-2" />
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Parallax</Label>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Activar Parallax</Label>
            <Switch checked={!!p.parallaxEnabled} onCheckedChange={(v) => onUpdateProps({ parallaxEnabled: v })} />
          </div>
          {p.parallaxEnabled && (
            <div className="grid gap-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Velocidad (0.1 - 1.0)</Label>
              <div className="flex items-center gap-2">
                <Slider min={0.1} max={1} step={0.05} value={[parseFloat(p.parallaxSpeed || '0.5')]} onValueChange={([v]) => onUpdateProps({ parallaxSpeed: String(v) })} className="flex-1" />
                <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{parseFloat(p.parallaxSpeed || '0.5').toFixed(2)}</span>
              </div>
            </div>
          )}
        </>
      )}
      {node.type === 'Container' && (
        <>
          <PropField label="Max Width" value={p.text || '72rem'} onChange={(v) => onUpdateProps({ text: v })} />
          <div className="grid gap-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Display</Label>
            <Select value={node.style.display || 'block'} onValueChange={(v) => onUpdateStyle?.({ display: v as any })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{['block', 'flex', 'grid'].map((v) => (<SelectItem key={v} value={v}>{v}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          {(node.style.display === 'flex' || node.style.display === 'grid') && (
            <>
              <div className="grid gap-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Flex Direction</Label>
                <Select value={node.style.flexDirection || 'column'} onValueChange={(v) => onUpdateStyle?.({ flexDirection: v as any })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{['column', 'row', 'column-reverse', 'row-reverse'].map((v) => (<SelectItem key={v} value={v}>{v}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Align Items</Label>
                <Select value={node.style.alignItems || 'stretch'} onValueChange={(v) => onUpdateStyle?.({ alignItems: v as any })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{['stretch', 'flex-start', 'center', 'flex-end'].map((v) => (<SelectItem key={v} value={v}>{v}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Justify Content</Label>
                <Select value={node.style.justifyContent || 'flex-start'} onValueChange={(v) => onUpdateStyle?.({ justifyContent: v as any })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'].map((v) => (<SelectItem key={v} value={v}>{v}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </>
          )}
        </>
      )}
      {node.type === 'Grid' && <PropField label="Columns" value={String(p.columns || 3)} onChange={(v) => onUpdateProps({ columns: parseInt(v) || 3 })} />}
      {node.type === 'Stack' && (
        <>
          <div className="grid gap-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Direction</Label>
            <Select value={p.direction || 'vertical'} onValueChange={(v) => onUpdateProps({ direction: v as any })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="vertical">Vertical</SelectItem><SelectItem value="horizontal">Horizontal</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Align Items</Label>
            <Select value={node.style.alignItems || 'stretch'} onValueChange={(v) => onUpdateStyle?.({ alignItems: v as any })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{['stretch', 'flex-start', 'center', 'flex-end'].map((v) => (<SelectItem key={v} value={v}>{v}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Justify Content</Label>
            <Select value={node.style.justifyContent || 'flex-start'} onValueChange={(v) => onUpdateStyle?.({ justifyContent: v as any })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'].map((v) => (<SelectItem key={v} value={v}>{v}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </>
      )}
      {node.type === 'ProductCard' && <ProductCardPropsEditor node={node} onUpdate={onUpdateProps} />}
      {node.type === 'Card' && (
        <>{(p.items || []).map((item, i) => (
          <div key={i} className="space-y-1 border rounded-md p-2">
            <Input className="h-7 text-xs" placeholder="Title" value={item.title} onChange={(e) => { const updated = [...(p.items || [])]; updated[i] = { ...item, title: e.target.value }; onUpdateProps({ items: updated }); }} />
            <Input className="h-7 text-xs" placeholder="Description" value={item.description} onChange={(e) => { const updated = [...(p.items || [])]; updated[i] = { ...item, description: e.target.value }; onUpdateProps({ items: updated }); }} />
          </div>
        ))}</>
      )}
      {node.type === 'Navbar' && <NavbarPropsEditor node={node} onUpdate={onUpdateProps} />}
      {node.type === 'Footer' && <FooterPropsEditor node={node} onUpdate={onUpdateProps} />}
      {node.type === 'AnnouncementBar' && <AnnouncementBarPropsEditor node={node} onUpdate={onUpdateProps} />}
      {node.type === 'FeatureBar' && <FeatureBarPropsEditor node={node} onUpdate={onUpdateProps} />}
      {node.type === 'TestimonialCard' && <TestimonialPropsEditor node={node} onUpdate={onUpdateProps} />}
      {node.type === 'NewsletterSection' && <NewsletterPropsEditor node={node} onUpdate={onUpdateProps} />}
      {node.type === 'HeroSection' && <HeroSectionPropsEditor node={node} onUpdate={onUpdateProps} />}
      {(node.type === 'Accordion' || node.type === 'TabsBlock') && <PanelsPropsEditor node={node} onUpdate={onUpdateProps} />}
      {node.type === 'VideoEmbed' && <VideoEmbedPropsEditor node={node} onUpdate={onUpdateProps} />}
      {node.type === 'FormBlock' && <FormBlockPropsEditor node={node} onUpdate={onUpdateProps} />}
      {node.type === 'Spacer' && <PropField label="Altura" value={p.height || '2rem'} onChange={(v) => onUpdateProps({ height: v })} placeholder="2rem" />}
      {node.type === 'Icon' && (
        <>
          <PropField label="Nombre del ícono (Lucide)" value={p.iconName || 'Star'} onChange={(v) => onUpdateProps({ iconName: v })} placeholder="Star, Heart, ShoppingBag..." />
          <PropField label="Tamaño (px)" value={p.iconSize || '24'} onChange={(v) => onUpdateProps({ iconSize: v })} />
          <ColorField label="Color" value={p.iconColor || 'currentColor'} onChange={(v) => onUpdateProps({ iconColor: v })} />
        </>
      )}
      {node.type === 'SocialIcons' && (
        <>
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Redes Sociales</Label>
          {(p.socialItems || []).map((item: any, i: number) => (
            <div key={i} className="flex gap-1 items-start">
              <div className="grid grid-cols-2 gap-1 flex-1">
                <Select value={item.platform} onValueChange={(v) => { const updated = [...(p.socialItems || [])]; updated[i] = { ...item, platform: v }; onUpdateProps({ socialItems: updated }); }}>
                  <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{['facebook', 'instagram', 'twitter', 'youtube', 'linkedin', 'github', 'tiktok'].map((pl) => (<SelectItem key={pl} value={pl}>{pl}</SelectItem>))}</SelectContent>
                </Select>
                <Input className="h-7 text-xs" placeholder="URL" value={item.url || ''} onChange={(e) => { const updated = [...(p.socialItems || [])]; updated[i] = { ...item, url: e.target.value }; onUpdateProps({ socialItems: updated }); }} />
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => {
                onUpdateProps({ socialItems: (p.socialItems || []).filter((_: any, idx: number) => idx !== i) });
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="text-xs w-full" onClick={() => onUpdateProps({ socialItems: [...(p.socialItems || []), { platform: 'facebook', url: '' }] })}>+ Agregar Red</Button>
          <Separator className="my-2" />
          <PropField label="Tamaño ícono (px)" value={p.socialIconSize || '20'} onChange={(v) => onUpdateProps({ socialIconSize: v })} />
          <div className="grid gap-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Estilo</Label>
            <Select value={p.socialStyle || 'default'} onValueChange={(v) => onUpdateProps({ socialStyle: v })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Simple</SelectItem><SelectItem value="colored">Color de marca</SelectItem><SelectItem value="rounded">Redondeado + Color</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
      {/* Custom inspector fields */}
      {(() => {
        const def = getBlockDef(node.type);
        if (def?.inspectorFields && def.inspectorFields.length > 0) {
          return def.inspectorFields.map((field) => (
            <InspectorFieldRenderer key={field.key} field={field} value={(p as any)[field.key] ?? field.defaultValue ?? ''} onChange={(v) => onUpdateProps({ [field.key]: v })} onImageUpload={onImageUpload} />
          ));
        }
        return null;
      })()}

      {/* Scroll Animation */}
      <ScrollAnimationControls node={node} onUpdate={onUpdateProps} />

      {/* Quick positioning for absolute/fixed nodes */}
      <PositionAnchorControls node={node} onUpdateStyle={onUpdateStyle} />
    </div>
  );
}

/* ── Style Tab with State Tabs + Responsive Editing ── */

const COLOR_KEYS: (keyof NodeStyle)[] = ['color', 'backgroundColor', 'borderColor', 'outlineColor'];

const NUMERIC_KEYS: (keyof NodeStyle)[] = [
  'padding', 'margin', 'gap', 'width', 'height', 'minHeight', 'minWidth', 'maxWidth', 'maxHeight',
  'fontSize', 'lineHeight', 'letterSpacing', 'wordSpacing', 'borderWidth', 'borderRadius',
  'outlineOffset', 'outlineWidth', 'top', 'right', 'bottom', 'left',
  'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius',
  'perspective', 'transitionDuration', 'transitionDelay', 'animationDuration', 'animationDelay',
];

type StyleState = 'normal' | 'hover' | 'focus' | 'active';

const DEVICE_TO_BP: Record<string, string | null> = {
  desktop: null,
  tablet: 'md',
  mobile: 'sm',
};

/** Responsive field wrapper — shows device icons and blue dot for overrides */
function ResponsiveFieldWrapper({ device, node, styleKey, children }: {
  device: string;
  node: SchemaNode;
  styleKey: keyof NodeStyle;
  children: React.ReactNode;
}) {
  const bp = DEVICE_TO_BP[device];
  const hasOverride = bp && node.style.responsive?.[bp as keyof NodeStyle['responsive']]?.[styleKey as any];

  return (
    <div className="relative">
      {hasOverride && (
        <span
          className="absolute -left-2.5 top-2.5 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
          title={`Override para ${device}`}
        />
      )}
      {children}
    </div>
  );
}

function CollapsibleStyleGroup({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-1.5 group">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">{title}</p>
        <span className="text-[10px] text-muted-foreground">▾</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-2 pb-2">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/** Global Styles selector for a node */
function GlobalStylesSelector({ node, globalStyles, onUpdate }: {
  node: SchemaNode;
  globalStyles?: Record<string, GlobalStyleDef>;
  onUpdate: (ids: string[]) => void;
}) {
  if (!globalStyles || Object.keys(globalStyles).length === 0) return null;
  const applied = node.appliedGlobalStyles || [];
  return (
    <CollapsibleStyleGroup title="Estilos Globales" defaultOpen={false}>
      <p className="text-[9px] text-muted-foreground mb-1">Clases reutilizables aplicadas a este nodo</p>
      <div className="space-y-1">
        {Object.entries(globalStyles).map(([id, def]) => {
          const isApplied = applied.includes(id);
          return (
            <div key={id} className="flex items-center gap-2">
              <Switch
                checked={isApplied}
                onCheckedChange={(checked) => {
                  if (checked) onUpdate([...applied, id]);
                  else onUpdate(applied.filter((a) => a !== id));
                }}
              />
              <span className={`text-xs ${isApplied ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{def.label}</span>
            </div>
          );
        })}
      </div>
    </CollapsibleStyleGroup>
  );
}

function StyleTab({ node, onUpdateStyle, onUpdateCustomCSS, device = 'desktop', globalStyles, onUpdateAppliedGlobalStyles }: {
  node: SchemaNode;
  onUpdateStyle: (s: Partial<NodeStyle>) => void;
  onUpdateCustomCSS?: (css: string) => void;
  device?: string;
  globalStyles?: Record<string, GlobalStyleDef>;
  onUpdateAppliedGlobalStyles?: (ids: string[]) => void;
}) {
  const locale = t();
  const [activeState, setActiveState] = useState<StyleState>('normal');

  // Determine current style object based on state + device
  const bp = DEVICE_TO_BP[device];
  
  const getStyleValue = (key: keyof NodeStyle): string => {
    const st = node.style;
    if (activeState !== 'normal') {
      const stateObj = st[activeState] as Partial<NodeStyle> | undefined;
      return (stateObj as any)?.[key] || '';
    }
    if (bp) {
      const responsive = st.responsive?.[bp as keyof NodeStyle['responsive']] as Partial<NodeStyle> | undefined;
      return (responsive as any)?.[key] || (st as any)[key] || '';
    }
    return (st as any)[key] || '';
  };

  const setStyleValue = (key: keyof NodeStyle, value: string | undefined) => {
    if (activeState !== 'normal') {
      // Write to state sub-object (hover/focus/active)
      const currentState = (node.style[activeState] || {}) as Partial<NodeStyle>;
      onUpdateStyle({
        [activeState]: { ...currentState, [key]: value || undefined },
      });
      return;
    }
    if (bp) {
      // Write to responsive sub-object
      const currentResponsive = node.style.responsive || {};
      const currentBp = (currentResponsive as any)[bp] || {};
      onUpdateStyle({
        responsive: {
          ...currentResponsive,
          [bp]: { ...currentBp, [key]: value || undefined },
        },
      });
      return;
    }
    onUpdateStyle({ [key]: value || undefined });
  };

  const renderField = (label: string, key: keyof NodeStyle, placeholder?: string) => {
    const val = getStyleValue(key);
    const setter = (v: string) => setStyleValue(key, v || undefined);
    const field = COLOR_KEYS.includes(key)
      ? <ColorField key={key} label={label} value={val} onChange={setter} />
      : NUMERIC_KEYS.includes(key)
        ? <NumericStyleField key={key} label={label} value={val} onChange={setter} placeholder={placeholder} allowNegative={['margin', 'top', 'right', 'bottom', 'left', 'letterSpacing'].includes(key)} />
        : <PropField key={key} label={label} value={val} onChange={setter} placeholder={placeholder} />;
    
    return (
      <ResponsiveFieldWrapper key={key} device={device} node={node} styleKey={key}>
        {field}
      </ResponsiveFieldWrapper>
    );
  };

  const renderSelect = (label: string, key: keyof NodeStyle, options: string[]) => {
    const val = getStyleValue(key);
    return (
      <ResponsiveFieldWrapper key={key} device={device} node={node} styleKey={key}>
        <div className="grid gap-1">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Label>
          <Select value={val || '__none__'} onValueChange={(v) => setStyleValue(key, v === '__none__' ? undefined : v)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">—</SelectItem>
              {options.map((o) => (<SelectItem key={o} value={o}>{o}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </ResponsiveFieldWrapper>
    );
  };

  return (
    <div className="p-3 space-y-1">
      {/* Device indicator */}
      <div className="flex items-center justify-between mb-2 px-1 py-1 rounded-md" style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}>
        <div className="flex items-center gap-1">
          {device === 'desktop' && <Monitor className="h-3 w-3 text-primary" />}
          {device === 'tablet' && <Tablet className="h-3 w-3 text-primary" />}
          {device === 'mobile' && <Smartphone className="h-3 w-3 text-primary" />}
          <span className="text-[9px] font-medium text-muted-foreground uppercase">{device}</span>
          {bp && <span className="text-[8px] font-mono text-primary ml-1">@{bp}</span>}
        </div>
        {bp && <span className="text-[8px] text-muted-foreground italic">Override responsivo</span>}
      </div>

      {/* State Tabs: Normal / Hover / Focus / Active */}
      <div className="flex gap-0.5 mb-3 p-0.5 rounded-md" style={{ backgroundColor: 'hsl(var(--muted) / 0.4)' }}>
        {(['normal', 'hover', 'focus', 'active'] as StyleState[]).map((state) => {
          const isActive = activeState === state;
          const hasValues = state !== 'normal' && node.style[state] && Object.keys(node.style[state] as any).some((k) => (node.style[state] as any)[k]);
          return (
            <button
              key={state}
              onClick={() => setActiveState(state)}
              className={`flex-1 text-[9px] font-semibold uppercase py-1.5 rounded transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {state === 'normal' ? 'Normal' : state.charAt(0).toUpperCase() + state.slice(1)}
              {hasValues && (
                <span className="absolute top-0.5 right-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'hsl(var(--primary))' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Spacing */}
      <CollapsibleStyleGroup title={locale.spacing}>
        {renderField('Padding', 'padding', '1rem')}
        {renderField('Margin', 'margin', '0 auto')}
        {renderField('Gap', 'gap', '1rem')}
      </CollapsibleStyleGroup>
      <Separator className="my-1" />

      {/* Size */}
      <CollapsibleStyleGroup title={locale.size}>
        {renderField('Width', 'width')}
        {renderField('Height', 'height')}
        {renderField('Min Height', 'minHeight')}
        {renderField('Min Width', 'minWidth')}
        {renderField('Max Width', 'maxWidth')}
        {renderField('Max Height', 'maxHeight')}
      </CollapsibleStyleGroup>
      <Separator className="my-1" />

      {/* Typography */}
      <CollapsibleStyleGroup title={locale.typography}>
        {renderField('Font Size', 'fontSize', '1rem')}
        {renderField('Font Weight', 'fontWeight', '400')}
        {renderField('Font Family', 'fontFamily')}
        {renderSelect('Font Style', 'fontStyle', ['normal', 'italic', 'oblique'])}
        {renderField('Line Height', 'lineHeight', '1.5')}
        {renderField('Letter Spacing', 'letterSpacing', '0')}
        {renderSelect('Text Align', 'textAlign', ['left', 'center', 'right', 'justify'])}
        {renderSelect('Text Transform', 'textTransform', ['none', 'uppercase', 'lowercase', 'capitalize'])}
        {renderSelect('Text Decoration', 'textDecoration', ['none', 'underline', 'line-through', 'overline'])}
        {renderField('Text Shadow', 'textShadow')}
        {renderSelect('White Space', 'whiteSpace', ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap'])}
        {renderField('Word Spacing', 'wordSpacing')}
        {renderField('Color', 'color')}
      </CollapsibleStyleGroup>
      <Separator className="my-1" />

      {/* Appearance */}
      <CollapsibleStyleGroup title={locale.appearance}>
        {renderField('Background', 'backgroundColor')}
        {renderField('Border Color', 'borderColor')}
        {renderField('Border Width', 'borderWidth', '1px')}
        {renderField('Border Radius', 'borderRadius', '0.5rem')}
        {renderSelect('Border Style', 'borderStyle', ['none', 'solid', 'dashed', 'dotted', 'double'])}
        <PropField label="Box Shadow" value={getStyleValue('boxShadow')} onChange={(v) => setStyleValue('boxShadow', v || undefined)} placeholder="0 4px 6px rgba(0,0,0,0.1)" />
        <PropField label="Outline" value={getStyleValue('outline')} onChange={(v) => setStyleValue('outline', v || undefined)} />
        {renderField('Outline Offset', 'outlineOffset')}
        <div className="grid gap-1">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Opacity</Label>
          <div className="flex items-center gap-2">
            <Slider min={0} max={1} step={0.01} value={[parseFloat(getStyleValue('opacity') || '1')]} onValueChange={([v]) => setStyleValue('opacity', v < 1 ? String(v) : undefined)} className="flex-1" />
            <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{parseFloat(getStyleValue('opacity') || '1').toFixed(2)}</span>
          </div>
        </div>
        {renderSelect('Cursor', 'cursor', ['auto', 'pointer', 'default', 'move', 'text', 'not-allowed', 'grab'])}
      </CollapsibleStyleGroup>
      <Separator className="my-1" />

      {/* Background Advanced */}
      <CollapsibleStyleGroup title="Fondo Avanzado" defaultOpen={false}>
        <ImageUploadField
          label="Imagen de fondo"
          value={getStyleValue('backgroundImage')?.replace(/^url[\"']?|[\"']?$/g, '') || ''}
          onChange={(v) => setStyleValue('backgroundImage', v ? `url(${v})` : undefined)}
        />
        {renderSelect('Background Size', 'backgroundSize', ['cover', 'contain', 'auto', '100%'])}
        {renderSelect('Background Position', 'backgroundPosition', ['center', 'top', 'bottom', 'left', 'right', 'top center', 'bottom center'])}
        {renderSelect('Background Repeat', 'backgroundRepeat', ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'])}
        {renderSelect('Background Attachment', 'backgroundAttachment', ['scroll', 'fixed', 'local'])}
        {renderSelect('Background Blend Mode', 'backgroundBlendMode', ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn'])}
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Gradiente</Label>
        <GradientEditor
          value={getStyleValue('backgroundGradient') || (getStyleValue('backgroundImage')?.startsWith('linear-gradient') ? getStyleValue('backgroundImage') : '')}
          onChange={(v) => setStyleValue('backgroundGradient', v || undefined)}
        />
      </CollapsibleStyleGroup>
      <Separator className="my-1" />

      {/* Filters & Effects */}
      <CollapsibleStyleGroup title="Filtros y Efectos" defaultOpen={false}>
        <PropField label="Filter" value={getStyleValue('filter')} onChange={(v) => setStyleValue('filter', v || undefined)} placeholder="blur(4px)" />
        <PropField label="Backdrop Filter" value={getStyleValue('backdropFilter')} onChange={(v) => setStyleValue('backdropFilter', v || undefined)} placeholder="blur(10px)" />
        {renderSelect('Mix Blend Mode', 'mixBlendMode', ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion'])}
        <PropField label="Clip Path" value={getStyleValue('clipPath')} onChange={(v) => setStyleValue('clipPath', v || undefined)} placeholder="circle(50%)" />
      </CollapsibleStyleGroup>
      <Separator className="my-1" />

      {/* Transforms */}
      <CollapsibleStyleGroup title="Transformaciones" defaultOpen={false}>
        <PropField label="Transform" value={getStyleValue('transform')} onChange={(v) => setStyleValue('transform', v || undefined)} placeholder="translateY(-10px) scale(1.02)" />
        <PropField label="Transform Origin" value={getStyleValue('transformOrigin')} onChange={(v) => setStyleValue('transformOrigin', v || undefined)} placeholder="center center" />
        {renderField('Perspective', 'perspective', '1000px')}
      </CollapsibleStyleGroup>
      <Separator className="my-1" />

      {/* Transitions */}
      <CollapsibleStyleGroup title="Transiciones" defaultOpen={false}>
        <PropField label="Transition" value={getStyleValue('transition')} onChange={(v) => setStyleValue('transition', v || undefined)} placeholder="all 0.3s ease" />
        <PropField label="Property" value={getStyleValue('transitionProperty')} onChange={(v) => setStyleValue('transitionProperty', v || undefined)} placeholder="all" />
        {renderField('Duration', 'transitionDuration', '0.3s')}
        {renderSelect('Timing', 'transitionTimingFunction', ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear', 'cubic-bezier(0.4, 0, 0.2, 1)'])}
        {renderField('Delay', 'transitionDelay', '0s')}
      </CollapsibleStyleGroup>
      <Separator className="my-1" />

      {/* Animations */}
      <CollapsibleStyleGroup title="Animaciones" defaultOpen={false}>
        <div className="grid gap-1">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Preset</Label>
          <Select
            value={(() => {
              const anim = getStyleValue('animation');
              const match = Object.entries(ANIMATION_PRESETS).find(([, v]) => v && anim.includes(v.split(' ')[0]));
              return match ? match[0] : 'none';
            })()}
            onValueChange={(v) => {
              const preset = ANIMATION_PRESETS[v as AnimationPreset];
              setStyleValue('animation', preset || undefined);
            }}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{Object.keys(ANIMATION_PRESETS).map((key) => (<SelectItem key={key} value={key}>{key}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <PropField label="Custom Animation" value={getStyleValue('animation')} onChange={(v) => setStyleValue('animation', v || undefined)} placeholder="fadeIn 0.5s ease-out" />
        {renderField('Duration', 'animationDuration', '0.5s')}
        {renderField('Delay', 'animationDelay', '0s')}
        {renderSelect('Timing', 'animationTimingFunction', ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'])}
        {renderSelect('Iteration Count', 'animationIterationCount', ['1', '2', '3', 'infinite'])}
        {renderSelect('Fill Mode', 'animationFillMode', ['none', 'forwards', 'backwards', 'both'])}
        {renderSelect('Direction', 'animationDirection', ['normal', 'reverse', 'alternate', 'alternate-reverse'])}
        {renderSelect('Play State', 'animationPlayState', ['running', 'paused'])}
      </CollapsibleStyleGroup>

      {/* Layout position */}
      <Separator className="my-1" />
      <CollapsibleStyleGroup title="Posición" defaultOpen={false}>
        {renderSelect('Position', 'position', ['static', 'relative', 'absolute', 'fixed', 'sticky'])}
        {renderField('Top', 'top')}
        {renderField('Right', 'right')}
        {renderField('Bottom', 'bottom')}
        {renderField('Left', 'left')}
        <NumericStyleField label="Z-Index" value={getStyleValue('zIndex')} onChange={(v) => setStyleValue('zIndex', v || undefined)} placeholder="0" />
        {renderSelect('Overflow', 'overflow', ['visible', 'hidden', 'scroll', 'auto'])}
        {renderSelect('Display', 'display', ['block', 'flex', 'grid', 'inline', 'inline-block', 'inline-flex', 'none'])}
      </CollapsibleStyleGroup>

      {/* Global Styles */}
      {activeState === 'normal' && !bp && onUpdateAppliedGlobalStyles && (
        <>
          <Separator className="my-1" />
          <GlobalStylesSelector node={node} globalStyles={globalStyles} onUpdate={onUpdateAppliedGlobalStyles} />
        </>
      )}

      {/* Custom CSS per widget */}
      {activeState === 'normal' && (
        <>
          <Separator className="my-1" />
          <CollapsibleStyleGroup title="CSS Personalizado" defaultOpen={false}>
            <p className="text-[9px] text-muted-foreground mb-1">CSS aplicado solo a este widget. Usa <code className="bg-muted px-0.5 rounded">selector</code> como referencia al elemento.</p>
            <Textarea
              className="text-xs font-mono min-h-[80px]"
              value={node.customCSS || ''}
              onChange={(e) => onUpdateCustomCSS?.(e.target.value)}
              placeholder={`/* Ejemplo */
selector {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}`}
              rows={5}
            />
          </CollapsibleStyleGroup>
        </>
      )}
    </div>
  );
}

/* ── Main Inspector ── */

export function Inspector({ node, onUpdateProps, onUpdateStyle, onDelete, onDuplicate, onImageUpload, onUpdateCustomCSS, device, globalStyles, onUpdateAppliedGlobalStyles }: InspectorProps) {
  const locale = t();

  // Locked nodes: show read-only banner, only allow style editing
  const isLocked = node.locked === true;

  return (
    <div className="h-full flex flex-col">
      <div
        className="px-3 py-2.5 border-b flex items-center justify-between"
        style={{
          background: 'linear-gradient(180deg, hsl(var(--muted) / 0.4) 0%, hsl(var(--background)) 100%)',
        }}
      >
        <div>
          <p className="text-xs font-semibold">{node.type}</p>
          <p className="text-[10px] text-muted-foreground font-mono">{node.id.slice(0, 12)}…</p>
        </div>
        <div className="flex items-center gap-0.5">
          {onDuplicate && !isLocked && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-200" onClick={onDuplicate} title="Duplicate">
              <Copy className="h-3.5 w-3.5" />
            </Button>
          )}
          {!isLocked && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200" onClick={onDelete} title={locale.deleteNode}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
      {isLocked && (
        <div className="mx-3 mt-2 p-2 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-1.5">
          <span className="text-sm">🔒</span>
          <span>Elemento bloqueado — solo se puede editar su estilo visual.</span>
        </div>
      )}
      <Tabs defaultValue={isLocked ? 'style' : 'props'} className="flex-1 overflow-hidden flex flex-col">
        <TabsList className="mx-3 mt-2 w-auto">
          {!isLocked && <TabsTrigger value="props" className="text-xs">{locale.props}</TabsTrigger>}
          <TabsTrigger value="style" className="text-xs">{locale.style}</TabsTrigger>
        </TabsList>
        <div className="flex-1 overflow-y-auto">
          {!isLocked && (
            <TabsContent value="props" className="mt-0">
              <PropsTab node={node} onUpdateProps={onUpdateProps} onUpdateStyle={onUpdateStyle} onImageUpload={onImageUpload} />
            </TabsContent>
          )}
          <TabsContent value="style" className="mt-0">
            <StyleTab
              node={node}
              onUpdateStyle={onUpdateStyle}
              onUpdateCustomCSS={onUpdateCustomCSS}
              device={device}
              globalStyles={globalStyles}
              onUpdateAppliedGlobalStyles={onUpdateAppliedGlobalStyles}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
