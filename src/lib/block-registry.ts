import {
  Square, AlignVerticalJustifyStart, LayoutGrid, Columns,
  Type, ImageIcon, Minus, Tag,
  CreditCard, TextCursorInput, ShoppingBag, Navigation, PanelBottom,
  Megaphone, Sparkles, MessageSquareQuote, Mail, Layers,
  ListCollapse, LayoutDashboard, Play,
  MoveVertical, Star, Share2, FileText,
  Image, AlignCenter, MessageCircle, HelpCircle, Grid3X3,
} from 'lucide-react';
import { NodeType, NodeProps, NodeStyle, TemplateType, SchemaNode } from '@/types/schema';
import React from 'react';

export interface InspectorFieldDef {
  /** Property key on NodeProps */
  key: string;
  /** Display label */
  label: string;
  /** Field type */
  type: 'text' | 'select' | 'color' | 'number' | 'image' | 'toggle' | 'slider' | 'textarea' | 'link' | 'icon' | 'spacing' | 'group' | 'binding';
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
  /** For binding type: allowed data sources */
  allowedDataSources?: string[];
  /** For binding type: available fields */
  bindableFields?: string[];
}

export interface CompositeNodeTree {
  rootId: string;
  nodes: Record<string, SchemaNode>;
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
  /** Whether this block supports data binding */
  supportsBinding?: boolean;
  /** Description for documentation */
  description?: string;
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

  const nodes: Record<string, SchemaNode> = {
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
      style: { width: '100%', margin: '0.25rem 0 0 0' },
      children: [], locked: true,
    },
  };

  return { rootId, nodes };
}

// ── Category definitions for hierarchy ──
const LAYOUT_TYPES: NodeType[] = ['Section', 'Container', 'Grid', 'Stack'];
const SITE_TYPES: NodeType[] = ['Navbar', 'Footer', 'AnnouncementBar'];
const CONTENT_TYPES: NodeType[] = ['Text', 'Image', 'Divider', 'Badge', 'Spacer', 'Icon', 'SocialIcons', 'Button', 'Card', 'Input', 'ProductCard', 'TestimonialCard', 'NewsletterSection', 'FeatureBar', 'HeroSection', 'Accordion', 'TabsBlock', 'VideoEmbed', 'FormBlock'];

export const blockRegistry: BlockDefinition[] = [
  // ══════════════════════════════════════════════════════════════════════════
  // LAYOUT BLOCKS
  // ══════════════════════════════════════════════════════════════════════════
  { 
    type: 'Section', 
    label: 'Section', 
    category: 'Layout', 
    icon: Square, 
    canHaveChildren: true, 
    defaultProps: {}, 
    defaultStyle: { padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
    description: 'Full-width container section for page content',
  },
  { 
    type: 'Container', 
    label: 'Container', 
    category: 'Layout', 
    icon: AlignVerticalJustifyStart, 
    canHaveChildren: true, 
    defaultProps: {}, 
    defaultStyle: { maxWidth: '72rem', margin: '0 auto' }, 
    allowedParents: ['Section', 'Container', 'Grid', 'Stack'],
    description: 'Centered container with max-width',
  },
  { 
    type: 'Grid', 
    label: 'Grid', 
    category: 'Layout', 
    icon: LayoutGrid, 
    canHaveChildren: true, 
    defaultProps: { columns: 3 }, 
    defaultStyle: { gap: '1.5rem' }, 
    allowedParents: ['Section', 'Container', 'Stack', 'Grid'],
    description: 'Responsive grid layout',
  },
  { 
    type: 'Stack', 
    label: 'Stack', 
    category: 'Layout', 
    icon: Columns, 
    canHaveChildren: true, 
    defaultProps: { direction: 'vertical' }, 
    defaultStyle: { gap: '1rem' }, 
    allowedParents: ['Section', 'Container', 'Grid', 'Stack'],
    description: 'Flexbox stack (horizontal or vertical)',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CONTENT BLOCKS
  // ══════════════════════════════════════════════════════════════════════════
  { 
    type: 'Text', 
    label: 'Text', 
    category: 'Content', 
    icon: Type, 
    canHaveChildren: false, 
    defaultProps: { text: 'New text block', level: 'p' }, 
    defaultStyle: {},
    description: 'Text element (headings, paragraphs, spans)',
  },
  { 
    type: 'Image', 
    label: 'Image', 
    category: 'Content', 
    icon: ImageIcon, 
    canHaveChildren: false, 
    defaultProps: { src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop', alt: 'Placeholder' }, 
    defaultStyle: { width: '100%', borderRadius: '0.5rem' },
    description: 'Image element with alt text',
  },
  { 
    type: 'Divider', 
    label: 'Divider', 
    category: 'Content', 
    icon: Minus, 
    canHaveChildren: false, 
    defaultProps: {}, 
    defaultStyle: {},
    description: 'Horizontal divider line',
  },
  { 
    type: 'Badge', 
    label: 'Badge', 
    category: 'Content', 
    icon: Tag, 
    canHaveChildren: false, 
    defaultProps: { text: 'Badge' }, 
    defaultStyle: {},
    description: 'Small badge/tag element',
  },
  { 
    type: 'Spacer', 
    label: 'Spacer', 
    category: 'Content', 
    icon: MoveVertical, 
    canHaveChildren: false, 
    defaultProps: { height: '2rem' }, 
    defaultStyle: {},
    description: 'Vertical space between elements',
  },
  { 
    type: 'Icon', 
    label: 'Icon', 
    category: 'Content', 
    icon: Star, 
    canHaveChildren: false, 
    defaultProps: { iconName: 'Star', iconSize: '24', iconColor: 'currentColor' }, 
    defaultStyle: {},
    description: 'SVG icon from Lucide library',
  },
  { 
    type: 'SocialIcons', 
    label: 'Social Icons', 
    category: 'Content', 
    icon: Share2, 
    canHaveChildren: false, 
    defaultProps: { socialItems: [{ platform: 'facebook', url: '' }, { platform: 'instagram', url: '' }, { platform: 'twitter', url: '' }], socialIconSize: '20', socialStyle: 'default' }, 
    defaultStyle: {},
    description: 'Social media icon links',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // UI BLOCKS
  // ══════════════════════════════════════════════════════════════════════════
  { 
    type: 'Button', 
    label: 'Button', 
    category: 'UI', 
    icon: Square, 
    canHaveChildren: false, 
    defaultProps: { text: 'Button', variant: 'default' }, 
    defaultStyle: {},
    description: 'Clickable button with variants',
  },
  { 
    type: 'Card', 
    label: 'Card', 
    category: 'UI', 
    icon: CreditCard, 
    canHaveChildren: false, 
    defaultProps: { items: [{ title: 'Card Title', description: 'Card description goes here.' }] }, 
    defaultStyle: { padding: '1.5rem' },
    description: 'Content card with title and description',
  },
  { 
    type: 'Input', 
    label: 'Input', 
    category: 'UI', 
    icon: TextCursorInput, 
    canHaveChildren: false, 
    defaultProps: { placeholder: 'Enter text...' }, 
    defaultStyle: {},
    description: 'Form input field',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // INTERACTIVE BLOCKS
  // ══════════════════════════════════════════════════════════════════════════
  { 
    type: 'Accordion', 
    label: 'Accordion', 
    category: 'Interactive', 
    icon: ListCollapse, 
    canHaveChildren: false, 
    defaultProps: { panels: [{ title: 'What is this?', description: 'This is an accordion panel with collapsible content.' }, { title: 'How does it work?', description: 'Click on the header to expand or collapse each panel.' }] }, 
    defaultStyle: {},
    description: 'Collapsible accordion panels',
  },
  { 
    type: 'TabsBlock', 
    label: 'Tabs', 
    category: 'Interactive', 
    icon: LayoutDashboard, 
    canHaveChildren: false, 
    defaultProps: { panels: [{ title: 'Overview', description: 'This is the overview tab content.' }, { title: 'Details', description: 'Detailed information goes here.' }] }, 
    defaultStyle: {},
    description: 'Tabbed content switcher',
  },
  { 
    type: 'VideoEmbed', 
    label: 'Video', 
    category: 'Interactive', 
    icon: Play, 
    canHaveChildren: false, 
    defaultProps: { videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', alt: 'Video' }, 
    defaultStyle: { borderRadius: '0.5rem' },
    description: 'YouTube/Vimeo video embed',
  },
  { 
    type: 'FormBlock', 
    label: 'Form', 
    category: 'Interactive', 
    icon: FileText, 
    canHaveChildren: false, 
    defaultProps: { formTitle: 'Contáctanos', formFields: [{ type: 'text', label: 'Nombre', placeholder: 'Tu nombre', required: true }, { type: 'email', label: 'Email', placeholder: 'tu@email.com', required: true }, { type: 'tel', label: 'Teléfono', placeholder: '+1 234 567 890', required: false }, { type: 'textarea', label: 'Mensaje', placeholder: 'Escribe tu mensaje...', required: false }], formBtnText: 'Enviar', formBtnVariant: 'filled' }, 
    defaultStyle: { padding: '1.5rem' },
    description: 'Contact form with configurable fields',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // COMMERCE BLOCKS — E-commerce specific, support data binding
  // ══════════════════════════════════════════════════════════════════════════
  { 
    type: 'ProductCard', 
    label: 'Product Card', 
    category: 'Commerce', 
    icon: ShoppingBag, 
    canHaveChildren: true, 
    defaultProps: { text: 'Product Name', price: '$99', src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop' }, 
    defaultStyle: {}, 
    compositeFactory: createProductCardComposite,
    supportsBinding: true,
    description: 'Product card with image, title, price, and CTA',
  },
  { 
    type: 'ProductGrid', 
    label: 'Product Grid', 
    category: 'Commerce', 
    icon: LayoutGrid, 
    canHaveChildren: false, 
    defaultProps: { columns: 4, limit: 8, category: '', gap: '1.5rem' }, 
    defaultStyle: { padding: '2rem' }, 
    supportsBinding: true,
    inspectorFields: [
      { key: 'columns', label: 'Columns', type: 'select', options: [{ label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4', value: '4' }] },
      { key: 'limit', label: 'Product Limit', type: 'number', min: 1, max: 50 },
      { key: 'category', label: 'Category Filter', type: 'text', placeholder: 'Leave empty for all' },
      { key: 'gap', label: 'Gap', type: 'select', options: [{ label: 'Small', value: '1rem' }, { label: 'Medium', value: '1.5rem' }, { label: 'Large', value: '2rem' }] },
    ],
    description: 'Grid of products, bound to product catalog',
  },
  { 
    type: 'CollectionGrid', 
    label: 'Collection Grid', 
    category: 'Commerce', 
    icon: Grid3X3, 
    canHaveChildren: false, 
    defaultProps: { columns: 3, limit: 6, gap: '1.5rem', showTitle: true, showCount: true }, 
    defaultStyle: { padding: '2rem' }, 
    supportsBinding: true,
    inspectorFields: [
      { key: 'columns', label: 'Columns', type: 'select', options: [{ label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4', value: '4' }] },
      { key: 'limit', label: 'Limit', type: 'number', min: 1, max: 20 },
      { key: 'gap', label: 'Gap', type: 'select', options: [{ label: 'Small', value: '1rem' }, { label: 'Medium', value: '1.5rem' }, { label: 'Large', value: '2rem' }] },
      { key: 'showTitle', label: 'Show Titles', type: 'toggle' },
      { key: 'showCount', label: 'Show Product Count', type: 'toggle' },
    ],
    description: 'Grid of product collections/categories',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SITE BLOCKS — Global elements (header/footer)
  // ══════════════════════════════════════════════════════════════════════════
  { 
    type: 'Navbar', 
    label: 'Navbar', 
    category: 'Site', 
    icon: Navigation, 
    canHaveChildren: false, 
    defaultProps: { logoText: 'Brand', links: [{ text: 'Home', href: '#' }] }, 
    defaultStyle: {}, 
    allowedParents: ['Section'], 
    allowedTemplateTypes: ['header'],
    description: 'Site navigation bar with logo, links, and actions',
  },
  { 
    type: 'Footer', 
    label: 'Footer', 
    category: 'Site', 
    icon: PanelBottom, 
    canHaveChildren: false, 
    defaultProps: { logoText: 'Brand', copyright: '© 2026', links: [{ text: 'Privacy', href: '#' }] }, 
    defaultStyle: {}, 
    allowedParents: ['Section'], 
    allowedTemplateTypes: ['footer'],
    description: 'Site footer with links and copyright',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // TEMPLATE BLOCKS — E-commerce template-specific blocks
  // ══════════════════════════════════════════════════════════════════════════
  { 
    type: 'AnnouncementBar', 
    label: 'Announcement Bar', 
    category: 'Template', 
    icon: Megaphone, 
    canHaveChildren: false, 
    defaultProps: { text: '🎉 Free shipping on orders over $50!', href: '#' }, 
    defaultStyle: {}, 
    allowedParents: ['Section'],
    description: 'Top announcement banner',
  },
  { 
    type: 'FeatureBar', 
    label: 'Feature Bar', 
    category: 'Template', 
    icon: Sparkles, 
    canHaveChildren: false, 
    defaultProps: { items: [{ icon: 'truck', title: 'Free Shipping', description: 'On orders over $50' }, { icon: 'shield', title: 'Secure Payment', description: '100% protected' }, { icon: 'refresh', title: 'Easy Returns', description: '30 day return policy' }] }, 
    defaultStyle: {},
    description: 'Trust/feature icons bar',
  },
  { 
    type: 'TestimonialCard', 
    label: 'Testimonial', 
    category: 'Template', 
    icon: MessageSquareQuote, 
    canHaveChildren: false, 
    defaultProps: { text: '"This product changed my life!"', label: 'Jane Doe', variant: '5' }, 
    defaultStyle: {},
    description: 'Single customer testimonial',
  },
  { 
    type: 'NewsletterSection', 
    label: 'Newsletter', 
    category: 'Template', 
    icon: Mail, 
    canHaveChildren: false, 
    defaultProps: { text: 'Stay in the loop', label: 'Get the latest updates delivered to your inbox.', placeholder: 'Enter your email' }, 
    defaultStyle: { padding: '3rem 2rem', textAlign: 'center' },
    description: 'Email newsletter signup section',
  },
  { 
    type: 'HeroSection', 
    label: 'Hero Section', 
    category: 'Template', 
    icon: Layers, 
    canHaveChildren: false, 
    defaultProps: { text: 'Build Something Amazing', subtitle: 'The all-in-one platform to launch your next big idea — fast, beautiful, and effortless.', ctaText: 'Get Started', ctaHref: '#', src: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=800&fit=crop', overlayOpacity: '0.55' }, 
    defaultStyle: { minHeight: '32rem', padding: '4rem 2rem' },
    supportsBinding: true,
    description: 'Full-width hero with background image and CTA',
  },
  { 
    type: 'ImageBanner', 
    label: 'Image Banner', 
    category: 'Template', 
    icon: Image, 
    canHaveChildren: false, 
    defaultProps: { 
      src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=600&fit=crop', 
      alt: 'Banner image',
      href: '#',
      overlayText: 'Shop the Collection',
      overlayPosition: 'center',
    }, 
    defaultStyle: { width: '100%', minHeight: '300px', borderRadius: '0.5rem' },
    inspectorFields: [
      { key: 'src', label: 'Image URL', type: 'image' },
      { key: 'alt', label: 'Alt Text', type: 'text' },
      { key: 'href', label: 'Link', type: 'link', placeholder: '/products' },
      { key: 'overlayText', label: 'Overlay Text', type: 'text' },
      { key: 'overlayPosition', label: 'Text Position', type: 'select', options: [{ label: 'Top', value: 'top' }, { label: 'Center', value: 'center' }, { label: 'Bottom', value: 'bottom' }] },
    ],
    description: 'Clickable promotional banner with overlay text',
  },
  { 
    type: 'RichTextSection', 
    label: 'Rich Text', 
    category: 'Template', 
    icon: AlignCenter, 
    canHaveChildren: false, 
    defaultProps: { 
      content: '# About Our Store\n\nWe believe in quality products that stand the test of time. Our commitment to excellence drives everything we do.\n\n## Our Mission\n\nTo provide exceptional products with outstanding customer service.',
      columns: 1,
    }, 
    defaultStyle: { padding: '3rem 2rem', maxWidth: '48rem', margin: '0 auto' },
    inspectorFields: [
      { key: 'content', label: 'Content (Markdown)', type: 'textarea', rows: 10, placeholder: '# Heading\n\nParagraph text...' },
      { key: 'columns', label: 'Columns', type: 'select', options: [{ label: '1 Column', value: '1' }, { label: '2 Columns', value: '2' }] },
    ],
    description: 'Markdown-style rich text content section',
  },
  { 
    type: 'CTASection', 
    label: 'CTA Section', 
    category: 'Template', 
    icon: Megaphone, 
    canHaveChildren: false, 
    defaultProps: { 
      heading: 'Ready to get started?',
      description: 'Join thousands of satisfied customers and transform your shopping experience.',
      primaryCtaText: 'Shop Now',
      primaryCtaHref: '/products',
      secondaryCtaText: 'Learn More',
      secondaryCtaHref: '/help',
      backgroundStyle: 'gradient',
    }, 
    defaultStyle: { padding: '4rem 2rem', textAlign: 'center' },
    inspectorFields: [
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
      { key: 'primaryCtaText', label: 'Primary Button Text', type: 'text' },
      { key: 'primaryCtaHref', label: 'Primary Button Link', type: 'link' },
      { key: 'secondaryCtaText', label: 'Secondary Button Text', type: 'text' },
      { key: 'secondaryCtaHref', label: 'Secondary Button Link', type: 'link' },
      { key: 'backgroundStyle', label: 'Background Style', type: 'select', options: [{ label: 'Solid', value: 'solid' }, { label: 'Gradient', value: 'gradient' }, { label: 'Image', value: 'image' }] },
      { key: 'backgroundImage', label: 'Background Image', type: 'image' },
    ],
    description: 'Call-to-action section with primary and secondary buttons',
  },
  { 
    type: 'TestimonialSection', 
    label: 'Testimonials', 
    category: 'Template', 
    icon: MessageCircle, 
    canHaveChildren: false, 
    defaultProps: { 
      heading: 'What Our Customers Say',
      testimonials: [
        { quote: 'Absolutely love the quality!', author: 'Sarah M.', rating: 5 },
        { quote: 'Fast shipping and great service.', author: 'John D.', rating: 5 },
        { quote: 'Best purchase I\'ve made this year.', author: 'Emily R.', rating: 5 },
      ],
      layout: 'grid',
    }, 
    defaultStyle: { padding: '4rem 2rem', backgroundColor: 'hsl(var(--secondary))' },
    supportsBinding: true,
    inspectorFields: [
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'layout', label: 'Layout', type: 'select', options: [{ label: 'Grid', value: 'grid' }, { label: 'Carousel', value: 'carousel' }, { label: 'Stack', value: 'stack' }] },
    ],
    description: 'Customer testimonials section with multiple layouts',
  },
  { 
    type: 'FAQSection', 
    label: 'FAQ Section', 
    category: 'Template', 
    icon: HelpCircle, 
    canHaveChildren: false, 
    defaultProps: { 
      heading: 'Frequently Asked Questions',
      subtitle: 'Find answers to common questions below.',
      faqItems: [
        { question: 'What is your return policy?', answer: 'We offer a 30-day return policy for all unused items.' },
        { question: 'How long does shipping take?', answer: 'Standard shipping takes 3-5 business days.' },
        { question: 'Do you ship internationally?', answer: 'Yes, we ship to over 50 countries worldwide.' },
      ],
      faqLayout: 'accordion',
    }, 
    defaultStyle: { padding: '4rem 2rem', maxWidth: '48rem', margin: '0 auto' },
    supportsBinding: true,
    description: 'FAQ accordion or grid section',
  },
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
    const rootAllowed: NodeType[] = [...LAYOUT_TYPES, ...SITE_TYPES, 'HeroSection', 'NewsletterSection', 'FeatureBar', 'Accordion', 'TabsBlock', 'VideoEmbed', 'ProductGrid', 'CollectionGrid', 'ImageBanner', 'RichTextSection', 'CTASection', 'TestimonialSection', 'FAQSection'];
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
