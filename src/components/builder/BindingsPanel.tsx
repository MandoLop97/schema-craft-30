import { useState, useMemo } from 'react';
import { SchemaNode, NodeProps } from '@/types/schema';
import { NodeBindings, DataSourceType, DataBinding } from '@/types/contract';
import { createDefaultBindings, getAvailableTransforms, resolveBindings } from '@/lib/binding-utils';
import { getBlockDef } from '@/lib/block-registry';
import { buildMockRenderData, DEFAULT_MOCK_PRODUCTS } from '@/lib/mock-data';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Database, Zap, Link2, Eye, Wand2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface BindingsPanelProps {
  node: SchemaNode;
  onUpdateProps: (props: Partial<NodeProps>) => void;
}

const DATA_SOURCES: { value: DataSourceType; label: string }[] = [
  { value: 'products', label: 'Products' },
  { value: 'collections', label: 'Collections' },
  { value: 'pages', label: 'Pages' },
  { value: 'media', label: 'Media' },
  { value: 'settings', label: 'Settings' },
  { value: 'custom', label: 'Custom' },
];

const SORT_OPTIONS = [
  { value: '__none', label: 'None' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

const PRODUCT_FIELDS = ['name', 'price', 'original_price', 'image_url', 'description', 'category', 'badge', 'sku', 'in_stock'];
const COLLECTION_FIELDS = ['name', 'image', 'slug', 'description', 'productCount'];

/** Preset binding configurations per block type */
const BINDING_PRESETS: Record<string, { label: string; bindings: DataBinding[]; dataSource?: any }[]> = {
  ProductCard: [
    {
      label: 'Standard Product',
      bindings: [
        { propKey: 'text', fieldPath: 'name' },
        { propKey: 'name', fieldPath: 'name' },
        { propKey: 'src', fieldPath: 'image_url' },
        { propKey: 'image', fieldPath: 'image_url' },
        { propKey: 'price', fieldPath: 'price', transform: 'formatPrice' },
        { propKey: 'originalPrice', fieldPath: 'original_price', transform: 'formatPrice' },
        { propKey: 'badge', fieldPath: 'badge' },
      ],
    },
  ],
  ProductGrid: [
    {
      label: 'All Products',
      dataSource: { type: 'products', isCollection: true, itemVariable: 'product', query: { limit: 8 } },
      bindings: [],
    },
    {
      label: 'Products by Category',
      dataSource: { type: 'products', isCollection: true, itemVariable: 'product', query: { limit: 8, category: '' } },
      bindings: [],
    },
  ],
  CollectionGrid: [
    {
      label: 'All Collections',
      dataSource: { type: 'collections', isCollection: true, itemVariable: 'collection', query: { limit: 6 } },
      bindings: [
        { propKey: 'collections', fieldPath: '' },
      ],
    },
  ],
  HeroSection: [
    {
      label: 'Dynamic Hero',
      bindings: [
        { propKey: 'text', fieldPath: 'title' },
        { propKey: 'heading', fieldPath: 'title' },
        { propKey: 'subtitle', fieldPath: 'subtitle' },
        { propKey: 'src', fieldPath: 'image_url' },
        { propKey: 'ctaText', fieldPath: 'ctaText' },
        { propKey: 'ctaHref', fieldPath: 'ctaHref' },
      ],
    },
  ],
  TestimonialSection: [
    {
      label: 'Testimonials List',
      bindings: [
        { propKey: 'testimonials', fieldPath: 'items' },
      ],
    },
  ],
  FAQSection: [
    {
      label: 'FAQ Items',
      bindings: [
        { propKey: 'faqItems', fieldPath: 'items' },
      ],
    },
  ],
};

export function BindingsPanel({ node, onUpdateProps }: BindingsPanelProps) {
  const blockDef = getBlockDef(node.type);
  const bindings: NodeBindings = (node.props as any).__bindings || { mode: 'manual' };
  const transforms = getAvailableTransforms();
  const [showPreview, setShowPreview] = useState(false);

  const updateBindings = (updated: Partial<NodeBindings>) => {
    onUpdateProps({ __bindings: { ...bindings, ...updated } } as any);
  };

  const isActive = bindings.mode === 'bound' || bindings.mode === 'hybrid';

  const handleToggleBinding = (enabled: boolean) => {
    if (enabled) {
      const defaults = createDefaultBindings(node.type);
      onUpdateProps({ __bindings: defaults } as any);
    } else {
      updateBindings({ mode: 'manual' });
    }
  };

  const applyPreset = (preset: { bindings: DataBinding[]; dataSource?: any }) => {
    const updates: Partial<NodeBindings> = { bindings: preset.bindings };
    if (preset.dataSource) {
      updates.dataSource = preset.dataSource;
    }
    updateBindings(updates);
  };

  const addFieldBinding = () => {
    const currentBindings = bindings.bindings || [];
    updateBindings({
      bindings: [...currentBindings, { propKey: '', fieldPath: '' }],
    });
  };

  const updateFieldBinding = (index: number, updated: Partial<DataBinding>) => {
    const current = [...(bindings.bindings || [])];
    current[index] = { ...current[index], ...updated };
    updateBindings({ bindings: current });
  };

  const removeFieldBinding = (index: number) => {
    updateBindings({
      bindings: (bindings.bindings || []).filter((_, i) => i !== index),
    });
  };

  const updateFallback = (key: string, value: string) => {
    updateBindings({
      fallbackProps: { ...(bindings.fallbackProps || {}), [key]: value },
    });
  };

  const sourceFields = bindings.dataSource?.type === 'products' ? PRODUCT_FIELDS
    : bindings.dataSource?.type === 'collections' ? COLLECTION_FIELDS
    : [];

  // Live preview: resolve bindings with mock data
  const previewData = useMemo(() => {
    if (!isActive || !showPreview) return null;
    try {
      const mockRenderData = buildMockRenderData();
      const context = {
        mode: 'edit' as const,
        data: mockRenderData,
        currentItem: bindings.dataSource?.isCollection ? DEFAULT_MOCK_PRODUCTS[0] : undefined,
      };
      const resolved = resolveBindings(
        { ...node, bindings } as any,
        context
      );
      return resolved;
    } catch {
      return null;
    }
  }, [isActive, showPreview, bindings, node]);

  const presets = BINDING_PRESETS[node.type];

  return (
    <div className="p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 p-2 rounded-md" style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}>
        <Database className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Data Bindings</span>
        {blockDef?.supportsBinding && (
          <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}>
            Compatible
          </span>
        )}
      </div>

      {/* Enable/Disable */}
      <div className="flex items-center justify-between">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Enable Data Binding</Label>
        <Switch checked={isActive} onCheckedChange={handleToggleBinding} />
      </div>

      {!isActive && (
        <p className="text-[10px] text-muted-foreground italic">
          Enable data binding to connect this block to real data sources like products, collections, or custom data.
        </p>
      )}

      {isActive && (
        <>
          {/* Mode */}
          <div className="grid gap-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Mode</Label>
            <Select value={bindings.mode} onValueChange={(v) => updateBindings({ mode: v as any })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bound">Bound (data only)</SelectItem>
                <SelectItem value="hybrid">Hybrid (data + manual fallback)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Data Source */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center gap-1 w-full text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-1 hover:text-foreground transition-colors">
              <Zap className="h-3 w-3" /> Data Source
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-1">
              <div className="grid gap-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Source Type</Label>
                <Select
                  value={bindings.dataSource?.type || 'products'}
                  onValueChange={(v) => updateBindings({
                    dataSource: { ...(bindings.dataSource || { type: 'products' }), type: v as DataSourceType },
                  })}
                >
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DATA_SOURCES.map((ds) => (
                      <SelectItem key={ds.value} value={ds.value}>{ds.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Is Collection (list)</Label>
                <Switch
                  checked={bindings.dataSource?.isCollection ?? false}
                  onCheckedChange={(v) => updateBindings({
                    dataSource: { ...(bindings.dataSource || { type: 'products' }), isCollection: v },
                  })}
                />
              </div>

              {bindings.dataSource?.isCollection && (
                <>
                  <div className="grid gap-1">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Item Variable</Label>
                    <Input
                      className="h-8 text-xs font-mono"
                      value={bindings.dataSource?.itemVariable || ''}
                      onChange={(e) => updateBindings({
                        dataSource: { ...bindings.dataSource!, itemVariable: e.target.value || undefined },
                      })}
                      placeholder="product"
                    />
                  </div>

                  <div className="grid gap-1">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Category Filter</Label>
                    <Input
                      className="h-8 text-xs"
                      value={bindings.dataSource?.query?.category || ''}
                      onChange={(e) => updateBindings({
                        dataSource: {
                          ...bindings.dataSource!,
                          query: { ...(bindings.dataSource?.query || {}), category: e.target.value || undefined },
                        },
                      })}
                      placeholder="Leave empty for all"
                    />
                  </div>

                  <div className="grid gap-1">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Collection Filter</Label>
                    <Input
                      className="h-8 text-xs"
                      value={bindings.dataSource?.query?.collection || ''}
                      onChange={(e) => updateBindings({
                        dataSource: {
                          ...bindings.dataSource!,
                          query: { ...(bindings.dataSource?.query || {}), collection: e.target.value || undefined },
                        },
                      })}
                      placeholder="Leave empty for all"
                    />
                  </div>

                  <div className="grid gap-1">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Limit</Label>
                    <Input
                      className="h-8 text-xs"
                      type="number"
                      value={bindings.dataSource?.query?.limit || ''}
                      onChange={(e) => updateBindings({
                        dataSource: {
                          ...bindings.dataSource!,
                          query: { ...(bindings.dataSource?.query || {}), limit: parseInt(e.target.value) || undefined },
                        },
                      })}
                      placeholder="8"
                    />
                  </div>

                  <div className="grid gap-1">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Sort</Label>
                    <Select
                      value={bindings.dataSource?.query?.sort || '__none'}
                      onValueChange={(v) => updateBindings({
                        dataSource: {
                          ...bindings.dataSource!,
                          query: { ...(bindings.dataSource?.query || {}), sort: (v === '__none' ? undefined : v) as any },
                        },
                      })}
                    >
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="None" /></SelectTrigger>
                      <SelectContent>
                        {SORT_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Presets */}
          {presets && presets.length > 0 && (
            <>
              <Collapsible defaultOpen={!(bindings.bindings && bindings.bindings.length > 0)}>
                <CollapsibleTrigger className="flex items-center gap-1 w-full text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-1 hover:text-foreground transition-colors">
                  <Wand2 className="h-3 w-3" /> Quick Presets
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-1">
                  {presets.map((preset, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="text-xs w-full gap-1 justify-start"
                      onClick={() => applyPreset(preset)}
                    >
                      <Wand2 className="h-3 w-3" />
                      {preset.label}
                      <span className="ml-auto text-[9px] text-muted-foreground">{preset.bindings.length} fields</span>
                    </Button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
              <Separator />
            </>
          )}

          {/* Field Mappings */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center gap-1 w-full text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-1 hover:text-foreground transition-colors">
              <Link2 className="h-3 w-3" /> Field Mappings ({(bindings.bindings || []).length})
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-1">
              {(bindings.bindings || []).map((binding, i) => (
                <div key={i} className="border rounded-md p-2 space-y-1.5 relative" style={{ borderColor: 'hsl(var(--border))' }}>
                  <Button
                    variant="ghost" size="icon"
                    className="absolute top-1 right-1 h-5 w-5 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFieldBinding(i)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>

                  <div className="grid grid-cols-2 gap-1">
                    <div className="grid gap-0.5">
                      <Label className="text-[9px] text-muted-foreground">Prop</Label>
                      <Input
                        className="h-7 text-xs font-mono"
                        value={binding.propKey}
                        onChange={(e) => updateFieldBinding(i, { propKey: e.target.value })}
                        placeholder="text, src, price..."
                      />
                    </div>
                    <div className="grid gap-0.5">
                      <Label className="text-[9px] text-muted-foreground">Field Path</Label>
                      {sourceFields.length > 0 ? (
                        <Select value={binding.fieldPath} onValueChange={(v) => updateFieldBinding(i, { fieldPath: v })}>
                          <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
                          <SelectContent>
                            {sourceFields.map((f) => (
                              <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          className="h-7 text-xs font-mono"
                          value={binding.fieldPath}
                          onChange={(e) => updateFieldBinding(i, { fieldPath: e.target.value })}
                          placeholder="field.path"
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid gap-0.5">
                    <Label className="text-[9px] text-muted-foreground">Transform</Label>
                    <Select value={binding.transform || '__none'} onValueChange={(v) => updateFieldBinding(i, { transform: v === '__none' ? undefined : v })}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="None" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">None</SelectItem>
                        {transforms.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}

              <Button variant="outline" size="sm" className="text-xs w-full gap-1" onClick={addFieldBinding}>
                <Plus className="h-3 w-3" /> Add Field Mapping
              </Button>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Fallback Props */}
          <Collapsible defaultOpen={false}>
            <CollapsibleTrigger className="flex items-center gap-1 w-full text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-1 hover:text-foreground transition-colors">
              ▸ Fallback Props
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-1">
              <p className="text-[9px] text-muted-foreground">Values used when bound data is unavailable.</p>
              {(bindings.bindings || []).filter(b => b.propKey).map((binding, i) => (
                <div key={i} className="grid gap-0.5">
                  <Label className="text-[9px] text-muted-foreground">{binding.propKey}</Label>
                  <Input
                    className="h-7 text-xs"
                    value={(bindings.fallbackProps as any)?.[binding.propKey] || ''}
                    onChange={(e) => updateFallback(binding.propKey, e.target.value)}
                    placeholder={`Fallback for ${binding.propKey}`}
                  />
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Live Data Preview */}
          <Collapsible open={showPreview} onOpenChange={setShowPreview}>
            <CollapsibleTrigger className="flex items-center gap-1 w-full text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-1 hover:text-foreground transition-colors">
              <Eye className="h-3 w-3" /> Data Preview
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1">
              {previewData ? (
                <div className="rounded-md border p-2 space-y-1 text-[10px] font-mono overflow-x-auto" style={{ backgroundColor: 'hsl(var(--muted) / 0.2)', maxHeight: '200px', overflowY: 'auto' }}>
                  {Object.entries(previewData).filter(([k]) => k !== '__bindings').map(([key, value]) => (
                    <div key={key} className="flex gap-1">
                      <span className="text-primary font-semibold shrink-0">{key}:</span>
                      <span className="text-muted-foreground truncate">{typeof value === 'object' ? JSON.stringify(value) : String(value ?? '—')}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[9px] text-muted-foreground italic">Add field mappings to see resolved data.</p>
              )}
            </CollapsibleContent>
          </Collapsible>
        </>
      )}
    </div>
  );
}
