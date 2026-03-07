import { NodeStyle } from '@/types/schema';

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

function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
}
