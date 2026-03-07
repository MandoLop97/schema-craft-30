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
  
  const getEmbedUrl = (raw: string): string | null => {
    if (!raw) return null;
    const ytMatch = raw.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}${node.props.autoplay ? '?autoplay=1' : ''}${node.props.muted ? '&mute=1' : ''}`;
    const vimeoMatch = raw.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}${node.props.autoplay ? '?autoplay=1' : ''}${node.props.muted ? '&muted=1' : ''}`;
    return raw;
  };

  const embedUrl = getEmbedUrl(url);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        paddingBottom: '56.25%',
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

/* ── FormBlock ── */

interface FormField {
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  label: string;
  placeholder: string;
  required: boolean;
  options?: string; // comma-separated for select
}

const DEFAULT_FORM_FIELDS: FormField[] = [
  { type: 'text', label: 'Nombre', placeholder: 'Tu nombre', required: true },
  { type: 'email', label: 'Email', placeholder: 'tu@email.com', required: true },
  { type: 'tel', label: 'Teléfono', placeholder: '+1 234 567 890', required: false },
  { type: 'textarea', label: 'Mensaje', placeholder: 'Escribe tu mensaje...', required: false },
];

export function FormBlockNode({ node }: NodeComponentProps) {
  const fields: FormField[] = node.props.formFields || DEFAULT_FORM_FIELDS;
  const btnText = node.props.formBtnText || 'Enviar';
  const btnVariant = node.props.formBtnVariant || 'filled';
  const formTitle = node.props.formTitle || '';

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.75rem',
    fontSize: '0.875rem',
    border: '1px solid hsl(var(--border))',
    borderRadius: 'var(--radius, 0.375rem)',
    backgroundColor: 'hsl(var(--background))',
    color: 'hsl(var(--foreground))',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: 'hsl(var(--foreground))',
    marginBottom: '0.25rem',
    display: 'block',
  };

  return (
    <form
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        ...s(node.style),
      }}
      data-node-id={node.id}
      onSubmit={(e) => e.preventDefault()}
    >
      {formTitle && (
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'hsl(var(--foreground))', margin: 0 }}>
          {formTitle}
        </h3>
      )}
      {fields.map((field, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={labelStyle}>
            {field.label}
            {field.required && <span style={{ color: 'hsl(var(--destructive))', marginLeft: '2px' }}>*</span>}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              placeholder={field.placeholder}
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
              readOnly
            />
          ) : field.type === 'select' ? (
            <select style={inputStyle}>
              <option value="">{field.placeholder || 'Seleccionar...'}</option>
              {(field.options || '').split(',').filter(Boolean).map((opt, j) => (
                <option key={j} value={opt.trim()}>{opt.trim()}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              placeholder={field.placeholder}
              style={inputStyle}
              readOnly
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          border: btnVariant === 'outline' ? '2px solid hsl(var(--primary))' : 'none',
          borderRadius: 'var(--radius, 0.375rem)',
          backgroundColor: btnVariant === 'outline' ? 'transparent' : 'hsl(var(--primary))',
          color: btnVariant === 'outline' ? 'hsl(var(--primary))' : 'hsl(var(--primary-foreground))',
          cursor: 'pointer',
          transition: 'opacity 0.15s',
          alignSelf: 'flex-start',
        }}
      >
        {btnText}
      </button>
    </form>
  );
}
