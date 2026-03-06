import { SchemaNode, NodeProps, NodeStyle } from '@/types/schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface InspectorProps {
  node: SchemaNode;
  onUpdateProps: (props: Partial<NodeProps>) => void;
  onUpdateStyle: (style: Partial<NodeStyle>) => void;
  onDelete: () => void;
}

function PropField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid gap-1">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input className="h-8 text-xs" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

/* ── Per-type prop editors ── */

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
      <PropField label="Link (href)" value={node.props.href || ''} onChange={(v) => onUpdate({ href: v })} />
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

function NavbarPropsEditor({ node, onUpdate }: { node: SchemaNode; onUpdate: (p: Partial<NodeProps>) => void }) {
  const links = node.props.links || [];
  return (
    <>
      <PropField label="Logo Text" value={node.props.logoText || ''} onChange={(v) => onUpdate({ logoText: v })} />
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Links</Label>
      {links.map((link, i) => (
        <div key={i} className="grid grid-cols-2 gap-1">
          <Input className="h-7 text-xs" placeholder="Text" value={link.text} onChange={(e) => {
            const updated = [...links]; updated[i] = { ...link, text: e.target.value }; onUpdate({ links: updated });
          }} />
          <Input className="h-7 text-xs" placeholder="Href" value={link.href} onChange={(e) => {
            const updated = [...links]; updated[i] = { ...link, href: e.target.value }; onUpdate({ links: updated });
          }} />
        </div>
      ))}
      <Button variant="outline" size="sm" className="text-xs w-full" onClick={() => onUpdate({ links: [...links, { text: 'Link', href: '#' }] })}>+ Add Link</Button>
    </>
  );
}

function FooterPropsEditor({ node, onUpdate }: { node: SchemaNode; onUpdate: (p: Partial<NodeProps>) => void }) {
  const links = node.props.links || [];
  return (
    <>
      <PropField label="Logo Text" value={node.props.logoText || ''} onChange={(v) => onUpdate({ logoText: v })} />
      <PropField label="Copyright" value={node.props.copyright || ''} onChange={(v) => onUpdate({ copyright: v })} />
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Links</Label>
      {links.map((link, i) => (
        <div key={i} className="grid grid-cols-2 gap-1">
          <Input className="h-7 text-xs" placeholder="Text" value={link.text} onChange={(e) => {
            const updated = [...links]; updated[i] = { ...link, text: e.target.value }; onUpdate({ links: updated });
          }} />
          <Input className="h-7 text-xs" placeholder="Href" value={link.href} onChange={(e) => {
            const updated = [...links]; updated[i] = { ...link, href: e.target.value }; onUpdate({ links: updated });
          }} />
        </div>
      ))}
      <Button variant="outline" size="sm" className="text-xs w-full" onClick={() => onUpdate({ links: [...links, { text: 'Link', href: '#' }] })}>+ Add Link</Button>
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
        <div key={i} className="space-y-1 border rounded-md p-2">
          <Input className="h-7 text-xs" placeholder="Icon (truck, shield, refresh, star)" value={item.icon || ''} onChange={(e) => {
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

function TestimonialPropsEditor({ node, onUpdate }: { node: SchemaNode; onUpdate: (p: Partial<NodeProps>) => void }) {
  return (
    <>
      <PropField label="Quote" value={node.props.text || ''} onChange={(v) => onUpdate({ text: v })} />
      <PropField label="Author" value={node.props.label || ''} onChange={(v) => onUpdate({ label: v })} />
      <PropField label="Stars (1-5)" value={node.props.variant || '5'} onChange={(v) => onUpdate({ variant: v })} />
    </>
  );
}

function NewsletterPropsEditor({ node, onUpdate }: { node: SchemaNode; onUpdate: (p: Partial<NodeProps>) => void }) {
  return (
    <>
      <PropField label="Heading" value={node.props.text || ''} onChange={(v) => onUpdate({ text: v })} />
      <PropField label="Subtext" value={node.props.label || ''} onChange={(v) => onUpdate({ label: v })} />
      <PropField label="Placeholder" value={node.props.placeholder || ''} onChange={(v) => onUpdate({ placeholder: v })} />
    </>
  );
}

/* ── Props tab router ── */

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
        <>
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
        </>
      )}
      {node.type === 'Container' && (
        <>
          <PropField label="Max Width" value={p.text || '72rem'} onChange={(v) => onUpdateProps({ text: v })} />
        </>
      )}
      {node.type === 'Grid' && (
        <>
          <PropField label="Columns" value={String(p.columns || 3)} onChange={(v) => onUpdateProps({ columns: parseInt(v) || 3 })} />
        </>
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
          <ImagePropsEditor node={node} onUpdate={onUpdateProps} />
          <PropField label="Name" value={p.text || ''} onChange={(v) => onUpdateProps({ text: v })} />
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
    </div>
  );
}

/* ── Style tab ── */

const STYLE_FIELDS: { label: string; key: keyof NodeStyle }[] = [
  { label: 'Padding', key: 'padding' },
  { label: 'Margin', key: 'margin' },
  { label: 'Gap', key: 'gap' },
  { label: 'Width', key: 'width' },
  { label: 'Height', key: 'height' },
  { label: 'Min Height', key: 'minHeight' },
  { label: 'Max Width', key: 'maxWidth' },
  { label: 'Font Size', key: 'fontSize' },
  { label: 'Font Weight', key: 'fontWeight' },
  { label: 'Line Height', key: 'lineHeight' },
  { label: 'Letter Spacing', key: 'letterSpacing' },
  { label: 'Text Align', key: 'textAlign' },
  { label: 'Color', key: 'color' },
  { label: 'Background', key: 'backgroundColor' },
  { label: 'Border Color', key: 'borderColor' },
  { label: 'Border Width', key: 'borderWidth' },
  { label: 'Border Radius', key: 'borderRadius' },
  { label: 'Box Shadow', key: 'boxShadow' },
  { label: 'Opacity', key: 'opacity' },
];

function StyleTab({ node, onUpdateStyle }: { node: SchemaNode; onUpdateStyle: (s: Partial<NodeStyle>) => void }) {
  return (
    <div className="space-y-3 p-3">
      {STYLE_FIELDS.map((f) => (
        <PropField
          key={f.key}
          label={f.label}
          value={(node.style as any)[f.key] || ''}
          onChange={(v) => onUpdateStyle({ [f.key]: v || undefined })}
        />
      ))}
    </div>
  );
}

/* ── Main Inspector ── */

export function Inspector({ node, onUpdateProps, onUpdateStyle, onDelete }: InspectorProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold">{node.type}</p>
          <p className="text-[10px] text-muted-foreground">{node.id}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete} title="Delete node">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <Tabs defaultValue="props" className="flex-1 overflow-hidden flex flex-col">
        <TabsList className="mx-3 mt-2 w-auto">
          <TabsTrigger value="props" className="text-xs">Props</TabsTrigger>
          <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
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
