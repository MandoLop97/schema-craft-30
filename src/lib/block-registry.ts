import {
  Square, AlignVerticalJustifyStart, LayoutGrid, Columns,
  Type, ImageIcon, Minus, Tag,
  CreditCard, TextCursorInput, ShoppingBag, Navigation, PanelBottom,
  Megaphone, Sparkles, MessageSquareQuote, Mail,
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
}

export const blockRegistry: BlockDefinition[] = [
  // ── Layout ──
  { type: 'Section', label: 'Section', category: 'Layout', icon: Square, canHaveChildren: true, defaultProps: {}, defaultStyle: { padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' } },
  { type: 'Container', label: 'Container', category: 'Layout', icon: AlignVerticalJustifyStart, canHaveChildren: true, defaultProps: {}, defaultStyle: { maxWidth: '72rem', margin: '0 auto' } },
  { type: 'Grid', label: 'Grid', category: 'Layout', icon: LayoutGrid, canHaveChildren: true, defaultProps: { columns: 3 }, defaultStyle: { gap: '1.5rem' } },
  { type: 'Stack', label: 'Stack', category: 'Layout', icon: Columns, canHaveChildren: true, defaultProps: { direction: 'vertical' }, defaultStyle: { gap: '1rem' } },

  // ── Content ──
  { type: 'Text', label: 'Text', category: 'Content', icon: Type, canHaveChildren: false, defaultProps: { text: 'New text block', level: 'p' }, defaultStyle: {} },
  { type: 'Image', label: 'Image', category: 'Content', icon: ImageIcon, canHaveChildren: false, defaultProps: { src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop', alt: 'Placeholder' }, defaultStyle: { width: '100%', borderRadius: '0.5rem' } },
  { type: 'Divider', label: 'Divider', category: 'Content', icon: Minus, canHaveChildren: false, defaultProps: {}, defaultStyle: {} },
  { type: 'Badge', label: 'Badge', category: 'Content', icon: Tag, canHaveChildren: false, defaultProps: { text: 'Badge' }, defaultStyle: {} },

  // ── UI ──
  { type: 'Button', label: 'Button', category: 'UI', icon: Square, canHaveChildren: false, defaultProps: { text: 'Button', variant: 'default' }, defaultStyle: {} },
  { type: 'Card', label: 'Card', category: 'UI', icon: CreditCard, canHaveChildren: false, defaultProps: { items: [{ title: 'Card Title', description: 'Card description goes here.' }] }, defaultStyle: { padding: '1.5rem' } },
  { type: 'Input', label: 'Input', category: 'UI', icon: TextCursorInput, canHaveChildren: false, defaultProps: { placeholder: 'Enter text...' }, defaultStyle: {} },

  // ── Commerce ──
  { type: 'ProductCard', label: 'Product Card', category: 'Commerce', icon: ShoppingBag, canHaveChildren: false, defaultProps: { text: 'Product Name', price: '$99', src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop' }, defaultStyle: {} },

  // ── Site ──
  { type: 'Navbar', label: 'Navbar', category: 'Site', icon: Navigation, canHaveChildren: false, defaultProps: { logoText: 'Brand', links: [{ text: 'Home', href: '#' }] }, defaultStyle: {} },
  { type: 'Footer', label: 'Footer', category: 'Site', icon: PanelBottom, canHaveChildren: false, defaultProps: { logoText: 'Brand', copyright: '© 2026', links: [{ text: 'Privacy', href: '#' }] }, defaultStyle: {} },

  // ── Template Custom ──
  { type: 'AnnouncementBar', label: 'Announcement Bar', category: 'Template', icon: Megaphone, canHaveChildren: false, defaultProps: { text: '🎉 Free shipping on orders over $50!', href: '#' }, defaultStyle: {} },
  { type: 'FeatureBar', label: 'Feature Bar', category: 'Template', icon: Sparkles, canHaveChildren: false, defaultProps: { items: [{ icon: 'truck', title: 'Free Shipping', description: 'On orders over $50' }, { icon: 'shield', title: 'Secure Payment', description: '100% protected' }, { icon: 'refresh', title: 'Easy Returns', description: '30 day return policy' }] }, defaultStyle: {} },
  { type: 'TestimonialCard', label: 'Testimonial', category: 'Template', icon: MessageSquareQuote, canHaveChildren: false, defaultProps: { text: '"This product changed my life!"', label: 'Jane Doe', variant: '5' }, defaultStyle: {} },
  { type: 'NewsletterSection', label: 'Newsletter', category: 'Template', icon: Mail, canHaveChildren: false, defaultProps: { text: 'Stay in the loop', label: 'Get the latest updates delivered to your inbox.', placeholder: 'Enter your email' }, defaultStyle: { padding: '3rem 2rem', textAlign: 'center' } },
];

const registryMap = new Map<NodeType, BlockDefinition>();
blockRegistry.forEach((b) => registryMap.set(b.type, b));

export function getBlockDef(type: NodeType): BlockDefinition | undefined {
  return registryMap.get(type);
}

export function getCategories(): string[] {
  return [...new Set(blockRegistry.map((b) => b.category))];
}

export function getBlocksByCategory(category: string): BlockDefinition[] {
  return blockRegistry.filter((b) => b.category === category);
}
