import { useState } from 'react';
import { ThemeTokens } from '@/types/schema';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Paintbrush } from 'lucide-react';

interface ThemeEditorProps {
  themeTokens: ThemeTokens;
  onUpdate: (tokens: ThemeTokens) => void;
}

const PRESET_COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#1e293b',
];

function hslStringToHex(hsl: string): string {
  try {
    const parts = hsl.trim().split(/\s+/).map(Number);
    if (parts.length !== 3) return '#888888';
    const [h, s, l] = parts;
    const sN = s / 100;
    const lN = l / 100;
    const a = sN * Math.min(lN, 1 - lN);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = lN - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  } catch {
    return '#888888';
  }
}

function hexToHsl(hex: string): string {
  try {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0 0% 50%';
    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
        case g: h = ((b - r) / d + 2) * 60; break;
        case b: h = ((r - g) / d + 4) * 60; break;
      }
    }
    return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  } catch {
    return '0 0% 50%';
  }
}

function ThemeColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const hexColor = hslStringToHex(value);

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="h-7 w-7 rounded-md border border-border shrink-0 cursor-pointer transition-shadow hover:ring-2 hover:ring-primary/20"
            style={{ backgroundColor: hexColor }}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" side="left" align="start">
          <div className="space-y-2">
            <input
              type="color"
              value={hexColor}
              onChange={(e) => onChange(hexToHsl(e.target.value))}
              className="h-8 w-8 rounded cursor-pointer border-0 p-0 bg-transparent"
            />
            <div className="grid grid-cols-6 gap-1">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  className="h-5 w-5 rounded border border-border cursor-pointer transition-transform hover:scale-110"
                  style={{ backgroundColor: c }}
                  onClick={() => onChange(hexToHsl(c))}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <div className="flex-1 min-w-0">
        <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</Label>
        <Input
          className="h-6 text-[11px] font-mono"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

function ThemeTextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-0.5">
      <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input className="h-7 text-[11px]" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function ThemeEditor({ themeTokens, onUpdate }: ThemeEditorProps) {
  const update = (path: string[], value: string | number) => {
    const next = JSON.parse(JSON.stringify(themeTokens)) as ThemeTokens;
    let obj: any = next;
    for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
    obj[path[path.length - 1]] = value;
    onUpdate(next);
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className="px-3 py-2.5 border-b flex items-center gap-2"
        style={{
          background: 'linear-gradient(180deg, hsl(var(--muted) / 0.4) 0%, hsl(var(--background)) 100%)',
        }}
      >
        <Paintbrush className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold">Theme</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {/* Colors */}
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Colores</p>
          <div className="space-y-2">
            <ThemeColorField label="Primary" value={themeTokens.colors.primary} onChange={(v) => update(['colors', 'primary'], v)} />
            <ThemeColorField label="Secondary" value={themeTokens.colors.secondary} onChange={(v) => update(['colors', 'secondary'], v)} />
            <ThemeColorField label="Background" value={themeTokens.colors.background} onChange={(v) => update(['colors', 'background'], v)} />
            <ThemeColorField label="Text" value={themeTokens.colors.text} onChange={(v) => update(['colors', 'text'], v)} />
            <ThemeColorField label="Muted" value={themeTokens.colors.muted} onChange={(v) => update(['colors', 'muted'], v)} />
            <ThemeColorField label="Border" value={themeTokens.colors.border} onChange={(v) => update(['colors', 'border'], v)} />
          </div>

          <Separator className="my-3" />

          {/* Typography */}
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Tipografía</p>
          <div className="space-y-2">
            <ThemeTextField label="Font Family" value={themeTokens.typography.fontFamily} onChange={(v) => update(['typography', 'fontFamily'], v)} />
            <ThemeTextField label="Base Size" value={themeTokens.typography.baseSize} onChange={(v) => update(['typography', 'baseSize'], v)} />
            <ThemeTextField label="Heading Scale" value={String(themeTokens.typography.headingScale)} onChange={(v) => update(['typography', 'headingScale'], parseFloat(v) || 1.25)} />
          </div>

          <Separator className="my-3" />

          {/* Radius */}
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Bordes</p>
          <div className="space-y-2">
            <ThemeTextField label="SM" value={themeTokens.radius.sm} onChange={(v) => update(['radius', 'sm'], v)} />
            <ThemeTextField label="MD" value={themeTokens.radius.md} onChange={(v) => update(['radius', 'md'], v)} />
            <ThemeTextField label="LG" value={themeTokens.radius.lg} onChange={(v) => update(['radius', 'lg'], v)} />
          </div>

          <Separator className="my-3" />

          {/* Spacing */}
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Espaciado</p>
          <div className="space-y-2">
            <ThemeTextField label="XS" value={themeTokens.spacing.xs} onChange={(v) => update(['spacing', 'xs'], v)} />
            <ThemeTextField label="SM" value={themeTokens.spacing.sm} onChange={(v) => update(['spacing', 'sm'], v)} />
            <ThemeTextField label="MD" value={themeTokens.spacing.md} onChange={(v) => update(['spacing', 'md'], v)} />
            <ThemeTextField label="LG" value={themeTokens.spacing.lg} onChange={(v) => update(['spacing', 'lg'], v)} />
            <ThemeTextField label="XL" value={themeTokens.spacing.xl} onChange={(v) => update(['spacing', 'xl'], v)} />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
