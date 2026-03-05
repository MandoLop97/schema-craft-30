import { SchemaNode, NodeProps, NodeStyle } from '@/types/schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

function PropsTab({ node, onUpdateProps }: { node: SchemaNode; onUpdateProps: (p: Partial<NodeProps>) => void }) {
  const p = node.props;
  return (
    <div className="space-y-3 p-3">
      {(node.type === 'Text' || node.type === 'Button' || node.type === 'Badge') && (
        <PropField label="Text" value={p.text || ''} onChange={(v) => onUpdateProps({ text: v })} />
      )}
      {node.type === 'Text' && (
        <div className="grid gap-1">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Level</Label>
          <Select value={p.level || 'p'} onValueChange={(v) => onUpdateProps({ level: v as any })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span'].map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {node.type === 'Button' && (
        <div className="grid gap-1">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Variant</Label>
          <Select value={p.variant || 'default'} onValueChange={(v) => onUpdateProps({ variant: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['default', 'outline', 'secondary', 'ghost', 'link'].map((v) => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {(node.type === 'Image' || node.type === 'ProductCard') && (
        <>
          <PropField label="Image URL" value={p.src || ''} onChange={(v) => onUpdateProps({ src: v })} />
          <PropField label="Alt Text" value={p.alt || ''} onChange={(v) => onUpdateProps({ alt: v })} />
        </>
      )}
      {node.type === 'ProductCard' && (
        <>
          <PropField label="Price" value={p.price || ''} onChange={(v) => onUpdateProps({ price: v })} />
          <PropField label="Original Price" value={p.originalPrice || ''} onChange={(v) => onUpdateProps({ originalPrice: v })} />
          <PropField label="Badge" value={p.badge || ''} onChange={(v) => onUpdateProps({ badge: v })} />
        </>
      )}
      {node.type === 'Input' && (
        <PropField label="Placeholder" value={p.placeholder || ''} onChange={(v) => onUpdateProps({ placeholder: v })} />
      )}
      {(node.type === 'Navbar' || node.type === 'Footer') && (
        <PropField label="Logo Text" value={p.logoText || ''} onChange={(v) => onUpdateProps({ logoText: v })} />
      )}
      {node.type === 'Grid' && (
        <PropField label="Columns" value={String(p.columns || 3)} onChange={(v) => onUpdateProps({ columns: parseInt(v) || 3 })} />
      )}
      {node.type === 'Stack' && (
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
      )}
      {node.type === 'Button' && (
        <PropField label="Link (href)" value={p.href || ''} onChange={(v) => onUpdateProps({ href: v })} />
      )}
    </div>
  );
}

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
