import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Paintbrush } from 'lucide-react';

interface GradientEditorProps {
  value: string;
  onChange: (gradient: string) => void;
}

const GRADIENT_PRESETS = [
  { name: 'Sunset', value: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)' },
  { name: 'Ocean', value: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #22c55e 0%, #06b6d4 100%)' },
  { name: 'Aurora', value: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 50%, #22c55e 100%)' },
  { name: 'Ember', value: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)' },
  { name: 'Midnight', value: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)' },
  { name: 'Rose', value: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' },
  { name: 'Dawn', value: 'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ef4444 100%)' },
];

const DIRECTIONS = [
  { label: '→', value: '90deg' },
  { label: '↘', value: '135deg' },
  { label: '↓', value: '180deg' },
  { label: '↙', value: '225deg' },
  { label: '←', value: '270deg' },
  { label: '↖', value: '315deg' },
  { label: '↑', value: '0deg' },
  { label: '↗', value: '45deg' },
];

export function GradientEditor({ value, onChange }: GradientEditorProps) {
  const [color1, setColor1] = useState('#3b82f6');
  const [color2, setColor2] = useState('#8b5cf6');
  const [direction, setDirection] = useState('135deg');

  const applyCustom = (c1?: string, c2?: string, dir?: string) => {
    const finalC1 = c1 ?? color1;
    const finalC2 = c2 ?? color2;
    const finalDir = dir ?? direction;
    onChange(`linear-gradient(${finalDir}, ${finalC1} 0%, ${finalC2} 100%)`);
  };

  return (
    <div className="space-y-2">
      {/* Current preview */}
      {value && (
        <div
          className="h-8 rounded-md border border-border relative overflow-hidden"
          style={{ background: value }}
        >
          <button
            className="absolute top-0.5 right-0.5 text-[9px] px-1.5 py-0.5 rounded bg-background/70 backdrop-blur-sm text-muted-foreground hover:text-destructive transition-colors"
            onClick={() => onChange('')}
          >
            ✕
          </button>
        </div>
      )}

      {/* Presets */}
      <div>
        <Label className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1 block">Presets</Label>
        <div className="grid grid-cols-4 gap-1">
          {GRADIENT_PRESETS.map((preset) => (
            <button
              key={preset.name}
              className="h-6 rounded-md border border-border cursor-pointer transition-all hover:scale-105 hover:ring-1 hover:ring-primary/30"
              style={{ background: preset.value }}
              onClick={() => onChange(preset.value)}
              title={preset.name}
            />
          ))}
        </div>
      </div>

      {/* Custom editor */}
      <div className="space-y-1.5">
        <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Personalizado</Label>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={color1}
            onChange={(e) => { setColor1(e.target.value); applyCustom(e.target.value, undefined, undefined); }}
            className="h-6 w-6 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
          />
          <div className="flex-1 h-4 rounded" style={{ background: `linear-gradient(90deg, ${color1}, ${color2})` }} />
          <input
            type="color"
            value={color2}
            onChange={(e) => { setColor2(e.target.value); applyCustom(undefined, e.target.value, undefined); }}
            className="h-6 w-6 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
          />
        </div>

        {/* Direction picker */}
        <div className="flex items-center gap-1 flex-wrap">
          {DIRECTIONS.map((d) => (
            <button
              key={d.value}
              className={`h-6 w-6 rounded text-[10px] border transition-all ${
                direction === d.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30'
              }`}
              onClick={() => { setDirection(d.value); applyCustom(undefined, undefined, d.value); }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Raw input */}
      <Input
        className="h-6 text-[10px] font-mono"
        placeholder="linear-gradient(...)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
