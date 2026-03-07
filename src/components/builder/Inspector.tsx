import { useState, useRef, useEffect } from 'react';
import { SchemaNode, NodeProps, NodeStyle } from '@/types/schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { t } from '@/lib/i18n';
import { getBlockDef, InspectorFieldDef } from '@/lib/block-registry';

interface InspectorProps {
  node: SchemaNode;
  onUpdateProps: (props: Partial<NodeProps>) => void;
  onUpdateStyle: (style: Partial<NodeStyle>) => void;
  onDelete: () => void;
  onDuplicate?: () => void;
}

function PropField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid gap-1">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input className="h-8 text-xs transition-shadow duration-200 focus:ring-2 focus:ring-primary/20" value={value} onChange={(e) => onChange(e.target.value)} />
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

  const handleCommit = (v: string) => {
    setLocalValue(v);
    onChange(v);
  };

  // Resolve display color — handle hsl(var(...)) gracefully
  const displayColor = localValue && !localValue.includes('var(') ? localValue : '#ffffff';

  return (
    <div className="grid gap-1">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="flex gap-1.5 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="h-8 w-8 rounded-md border border-border shrink-0 cursor-pointer transition-shadow hover:ring-2 hover:ring-primary/20"
              style={{ backgroundColor: displayColor }}
              title="Pick color"
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" side="left" align="start">
            <div className="space-y-3">
              {/* Native color picker */}
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="color"
                  value={displayColor}
                  onChange={(e) => handleCommit(e.target.value)}
                  className="h-8 w-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                />
                <span className="text-xs text-muted-foreground">Custom</span>
              </div>
              {/* Preset swatches */}
              <div className="grid grid-cols-6 gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    className={`h-6 w-6 rounded-md border cursor-pointer transition-all hover:scale-110 ${
                      localValue === c ? 'ring-2 ring-primary ring-offset-1' : 'border-border'
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => handleCommit(c)}
                    title={c}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Input
          className="h-8 text-xs flex-1 font-mono transition-shadow duration-200 focus:ring-2 focus:ring-primary/20"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={() => onChange(localValue)}
          onKeyDown={(e) => { if (e.key === 'Enter') onChange(localValue); }}
          placeholder="#hex, rgb(), hsl()"
        />
      </div>
    </div>
  );
}

function TextPropsEditor({ node, onUpdate }: { node: SchemaNode; onUpdate: (p: Partial<NodeProps>) => void }) {
  return (
    <>
      <PropField label="Text" value={node.props.text || ''} onChange={(v) => onUpdate({ text: v })} />
      <div className="grid gap-1">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Level</Label>
        <Select value={node.props.level || 'p'} onValueChange={(v) => onUpdate({ level: v as any })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span'].map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
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
          <SelectContent>
            {['default', 'outline', 'secondary', 'ghost', 'link'].map((v) => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <PropField label="Link (href)" value={linkValue} onChange={(v) => onUpdate({ href: v, link: v })} />
    </>
  );
}

function ImagePropsEditor({ node, onUpdate }: { node: SchemaNode; onUpdate: (p: Partial<NodeProps>) => void }) {
  return (
    <>
      <PropField label="Image URL" value={node.props.src || ''} onChange={(v) => onUpdate({ src: v })} />
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
          }}>
            <Trash2 className="h-3 w-3" />
          </Button>
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
          }}>
            <Trash2 className="h-3 w-3" />
          </Button>
          <Input className="h-7 text-xs" placeholder="Icon" value={item.icon || ''} onChange={(e) => {
            const updated = [...items]; updated[i] = { ...item, icon: e.target.value }; onUpdate({ items: updated });
          }} />
          <Input className="h-7 text-xs" placeholder="Title" value={item.title} onChange={(e) => {
            const updated = [...items]; updated[i] = { ...item, title: e.target.value }; onUpdate({ items: updated });
          }} />
          <Input className="h-7 text-xs" placeholder="Description" value={item.description} onChange={(e) => {
            const updated = [...items]; updated[i] = { ...item, description: e.target.value }; onUpdate({ items: updated });
          }} />
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
      <PropField label="Background Image" value={bgImage} onChange={(v) => onUpdate({ src: v, image: v })} />
      <PropField label="Overlay Opacity (0-1)" value={node.props.overlayOpacity || '0.55'} onChange={(v) => onUpdate({ overlayOpacity: v })} />
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
          }}>
            <Trash2 className="h-3 w-3" />
          </Button>
          <Input className="h-7 text-xs" placeholder="Title" value={panel.title} onChange={(e) => {
            const updated = [...panels]; updated[i] = { ...panel, title: e.target.value }; onUpdate({ panels: updated });
          }} />
          <Input className="h-7 text-xs" placeholder="Content" value={panel.description} onChange={(e) => {
            const updated = [...panels]; updated[i] = { ...panel, description: e.target.value }; onUpdate({ panels: updated });
          }} />
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

function PropsTab({ node, onUpdateProps }: { node: SchemaNode; onUpdateProps: (p: Partial<NodeProps>) => void }) {
  const p = node.props;
  return (
    <div className="space-y-3 p-3">
      {node.type === 'Text' && <TextPropsEditor node={node} onUpdate={onUpdateProps} />}
      {node.type === 'Button' && <ButtonPropsEditor node={node} onUpdate={onUpdateProps} />}
      {node.type === 'Image' && <ImagePropsEditor node={node} onUpdate={onUpdateProps} />}
      {node.type === 'Badge' && <PropField label="Text" value={p.text || ''} onChange={(v) => onUpdateProps({ text: v })} />}
      {node.type === 'Input' && <PropField label="Placeholder" value={p.placeholder || ''} onChange={(v) => onUpdateProps({ placeholder: v })} />}
      {node.type === 'Section' && (
        <div className="grid gap-1">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Align Items</Label>
          <Select value={p.direction || 'stretch'} onValueChange={(v) => onUpdateProps({ direction: v as any })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['stretch', 'flex-start', 'center', 'flex-end'].map((v) => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {node.type === 'Container' && (
        <PropField label="Max Width" value={p.text || '72rem'} onChange={(v) => onUpdateProps({ text: v })} />
      )}
      {node.type === 'Grid' && (
        <PropField label="Columns" value={String(p.columns || 3)} onChange={(v) => onUpdateProps({ columns: parseInt(v) || 3 })} />
      )}
      {node.type === 'Stack' && (
        <>
          <div className="grid gap-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Direction</Label>
            <Select value={p.direction || 'vertical'} onValueChange={(v) => onUpdateProps({ direction: v as any })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vertical">Vertical</SelectItem>
                <SelectItem value="horizontal">Horizontal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Align Items</Label>
            <Select value={p.variant || 'stretch'} onValueChange={(v) => onUpdateProps({ variant: v })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['stretch', 'flex-start', 'center', 'flex-end', 'space-between'].map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
      {node.type === 'ProductCard' && (
        <>
          <PropField label="Image URL" value={p.image || p.src || ''} onChange={(v) => onUpdateProps({ src: v, image: v })} />
          <PropField label="Alt Text" value={p.alt || ''} onChange={(v) => onUpdateProps({ alt: v })} />
          <PropField label="Name" value={p.name || p.text || ''} onChange={(v) => onUpdateProps({ text: v, name: v })} />
          <PropField label="Price" value={p.price || ''} onChange={(v) => onUpdateProps({ price: v })} />
          <PropField label="Original Price" value={p.originalPrice || ''} onChange={(v) => onUpdateProps({ originalPrice: v })} />
          <PropField label="Badge" value={p.badge || ''} onChange={(v) => onUpdateProps({ badge: v })} />
        </>
      )}
      {node.type === 'Card' && (
        <>
          {(p.items || []).map((item, i) => (
            <div key={i} className="space-y-1 border rounded-md p-2">
              <Input className="h-7 text-xs" placeholder="Title" value={item.title} onChange={(e) => {
                const updated = [...(p.items || [])]; updated[i] = { ...item, title: e.target.value }; onUpdateProps({ items: updated });
              }} />
              <Input className="h-7 text-xs" placeholder="Description" value={item.description} onChange={(e) => {
                const updated = [...(p.items || [])]; updated[i] = { ...item, description: e.target.value }; onUpdateProps({ items: updated });
              }} />
            </div>
          ))}
        </>
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
      {/* Custom inspector fields for host-registered blocks */}
      {(() => {
        const def = getBlockDef(node.type);
        if (def?.inspectorFields && def.inspectorFields.length > 0) {
          return def.inspectorFields.map((field) => {
            const val = (p as any)[field.key] ?? '';
            if (field.type === 'color') {
              return <ColorField key={field.key} label={field.label} value={String(val)} onChange={(v) => onUpdateProps({ [field.key]: v })} />;
            }
            if (field.type === 'select' && field.options) {
              return (
                <div key={field.key} className="grid gap-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{field.label}</Label>
                  <Select value={String(val)} onValueChange={(v) => onUpdateProps({ [field.key]: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {field.options.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            }
            if (field.type === 'number') {
              return <PropField key={field.key} label={field.label} value={String(val)} onChange={(v) => onUpdateProps({ [field.key]: parseFloat(v) || 0 } as any)} />;
            }
            return <PropField key={field.key} label={field.label} value={String(val)} onChange={(v) => onUpdateProps({ [field.key]: v })} />;
          });
        }
        return null;
      })()}
    </div>
  );
}

/* ── Style tab ── */

const COLOR_KEYS: (keyof NodeStyle)[] = ['color', 'backgroundColor', 'borderColor'];

function StyleTab({ node, onUpdateStyle }: { node: SchemaNode; onUpdateStyle: (s: Partial<NodeStyle>) => void }) {
  const locale = t();

  const STYLE_GROUPS: { title: string; fields: { label: string; key: keyof NodeStyle }[] }[] = [
    {
      title: locale.spacing,
      fields: [
        { label: 'Padding', key: 'padding' },
        { label: 'Margin', key: 'margin' },
        { label: 'Gap', key: 'gap' },
      ],
    },
    {
      title: locale.size,
      fields: [
        { label: 'Width', key: 'width' },
        { label: 'Height', key: 'height' },
        { label: 'Min Height', key: 'minHeight' },
        { label: 'Max Width', key: 'maxWidth' },
      ],
    },
    {
      title: locale.typography,
      fields: [
        { label: 'Font Size', key: 'fontSize' },
        { label: 'Font Weight', key: 'fontWeight' },
        { label: 'Line Height', key: 'lineHeight' },
        { label: 'Letter Spacing', key: 'letterSpacing' },
        { label: 'Text Align', key: 'textAlign' },
        { label: 'Color', key: 'color' },
      ],
    },
    {
      title: locale.appearance,
      fields: [
        { label: 'Background', key: 'backgroundColor' },
        { label: 'Border Color', key: 'borderColor' },
        { label: 'Border Width', key: 'borderWidth' },
        { label: 'Border Radius', key: 'borderRadius' },
        { label: 'Box Shadow', key: 'boxShadow' },
        { label: 'Opacity', key: 'opacity' },
      ],
    },
  ];

  return (
    <div className="p-3 space-y-1">
      {STYLE_GROUPS.map((group, gi) => (
        <div key={group.title}>
          {gi > 0 && <Separator className="my-3" />}
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">{group.title}</p>
          <div className="space-y-2">
            {group.fields.map((f) =>
              COLOR_KEYS.includes(f.key) ? (
                <ColorField
                  key={f.key}
                  label={f.label}
                  value={(node.style as any)[f.key] || ''}
                  onChange={(v) => onUpdateStyle({ [f.key]: v || undefined })}
                />
              ) : (
                <PropField
                  key={f.key}
                  label={f.label}
                  value={(node.style as any)[f.key] || ''}
                  onChange={(v) => onUpdateStyle({ [f.key]: v || undefined })}
                />
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main Inspector ── */

export function Inspector({ node, onUpdateProps, onUpdateStyle, onDelete, onDuplicate }: InspectorProps) {
  const locale = t();

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
          {onDuplicate && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-200"
              onClick={onDuplicate}
              title="Duplicate"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
            onClick={onDelete}
            title={locale.deleteNode}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <Tabs defaultValue="props" className="flex-1 overflow-hidden flex flex-col">
        <TabsList className="mx-3 mt-2 w-auto">
          <TabsTrigger value="props" className="text-xs">{locale.props}</TabsTrigger>
          <TabsTrigger value="style" className="text-xs">{locale.style}</TabsTrigger>
        </TabsList>
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="props" className="mt-0">
            <PropsTab node={node} onUpdateProps={onUpdateProps} />
          </TabsContent>
          <TabsContent value="style" className="mt-0">
            <StyleTab node={node} onUpdateStyle={onUpdateStyle} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
