import { NodeStyle } from '@/types/schema';
import React from 'react';

/** Keys that are NOT directly valid CSS properties — they're virtual/meta properties */
const META_KEYS = new Set<string>(['hover', 'focus', 'active', 'responsive', 'backgroundGradient']);

/**
 * Convert a NodeStyle object into a valid React.CSSProperties object,
 * handling virtual properties like backgroundGradient.
 */
export function nodeStyleToCSS(style: NodeStyle): React.CSSProperties {
  const css: Record<string, any> = {};

  for (const [key, value] of Object.entries(style)) {
    if (!value || META_KEYS.has(key)) continue;
    css[key] = value;
  }

  // Apply backgroundGradient as backgroundImage (layered with existing backgroundImage if present)
  if (style.backgroundGradient) {
    if (style.backgroundImage && !style.backgroundImage.startsWith('linear-gradient')) {
      // Layer gradient over image
      css.backgroundImage = `${style.backgroundGradient}, ${style.backgroundImage}`;
    } else {
      css.backgroundImage = style.backgroundGradient;
    }
  }

  return css as React.CSSProperties;
}

/**
 * Generate CSS rules for hover/focus/active pseudo-states for a node.
 * Returns a CSS string to inject into a <style> tag.
 */
export function generatePseudoStateCSS(nodeId: string, style: NodeStyle): string {
  const rules: string[] = [];

  const pseudoToCSS = (pseudo: string, overrides: Partial<NodeStyle> | undefined) => {
    if (!overrides) return;
    const entries = Object.entries(overrides).filter(([, v]) => v);
    if (entries.length === 0) return;

    const declarations = entries
      .map(([key, value]) => `${camelToKebab(key)}: ${value} !important`)
      .join('; ');

    rules.push(`[data-node-id="${nodeId}"]:${pseudo} { ${declarations}; }`);
  };

  pseudoToCSS('hover', style.hover);
  pseudoToCSS('focus', style.focus);
  pseudoToCSS('active', style.active);

  // Add transition if hover/focus/active is set but no transition defined
  if ((style.hover || style.focus || style.active) && !style.transition) {
    rules.push(`[data-node-id="${nodeId}"] { transition: all 0.2s ease; }`);
  }

  return rules.join('\n');
}

/**
 * Generate @container query CSS for responsive overrides.
 */
export function generateResponsiveCSS(nodeId: string, style: NodeStyle): string {
  if (!style.responsive) return '';

  const breakpoints: Record<string, string> = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  };

  const rules: string[] = [];

  for (const [bp, overrides] of Object.entries(style.responsive)) {
    if (!overrides) continue;
    const entries = Object.entries(overrides).filter(([, v]) => v);
    if (entries.length === 0) continue;

    const declarations = entries
      .map(([key, value]) => `${camelToKebab(key)}: ${value} !important`)
      .join('; ');

    const minWidth = breakpoints[bp];
    if (minWidth) {
      // Use @container for builder canvas, @media as fallback
      rules.push(`@container (min-width: ${minWidth}) { [data-node-id="${nodeId}"] { ${declarations}; } }`);
    }
  }

  return rules.join('\n');
}

/**
 * Merge global styles into a node's style object.
 * Local node styles take priority over global styles.
 */
export function mergeGlobalStyles(
  nodeStyle: NodeStyle,
  appliedIds: string[] | undefined,
  globalStyles: Record<string, { label: string; style: Partial<NodeStyle> }> | undefined
): NodeStyle {
  if (!appliedIds?.length || !globalStyles) return nodeStyle;

  let merged: NodeStyle = {};
  for (const id of appliedIds) {
    const gs = globalStyles[id];
    if (gs) {
      merged = { ...merged, ...gs.style };
    }
  }
  // Local overrides global
  return { ...merged, ...nodeStyle };
}

function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
}

/** Given an HSL string like "222 84% 4.9%", returns a contrasting foreground HSL */
function computeContrastForeground(hsl: string): string {
  const parts = hsl.replace(/%/g, '').trim().split(/\s+/).map(Number);
  const l = parts[2] ?? 50;
  return l < 50 ? '0 0% 98%' : '0 0% 3.9%';
}

/**
 * Convert ThemeTokens into inline CSS custom properties (same logic as PageRenderer).
 * Useful for scoping a template's theme onto a container div.
 */
export function themeTokensToCSS(t: import('@/types/schema').ThemeTokens): React.CSSProperties {
  return {
    '--primary': t.colors.primary,
    '--secondary': t.colors.secondary,
    '--background': t.colors.background,
    '--foreground': t.colors.text,
    '--muted': t.colors.muted,
    '--border': t.colors.border,
    '--accent': t.colors.accent || t.colors.secondary,
    '--accent-foreground': t.colors.text,
    '--primary-foreground': computeContrastForeground(t.colors.primary),
    '--secondary-foreground': computeContrastForeground(t.colors.secondary),
    '--muted-foreground': t.colors.muted,
    '--card': t.colors.background,
    '--card-foreground': t.colors.text,
    '--popover': t.colors.background,
    '--popover-foreground': t.colors.text,
    '--input': t.colors.border,
    fontFamily: t.typography.fontFamily,
    fontSize: t.typography.baseSize,
    '--nxr-heading-scale': String(t.typography.headingScale),
    '--radius': t.radius.md,
    '--nxr-radius-sm': t.radius.sm,
    '--nxr-radius-lg': t.radius.lg,
    '--nxr-space-xs': t.spacing.xs,
    '--nxr-space-sm': t.spacing.sm,
    '--nxr-space-md': t.spacing.md,
    '--nxr-space-lg': t.spacing.lg,
    '--nxr-space-xl': t.spacing.xl,
    color: `hsl(${t.colors.text})`,
    ...(t.gradient ? { backgroundImage: t.gradient } : {}),
  } as React.CSSProperties;
}
