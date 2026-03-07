import { ThemeTokens } from '@/types/schema';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
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
    const parts = hsl.replace(/%/g, '').trim().split(/\s+/).map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return '#888888';
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

/** Parse HSL string "H S% L%" into [h, s, l] numbers */
function parseHsl(hsl: string): [number, number, number] {
  const parts = hsl.replace(/%/g, '').trim().split(/\s+/).map(Number);
  return [parts[0] || 0, parts[1] || 0, parts[2] || 50];
}

/** Parse a CSS rem/px value to a number */
function parseUnit(value: string): { num: number; unit: string } {
  const match = value.match(/^([\d.]+)\s*(rem|px|em|%)$/);
  if (match) return { num: parseFloat(match[1]), unit: match[2] };
  return { num: parseFloat(value) || 0, unit: 'rem' };
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
  const [h, s, l] = parseHsl(value);

  const updateHsl = (newH: number, newS: number, newL: number) => {
    onChange(`${Math.round(newH)} ${Math.round(newS)}% ${Math.round(newL)}%`);
  };

  return (
    <div className="space-y-2">
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
      {/* HSL Sliders */}
      <div className="pl-9 space-y-1.5">
        <SliderRow label="H" value={h} min={0} max={360} onChange={(v) => updateHsl(v, s, l)} />
        <SliderRow label="S" value={s} min={0} max={100} suffix="%" onChange={(v) => updateHsl(h, v, l)} />
        <SliderRow label="L" value={l} min={0} max={100} suffix="%" onChange={(v) => updateHsl(h, s, v)} />
      </div>
    </div>
  );
}

/** Compact slider row with label, slider, and value */
function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = '',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-mono text-muted-foreground w-3 shrink-0">{label}</span>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="flex-1"
      />
      <span className="text-[10px] font-mono text-muted-foreground w-10 text-right shrink-0">
        {step < 1 ? value.toFixed(2) : Math.round(value)}{suffix}
      </span>
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

/** Text field + slider for rem/px values */
function ThemeUnitField({
  label,
  value,
  onChange,
  min = 0,
  max = 4,
  step = 0.05,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const { num, unit } = parseUnit(value);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</Label>
          <Input className="h-7 text-[11px]" value={value} onChange={(e) => onChange(e.target.value)} />
        </div>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[num]}
        onValueChange={([v]) => onChange(`${v}${unit}`)}
      />
    </div>
  );
}

/** Number field + slider for plain numbers */
function ThemeNumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 5,
  step = 0.05,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</Label>
          <Input
            className="h-7 text-[11px]"
            type="number"
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
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
          <div className="space-y-3">
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
          <div className="space-y-3">
            <ThemeTextField label="Font Family" value={themeTokens.typography.fontFamily} onChange={(v) => update(['typography', 'fontFamily'], v)} />
            <ThemeUnitField
              label="Base Size"
              value={themeTokens.typography.baseSize}
              onChange={(v) => update(['typography', 'baseSize'], v)}
              min={8}
              max={32}
              step={1}
            />
            <ThemeNumberField
              label="Heading Scale"
              value={themeTokens.typography.headingScale}
              onChange={(v) => update(['typography', 'headingScale'], v)}
              min={1}
              max={2}
              step={0.05}
            />
          </div>

          <Separator className="my-3" />

          {/* Radius */}
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Bordes</p>
          <div className="space-y-3">
            <ThemeUnitField label="SM" value={themeTokens.radius.sm} onChange={(v) => update(['radius', 'sm'], v)} min={0} max={2} step={0.05} />
            <ThemeUnitField label="MD" value={themeTokens.radius.md} onChange={(v) => update(['radius', 'md'], v)} min={0} max={3} step={0.05} />
            <ThemeUnitField label="LG" value={themeTokens.radius.lg} onChange={(v) => update(['radius', 'lg'], v)} min={0} max={4} step={0.05} />
          </div>

          <Separator className="my-3" />

          {/* Spacing */}
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Espaciado</p>
          <div className="space-y-3">
            <ThemeUnitField label="XS" value={themeTokens.spacing.xs} onChange={(v) => update(['spacing', 'xs'], v)} min={0} max={2} step={0.05} />
            <ThemeUnitField label="SM" value={themeTokens.spacing.sm} onChange={(v) => update(['spacing', 'sm'], v)} min={0} max={3} step={0.05} />
            <ThemeUnitField label="MD" value={themeTokens.spacing.md} onChange={(v) => update(['spacing', 'md'], v)} min={0} max={4} step={0.05} />
            <ThemeUnitField label="LG" value={themeTokens.spacing.lg} onChange={(v) => update(['spacing', 'lg'], v)} min={0} max={6} step={0.1} />
            <ThemeUnitField label="XL" value={themeTokens.spacing.xl} onChange={(v) => update(['spacing', 'xl'], v)} min={0} max={8} step={0.1} />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
