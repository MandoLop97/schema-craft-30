import {
  Square, AlignVerticalJustifyStart, LayoutGrid, Columns,
  Type, ImageIcon, Minus, Tag,
  CreditCard, TextCursorInput, ShoppingBag, Navigation, PanelBottom,
  Megaphone, Sparkles, MessageSquareQuote, Mail, Layers,
  ListCollapse, LayoutDashboard, Play,
  MoveVertical, Star, Share2, FileText,
} from 'lucide-react';
import { NodeType, NodeProps, NodeStyle, TemplateType } from '@/types/schema';
import React from 'react';

export interface InspectorFieldDef {
  /** Property key on NodeProps */
  key: string;
  /** Display label */
  label: string;
  /** Field type */
  type: 'text' | 'select' | 'color' | 'number' | 'image' | 'toggle' | 'slider' | 'textarea' | 'link' | 'icon' | 'spacing' | 'group';
  /** Options for 'select' type */
  options?: { label: string; value: string }[];
  /** Min value for 'slider' and 'number' */
  min?: number;
  /** Max value for 'slider' and 'number' */
  max?: number;
  /** Step for 'slider' and 'number' */
  step?: number;
  /** Placeholder for 'text', 'textarea', 'link' */
  placeholder?: string;
  /** Rows for 'textarea' */
  rows?: number;
  /** Accept string for 'image' (e.g. "image/*") */
  accept?: string;
  /** Child fields for 'group' type */
  children?: InspectorFieldDef[];
  /** Default value */
  defaultValue?: any;
}

export interface CompositeNodeTree {
  rootId: string;
  nodes: Record<string, import('@/types/schema').SchemaNode>;
}

export interface BlockDefinition {
  type: NodeType;
  label: string;
  category: string;
  icon: React.ElementType;
  canHaveChildren: boolean;
  defaultProps: NodeProps;
  defaultStyle: NodeStyle;
  allowedParents?: NodeType[];
  allowedChildren?: NodeType[];
  inspectorFields?: InspectorFieldDef[];
  allowedTemplateTypes?: TemplateType[];
  /** Factory that generates a composite tree of child nodes when this block is created */
  compositeFactory?: () => CompositeNodeTree;
}

const uid = () => `node-${Math.random().toString(36).slice(2, 9)}`;

/** Composite factory for ProductCard — generates editable sub-nodes */
function createProductCardComposite(): CompositeNodeTree {
  const rootId = uid();
  const imgId = uid();
  const bodyId = uid();
  const titleId = uid();
  const priceRowId = uid();
  const priceId = uid();
  const btnId = uid();

  const nodes: Record<string, import('@/types/schema').SchemaNode> = {
    [rootId]: {
      id: rootId, type: 'ProductCard', props: { customName: 'Product Card' },
      style: { borderRadius: '0.75rem', overflow: 'hidden', borderWidth: '1px', borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--card))', transition: 'box-shadow 0.2s, transform 0.2s' },
      children: [imgId, bodyId],
    },
    [imgId]: {
      id: imgId, type: 'Image',
      props: { src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', alt: 'Product' },
      style: { width: '100%' },
      children: [],
    },
    [bodyId]: {
      id: bodyId, type: 'Stack', props: { direction: 'vertical' },
      style: { padding: '1rem', gap: '0.5rem' },
      children: [titleId, priceRowId, btnId],
    },
    [titleId]: {
      id: titleId, type: 'Text',
      props: { text: 'Product Name', level: 'h3' },
      style: { fontWeight: '500', fontSize: '0.95rem' },
      children: [],
    },
    [priceRowId]: {
      id: priceRowId, type: 'Stack', props: { direction: 'horizontal' },
      style: { gap: '0.5rem', alignItems: 'center' },
      children: [priceId],
    },
    [priceId]: {
      id: priceId, type: 'Text',
      props: { text: '$99' },
      style: { fontWeight: '600', fontSize: '1rem' },
      children: [],
    },
    [btnId]: {
      id: btnId, type: 'Button',
      props: { text: 'Add to Cart', variant: 'outline' },
      style: { width: '100%', marginTop: '0.25rem' },
      children: [],
    },
  };

  return { rootId, nodes };
}

// ── Category definitions for hierarchy ──
const LAYOUT_TYPES: NodeType[] = ['Section', 'Container', 'Grid', 'Stack'];
const SITE_TYPES: NodeType[] = ['Navbar', 'Footer', 'AnnouncementBar'];
const CONTENT_TYPES: NodeType[] = ['Text', 'Image', 'Divider', 'Badge', 'Spacer', 'Icon', 'SocialIcons', 'Button', 'Card', 'Input', 'ProductCard', 'TestimonialCard', 'NewsletterSection', 'FeatureBar', 'HeroSection', 'Accordion', 'TabsBlock', 'VideoEmbed', 'FormBlock'];

export const blockRegistry: BlockDefinition[] = [
  // ── Layout ──
  { type: 'Section', label: 'Section', category: 'Layout', icon: Square, canHaveChildren: true, defaultProps: {}, defaultStyle: { padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' } },
  { type: 'Container', label: 'Container', category: 'Layout', icon: AlignVerticalJustifyStart, canHaveChildren: true, defaultProps: {}, defaultStyle: { maxWidth: '72rem', margin: '0 auto' }, allowedParents: ['Section', 'Container', 'Grid', 'Stack'] },
  { type: 'Grid', label: 'Grid', category: 'Layout', icon: LayoutGrid, canHaveChildren: true, defaultProps: { columns: 3 }, defaultStyle: { gap: '1.5rem' }, allowedParents: ['Section', 'Container', 'Stack', 'Grid'] },
  { type: 'Stack', label: 'Stack', category: 'Layout', icon: Columns, canHaveChildren: true, defaultProps: { direction: 'vertical' }, defaultStyle: { gap: '1rem' }, allowedParents: ['Section', 'Container', 'Grid', 'Stack'] },

  // ── Content ──
  { type: 'Text', label: 'Text', category: 'Content', icon: Type, canHaveChildren: false, defaultProps: { text: 'New text block', level: 'p' }, defaultStyle: {} },
  { type: 'Image', label: 'Image', category: 'Content', icon: ImageIcon, canHaveChildren: false, defaultProps: { src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop', alt: 'Placeholder' }, defaultStyle: { width: '100%', borderRadius: '0.5rem' } },
  { type: 'Divider', label: 'Divider', category: 'Content', icon: Minus, canHaveChildren: false, defaultProps: {}, defaultStyle: {} },
  { type: 'Badge', label: 'Badge', category: 'Content', icon: Tag, canHaveChildren: false, defaultProps: { text: 'Badge' }, defaultStyle: {} },
  { type: 'Spacer', label: 'Spacer', category: 'Content', icon: MoveVertical, canHaveChildren: false, defaultProps: { height: '2rem' }, defaultStyle: {} },
  { type: 'Icon', label: 'Icon', category: 'Content', icon: Star, canHaveChildren: false, defaultProps: { iconName: 'Star', iconSize: '24', iconColor: 'currentColor' }, defaultStyle: {} },
  { type: 'SocialIcons', label: 'Social Icons', category: 'Content', icon: Share2, canHaveChildren: false, defaultProps: { socialItems: [{ platform: 'facebook', url: '' }, { platform: 'instagram', url: '' }, { platform: 'twitter', url: '' }], socialIconSize: '20', socialStyle: 'default' }, defaultStyle: {} },

  // ── UI ──
  { type: 'Button', label: 'Button', category: 'UI', icon: Square, canHaveChildren: false, defaultProps: { text: 'Button', variant: 'default' }, defaultStyle: {} },
  { type: 'Card', label: 'Card', category: 'UI', icon: CreditCard, canHaveChildren: false, defaultProps: { items: [{ title: 'Card Title', description: 'Card description goes here.' }] }, defaultStyle: { padding: '1.5rem' } },
  { type: 'Input', label: 'Input', category: 'UI', icon: TextCursorInput, canHaveChildren: false, defaultProps: { placeholder: 'Enter text...' }, defaultStyle: {} },
  // ── Interactive ──
  { type: 'Accordion', label: 'Accordion', category: 'Interactive', icon: ListCollapse, canHaveChildren: false, defaultProps: { panels: [{ title: 'What is this?', description: 'This is an accordion panel with collapsible content.' }, { title: 'How does it work?', description: 'Click on the header to expand or collapse each panel.' }] }, defaultStyle: {} },
  { type: 'TabsBlock', label: 'Tabs', category: 'Interactive', icon: LayoutDashboard, canHaveChildren: false, defaultProps: { panels: [{ title: 'Overview', description: 'This is the overview tab content.' }, { title: 'Details', description: 'Detailed information goes here.' }] }, defaultStyle: {} },
  { type: 'VideoEmbed', label: 'Video', category: 'Interactive', icon: Play, canHaveChildren: false, defaultProps: { videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', alt: 'Video' }, defaultStyle: { borderRadius: '0.5rem' } },
  { type: 'FormBlock', label: 'Form', category: 'Interactive', icon: FileText, canHaveChildren: false, defaultProps: { formTitle: 'Contáctanos', formFields: [{ type: 'text', label: 'Nombre', placeholder: 'Tu nombre', required: true }, { type: 'email', label: 'Email', placeholder: 'tu@email.com', required: true }, { type: 'tel', label: 'Teléfono', placeholder: '+1 234 567 890', required: false }, { type: 'textarea', label: 'Mensaje', placeholder: 'Escribe tu mensaje...', required: false }], formBtnText: 'Enviar', formBtnVariant: 'filled' }, defaultStyle: { padding: '1.5rem' } },

  // ── Commerce ──
  { type: 'ProductCard', label: 'Product Card', category: 'Commerce', icon: ShoppingBag, canHaveChildren: true, defaultProps: { text: 'Product Name', price: '$99', src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop' }, defaultStyle: {}, compositeFactory: createProductCardComposite },

  // ── Site ──
  { type: 'Navbar', label: 'Navbar', category: 'Site', icon: Navigation, canHaveChildren: false, defaultProps: { logoText: 'Brand', links: [{ text: 'Home', href: '#' }] }, defaultStyle: {}, allowedParents: ['Section'], allowedTemplateTypes: ['header'] },
  { type: 'Footer', label: 'Footer', category: 'Site', icon: PanelBottom, canHaveChildren: false, defaultProps: { logoText: 'Brand', copyright: '© 2026', links: [{ text: 'Privacy', href: '#' }] }, defaultStyle: {}, allowedParents: ['Section'], allowedTemplateTypes: ['footer'] },

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

export function registerBlocks(defs: BlockDefinition[]): void {
  defs.forEach(registerBlock);
}

export function getCategories(): string[] {
  return [...new Set(blockRegistry.map((b) => b.category))];
}

export function getBlocksByCategory(category: string, templateType?: TemplateType): BlockDefinition[] {
  return blockRegistry.filter((b) => {
    if (b.category !== category) return false;
    if (templateType && b.allowedTemplateTypes && b.allowedTemplateTypes.length > 0) {
      return b.allowedTemplateTypes.includes(templateType);
    }
    return true;
  });
}

export function getCategoriesForTemplate(templateType?: TemplateType): string[] {
  return getCategories().filter((cat) => getBlocksByCategory(cat, templateType).length > 0);
}

export function canDropInto(childType: NodeType, parentType: NodeType, isRoot: boolean): boolean {
  const childDef = getBlockDef(childType);
  const parentDef = getBlockDef(parentType);

  if (!childDef || !parentDef) return false;
  if (!parentDef.canHaveChildren && !isRoot) return false;

  if (isRoot) {
    const rootAllowed: NodeType[] = [...LAYOUT_TYPES, ...SITE_TYPES, 'HeroSection', 'NewsletterSection', 'FeatureBar', 'Accordion', 'TabsBlock', 'VideoEmbed'];
    return rootAllowed.includes(childType);
  }

  if (childDef.allowedParents && childDef.allowedParents.length > 0) {
    if (!childDef.allowedParents.includes(parentType)) return false;
  }

  if (parentDef.allowedChildren && parentDef.allowedChildren.length > 0) {
    if (!parentDef.allowedChildren.includes(childType)) return false;
  }

  return true;
}
