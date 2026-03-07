import {
  Square, AlignVerticalJustifyStart, LayoutGrid, Columns,
  Type, ImageIcon, Minus, Tag,
  CreditCard, TextCursorInput, ShoppingBag, Navigation, PanelBottom,
  Megaphone, Sparkles, MessageSquareQuote, Mail, Layers,
  ListCollapse, LayoutDashboard, Play,
} from 'lucide-react';
import { NodeType, NodeProps, NodeStyle } from '@/types/schema';
import React from 'react';

export interface BlockDefinition {
  type: NodeType;
  label: string;
  category: string;
  icon: React.ElementType;
  canHaveChildren: boolean;
  defaultProps: NodeProps;
  defaultStyle: NodeStyle;
  /**
   * Which parent node types this block can be dropped into.
   * Empty array = can go anywhere (root or any container).
   * undefined = can go anywhere.
   */
  allowedParents?: NodeType[];
  /**
   * Which child node types this container accepts.
   * undefined = accepts anything allowed.
   * Only relevant for canHaveChildren=true blocks.
   */
  allowedChildren?: NodeType[];
}

// ── Category definitions for hierarchy ──

/** Layout blocks: structural containers */
const LAYOUT_TYPES: NodeType[] = ['Section', 'Container', 'Grid', 'Stack'];
/** Site-level blocks: should only be at root or inside Section */
const SITE_TYPES: NodeType[] = ['Navbar', 'Footer', 'AnnouncementBar'];
/** Content that goes inside any container */
const CONTENT_TYPES: NodeType[] = ['Text', 'Image', 'Divider', 'Badge', 'Button', 'Card', 'Input', 'ProductCard', 'TestimonialCard', 'NewsletterSection', 'FeatureBar', 'HeroSection', 'Accordion', 'TabsBlock', 'VideoEmbed'];

export const blockRegistry: BlockDefinition[] = [
  // ── Layout ── (can nest inside other layout, but Section is top-level preferred)
  { type: 'Section', label: 'Section', category: 'Layout', icon: Square, canHaveChildren: true, defaultProps: {}, defaultStyle: { padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' } },
  { type: 'Container', label: 'Container', category: 'Layout', icon: AlignVerticalJustifyStart, canHaveChildren: true, defaultProps: {}, defaultStyle: { maxWidth: '72rem', margin: '0 auto' }, allowedParents: ['Section', 'Container', 'Grid', 'Stack'] },
  { type: 'Grid', label: 'Grid', category: 'Layout', icon: LayoutGrid, canHaveChildren: true, defaultProps: { columns: 3 }, defaultStyle: { gap: '1.5rem' }, allowedParents: ['Section', 'Container', 'Stack', 'Grid'] },
  { type: 'Stack', label: 'Stack', category: 'Layout', icon: Columns, canHaveChildren: true, defaultProps: { direction: 'vertical' }, defaultStyle: { gap: '1rem' }, allowedParents: ['Section', 'Container', 'Grid', 'Stack'] },

  // ── Content ── (can go in any container)
  { type: 'Text', label: 'Text', category: 'Content', icon: Type, canHaveChildren: false, defaultProps: { text: 'New text block', level: 'p' }, defaultStyle: {} },
  { type: 'Image', label: 'Image', category: 'Content', icon: ImageIcon, canHaveChildren: false, defaultProps: { src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop', alt: 'Placeholder' }, defaultStyle: { width: '100%', borderRadius: '0.5rem' } },
  { type: 'Divider', label: 'Divider', category: 'Content', icon: Minus, canHaveChildren: false, defaultProps: {}, defaultStyle: {} },
  { type: 'Badge', label: 'Badge', category: 'Content', icon: Tag, canHaveChildren: false, defaultProps: { text: 'Badge' }, defaultStyle: {} },

  // ── UI ── (can go in any container)
  { type: 'Button', label: 'Button', category: 'UI', icon: Square, canHaveChildren: false, defaultProps: { text: 'Button', variant: 'default' }, defaultStyle: {} },
  { type: 'Card', label: 'Card', category: 'UI', icon: CreditCard, canHaveChildren: false, defaultProps: { items: [{ title: 'Card Title', description: 'Card description goes here.' }] }, defaultStyle: { padding: '1.5rem' } },
  { type: 'Input', label: 'Input', category: 'UI', icon: TextCursorInput, canHaveChildren: false, defaultProps: { placeholder: 'Enter text...' }, defaultStyle: {} },
  // ── Interactive ──
  { type: 'Accordion', label: 'Accordion', category: 'Interactive', icon: ListCollapse, canHaveChildren: false, defaultProps: { panels: [{ title: 'What is this?', description: 'This is an accordion panel with collapsible content.' }, { title: 'How does it work?', description: 'Click on the header to expand or collapse each panel.' }] }, defaultStyle: {} },
  { type: 'TabsBlock', label: 'Tabs', category: 'Interactive', icon: LayoutDashboard, canHaveChildren: false, defaultProps: { panels: [{ title: 'Overview', description: 'This is the overview tab content.' }, { title: 'Details', description: 'Detailed information goes here.' }] }, defaultStyle: {} },
  { type: 'VideoEmbed', label: 'Video', category: 'Interactive', icon: Play, canHaveChildren: false, defaultProps: { videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', alt: 'Video' }, defaultStyle: { borderRadius: '0.5rem' } },

  // ── Commerce ──
  { type: 'ProductCard', label: 'Product Card', category: 'Commerce', icon: ShoppingBag, canHaveChildren: false, defaultProps: { text: 'Product Name', price: '$99', src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop' }, defaultStyle: {} },

  // ── Site ── (top-level or inside Section only)
  { type: 'Navbar', label: 'Navbar', category: 'Site', icon: Navigation, canHaveChildren: false, defaultProps: { logoText: 'Brand', links: [{ text: 'Home', href: '#' }] }, defaultStyle: {}, allowedParents: ['Section'] },
  { type: 'Footer', label: 'Footer', category: 'Site', icon: PanelBottom, canHaveChildren: false, defaultProps: { logoText: 'Brand', copyright: '© 2026', links: [{ text: 'Privacy', href: '#' }] }, defaultStyle: {}, allowedParents: ['Section'] },

  // ── Template Custom ──
  { type: 'AnnouncementBar', label: 'Announcement Bar', category: 'Template', icon: Megaphone, canHaveChildren: false, defaultProps: { text: '🎉 Free shipping on orders over $50!', href: '#' }, defaultStyle: {}, allowedParents: ['Section'] },
  { type: 'FeatureBar', label: 'Feature Bar', category: 'Template', icon: Sparkles, canHaveChildren: false, defaultProps: { items: [{ icon: 'truck', title: 'Free Shipping', description: 'On orders over $50' }, { icon: 'shield', title: 'Secure Payment', description: '100% protected' }, { icon: 'refresh', title: 'Easy Returns', description: '30 day return policy' }] }, defaultStyle: {} },
  { type: 'TestimonialCard', label: 'Testimonial', category: 'Template', icon: MessageSquareQuote, canHaveChildren: false, defaultProps: { text: '"This product changed my life!"', label: 'Jane Doe', variant: '5' }, defaultStyle: {} },
  { type: 'NewsletterSection', label: 'Newsletter', category: 'Template', icon: Mail, canHaveChildren: false, defaultProps: { text: 'Stay in the loop', label: 'Get the latest updates delivered to your inbox.', placeholder: 'Enter your email' }, defaultStyle: { padding: '3rem 2rem', textAlign: 'center' } },
  { type: 'HeroSection', label: 'Hero Section', category: 'Template', icon: Layers, canHaveChildren: false, defaultProps: { text: 'Build Something Amazing', subtitle: 'The all-in-one platform to launch your next big idea — fast, beautiful, and effortless.', ctaText: 'Get Started', ctaHref: '#', src: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=800&fit=crop', overlayOpacity: '0.55' }, defaultStyle: { minHeight: '32rem', padding: '4rem 2rem' } },
];

const registryMap = new Map<NodeType, BlockDefinition>();
blockRegistry.forEach((b) => registryMap.set(b.type, b));

export function getBlockDef(type: NodeType): BlockDefinition | undefined {
  return registryMap.get(type);
}

/**
 * Register a custom block definition at runtime.
 * It will appear in the blocks palette and support drag-and-drop.
 * If a block with the same type already exists it will be replaced.
 */
export function registerBlock(def: BlockDefinition): void {
  const existing = registryMap.get(def.type);
  if (existing) {
    const idx = blockRegistry.indexOf(existing);
    if (idx !== -1) blockRegistry.splice(idx, 1, def);
  } else {
    blockRegistry.push(def);
  }
  registryMap.set(def.type, def);
}

/** Register multiple custom blocks at once. */
export function registerBlocks(defs: BlockDefinition[]): void {
  defs.forEach(registerBlock);
}

export function getCategories(): string[] {
  return [...new Set(blockRegistry.map((b) => b.category))];
}

export function getBlocksByCategory(category: string): BlockDefinition[] {
  return blockRegistry.filter((b) => b.category === category);
}

/**
 * Check if a child node type can be placed inside a given parent node type.
 * - If child has allowedParents defined, parent must be in that list OR be the root.
 * - If parent has allowedChildren defined, child must be in that list.
 * - Otherwise, parent must be a container (canHaveChildren).
 */
export function canDropInto(childType: NodeType, parentType: NodeType, isRoot: boolean): boolean {
  const childDef = getBlockDef(childType);
  const parentDef = getBlockDef(parentType);

  if (!childDef || !parentDef) return false;

  // Parent must be a container
  if (!parentDef.canHaveChildren && !isRoot) return false;

  // If root (the Page-level container), allow layout and site blocks
  if (isRoot) {
    // Only layout and site-level blocks at root
    const rootAllowed: NodeType[] = [...LAYOUT_TYPES, ...SITE_TYPES, 'HeroSection', 'NewsletterSection', 'FeatureBar', 'Accordion', 'TabsBlock', 'VideoEmbed'];
    return rootAllowed.includes(childType);
  }

  // Check child's allowedParents constraint
  if (childDef.allowedParents && childDef.allowedParents.length > 0) {
    if (!childDef.allowedParents.includes(parentType)) return false;
  }

  // Check parent's allowedChildren constraint
  if (parentDef.allowedChildren && parentDef.allowedChildren.length > 0) {
    if (!parentDef.allowedChildren.includes(childType)) return false;
  }

  return true;
}
