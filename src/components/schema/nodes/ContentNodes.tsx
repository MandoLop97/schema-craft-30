import React from 'react';
import { SchemaNode, RenderMode, NodeStyle } from '@/types/schema';
import { nodeStyleToCSS } from '@/lib/style-utils';

interface NodeComponentProps {
  node: SchemaNode;
  mode: RenderMode;
  renderChildren: (childIds: string[]) => React.ReactNode;
}

const s = (style: NodeStyle): React.CSSProperties => nodeStyleToCSS(style);

export function TextNode({ node }: NodeComponentProps) {
  const Tag = (node.props.level || 'p') as keyof JSX.IntrinsicElements;
  return (
    <Tag style={s(node.style)} data-node-id={node.id}>
      {node.props.text || ''}
    </Tag>
  );
}

export function ImageNode({ node }: NodeComponentProps) {
  return (
    <img
      src={node.props.src || '/placeholder.svg'}
      alt={node.props.alt || ''}
      style={{ maxWidth: '100%', height: 'auto', ...s(node.style) }}
      data-node-id={node.id}
    />
  );
}

export function DividerNode({ node }: NodeComponentProps) {
  return (
    <hr
      style={{ border: 'none', borderTop: '1px solid hsl(var(--border))', margin: '1rem 0', ...s(node.style) }}
      data-node-id={node.id}
    />
  );
}

export function BadgeNode({ node }: NodeComponentProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: 'hsl(var(--primary))',
        color: 'hsl(var(--primary-foreground))',
        ...s(node.style),
      }}
      data-node-id={node.id}
    >
      {node.props.text || 'Badge'}
    </span>
  );
}

export function SpacerNode({ node }: NodeComponentProps) {
  const height = node.props.height || node.style.height || '2rem';
  return (
    <div
      style={{ height, width: '100%', ...s(node.style), height: height }}
      data-node-id={node.id}
      aria-hidden="true"
    />
  );
}

export function IconNode({ node }: NodeComponentProps) {
  const iconName = node.props.iconName || 'Star';
  const size = parseInt(node.props.iconSize || '24', 10);
  const color = node.props.iconColor || 'currentColor';

  // Dynamic icon from lucide-react
  const [IconComp, setIconComp] = React.useState<React.ElementType | null>(null);

  React.useEffect(() => {
    import('lucide-react').then((mod) => {
      const icons = mod as any;
      setIconComp(() => icons[iconName] || icons.Star);
    });
  }, [iconName]);

  return (
    <div
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...s(node.style) }}
      data-node-id={node.id}
    >
      {IconComp ? <IconComp size={size} color={color} /> : <span style={{ width: size, height: size }} />}
    </div>
  );
}

const SOCIAL_ICONS: Record<string, { label: string; icon: string; defaultUrl: string; color: string }> = {
  facebook: { label: 'Facebook', icon: 'Facebook', defaultUrl: 'https://facebook.com', color: '#1877F2' },
  instagram: { label: 'Instagram', icon: 'Instagram', defaultUrl: 'https://instagram.com', color: '#E4405F' },
  twitter: { label: 'Twitter / X', icon: 'Twitter', defaultUrl: 'https://x.com', color: '#000000' },
  youtube: { label: 'YouTube', icon: 'Youtube', defaultUrl: 'https://youtube.com', color: '#FF0000' },
  linkedin: { label: 'LinkedIn', icon: 'Linkedin', defaultUrl: 'https://linkedin.com', color: '#0A66C2' },
  github: { label: 'GitHub', icon: 'Github', defaultUrl: 'https://github.com', color: '#181717' },
  tiktok: { label: 'TikTok', icon: 'Music2', defaultUrl: 'https://tiktok.com', color: '#000000' },
};

export function SocialIconsNode({ node }: NodeComponentProps) {
  const items: { platform: string; url: string }[] = node.props.socialItems || [
    { platform: 'facebook', url: '' },
    { platform: 'instagram', url: '' },
    { platform: 'twitter', url: '' },
  ];
  const iconSize = parseInt(node.props.socialIconSize || '20', 10);
  const iconStyle = node.props.socialStyle || 'default'; // 'default' | 'colored' | 'rounded'

  const [icons, setIcons] = React.useState<Record<string, React.ElementType>>({});

  React.useEffect(() => {
    import('lucide-react').then((mod) => {
      const loaded: Record<string, React.ElementType> = {};
      Object.values(SOCIAL_ICONS).forEach(({ icon }) => {
        loaded[icon] = (mod as any)[icon] || (mod as any).Globe;
      });
      setIcons(loaded);
    });
  }, []);

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', ...s(node.style) }}
      data-node-id={node.id}
    >
      {items.map((item, i) => {
        const def = SOCIAL_ICONS[item.platform];
        if (!def) return null;
        const Ico = icons[def.icon];
        const url = item.url || def.defaultUrl;

        const isRounded = iconStyle === 'rounded';
        const isColored = iconStyle === 'colored' || iconStyle === 'rounded';

        return (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title={def.label}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isColored ? '#fff' : 'hsl(var(--foreground))',
              backgroundColor: isColored ? def.color : 'transparent',
              borderRadius: isRounded ? '50%' : '0.25rem',
              width: isRounded ? `${iconSize + 16}px` : 'auto',
              height: isRounded ? `${iconSize + 16}px` : 'auto',
              padding: isRounded ? '0' : '0.25rem',
              transition: 'opacity 0.2s, transform 0.2s',
              textDecoration: 'none',
            }}
          >
            {Ico ? <Ico size={iconSize} /> : <span style={{ width: iconSize, height: iconSize }} />}
          </a>
        );
      })}
    </div>
  );
}
