import { SchemaNode, NodeType, NodeProps, NodeStyle } from '@/types/schema';

const uid = () => `node-${Math.random().toString(36).slice(2, 9)}`;

const DEFAULTS: Record<NodeType, { props: NodeProps; style: NodeStyle }> = {
  Section: { props: {}, style: { padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' } },
  Container: { props: {}, style: { maxWidth: '72rem', margin: '0 auto' } },
  Grid: { props: { columns: 3 }, style: { gap: '1.5rem' } },
  Stack: { props: { direction: 'vertical' }, style: { gap: '1rem' } },
  Text: { props: { text: 'New text block', level: 'p' }, style: {} },
  Image: { props: { src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop', alt: 'Placeholder' }, style: { width: '100%', borderRadius: '0.5rem' } },
  Divider: { props: {}, style: {} },
  Badge: { props: { text: 'Badge' }, style: {} },
  Button: { props: { text: 'Button', variant: 'default' }, style: {} },
  Card: { props: { items: [{ title: 'Card Title', description: 'Card description goes here.' }] }, style: { padding: '1.5rem' } },
  Input: { props: { placeholder: 'Enter text...' }, style: {} },
  ProductCard: { props: { text: 'Product Name', price: '$99', src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop' }, style: {} },
  Navbar: { props: { logoText: 'Brand', links: [{ text: 'Home', href: '#' }] }, style: {} },
  Footer: { props: { logoText: 'Brand', copyright: '© 2026', links: [{ text: 'Privacy', href: '#' }] }, style: {} },
};

const CONTAINER_TYPES: NodeType[] = ['Section', 'Container', 'Grid', 'Stack'];

export function isContainerType(type: NodeType): boolean {
  return CONTAINER_TYPES.includes(type);
}

export function createNode(type: NodeType): SchemaNode {
  const defaults = DEFAULTS[type];
  return {
    id: uid(),
    type,
    props: { ...defaults.props },
    style: { ...defaults.style },
    children: [],
  };
}
