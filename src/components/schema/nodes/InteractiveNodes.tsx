import React, { useState } from 'react';
import { SchemaNode, RenderMode, NodeStyle } from '@/types/schema';
import { nodeStyleToCSS } from '@/lib/style-utils';

interface NodeComponentProps {
  node: SchemaNode;
  mode: RenderMode;
  renderChildren: (childIds: string[]) => React.ReactNode;
}

const s = (style: NodeStyle): React.CSSProperties => nodeStyleToCSS(style);

export function AccordionNode({ node }: NodeComponentProps) {
  const panels = node.props.panels || [
    { title: 'Accordion Item 1', description: 'Content for item 1' },
    { title: 'Accordion Item 2', description: 'Content for item 2' },
  ];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div
      style={{
        borderRadius: '0.5rem',
        border: '1px solid hsl(var(--border))',
        overflow: 'hidden',
        ...s(node.style),
      }}
      data-node-id={node.id}
    >
      {panels.map((panel, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} style={{ borderBottom: i < panels.length - 1 ? '1px solid hsl(var(--border))' : undefined }}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.875rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'hsl(var(--foreground))',
                textAlign: 'left',
              }}
            >
              <span>{panel.title}</span>
              <span style={{
                transition: 'transform 200ms ease',
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                fontSize: '0.75rem',
              }}>▼</span>
            </button>
            <div
              style={{
                maxHeight: isOpen ? '500px' : '0',
                overflow: 'hidden',
                transition: 'max-height 300ms ease',
              }}
            >
              <div style={{
                padding: '0 1rem 0.875rem 1rem',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: 'hsl(var(--muted-foreground))',
              }}>
                {panel.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TabsBlockNode({ node }: NodeComponentProps) {
  const panels = node.props.panels || [
    { title: 'Tab 1', description: 'Content for tab 1' },
    { title: 'Tab 2', description: 'Content for tab 2' },
  ];
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ ...s(node.style) }} data-node-id={node.id}>
      <div
        style={{
          display: 'flex',
          gap: '0',
          borderBottom: '2px solid hsl(var(--border))',
          marginBottom: '1rem',
        }}
      >
        {panels.map((panel, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            style={{
              padding: '0.625rem 1.25rem',
              fontSize: '0.8125rem',
              fontWeight: activeTab === i ? 600 : 400,
              cursor: 'pointer',
              border: 'none',
              borderBottom: activeTab === i ? '2px solid hsl(var(--primary))' : '2px solid transparent',
              marginBottom: '-2px',
              backgroundColor: 'transparent',
              color: activeTab === i ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
              transition: 'color 150ms ease, border-color 150ms ease',
            }}
          >
            {panel.title}
          </button>
        ))}
      </div>
      <div style={{
        fontSize: '0.875rem',
        lineHeight: 1.6,
        color: 'hsl(var(--foreground))',
        padding: '0.5rem 0',
      }}>
        {panels[activeTab]?.description || ''}
      </div>
    </div>
  );
}

export function VideoEmbedNode({ node }: NodeComponentProps) {
  const url = node.props.videoUrl || '';
  
  // Convert YouTube/Vimeo URLs to embed format
  const getEmbedUrl = (raw: string): string | null => {
    if (!raw) return null;
    // YouTube
    const ytMatch = raw.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}${node.props.autoplay ? '?autoplay=1' : ''}${node.props.muted ? '&mute=1' : ''}`;
    // Vimeo
    const vimeoMatch = raw.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}${node.props.autoplay ? '?autoplay=1' : ''}${node.props.muted ? '&muted=1' : ''}`;
    // Already an embed URL or other
    return raw;
  };

  const embedUrl = getEmbedUrl(url);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        paddingBottom: '56.25%', // 16:9 aspect ratio
        backgroundColor: 'hsl(var(--muted))',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        ...s(node.style),
      }}
      data-node-id={node.id}
    >
      {embedUrl ? (
        <iframe
          src={embedUrl}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={node.props.alt || 'Video'}
        />
      ) : (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'hsl(var(--muted-foreground))',
          fontSize: '0.875rem',
        }}>
          <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>▶</span>
          Paste a video URL
        </div>
      )}
    </div>
  );
}
