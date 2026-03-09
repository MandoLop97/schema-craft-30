import { useDroppable } from '@dnd-kit/core';
import { PageRenderer } from '@/components/schema/PageRenderer';
import { Schema, TemplateType } from '@/types/schema';
import { CustomComponentMap } from '@/components/schema/NodeRegistry';
import { CustomStylesInjector } from '@/components/builder/CustomStylesInjector';
import { useMemo } from 'react';
import { RenderContext } from '@/types/contract';
import { buildHostData } from '@/lib/host-data';

interface BuilderCanvasProps {
  schema: Schema;
  device: 'desktop' | 'tablet' | 'mobile';
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  customComponents?: CustomComponentMap;
  templateType?: TemplateType;
  /** @deprecated Use hostData */
  mockData?: Record<string, any>;
  /** Host-provided data for edit/preview binding resolution */
  hostData?: Record<string, any>;
  customStylesheets?: string[];
  customCSS?: string;
  customScripts?: string[];
  onCopyNode?: (nodeId: string) => void;
  onPasteNode?: (nodeId: string) => void;
  onDuplicateNode?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  canPaste?: boolean;
  onEditSection?: (nodeType: string) => void;
  onSaveAsTemplate?: (nodeId: string) => void;
  onRepositionNode?: (nodeId: string, style: { top?: string; left?: string; right?: string; bottom?: string }) => void;
  onCopyStyle?: (nodeId: string) => void;
  onPasteStyle?: (nodeId: string) => void;
  canPasteStyle?: boolean;
  /** Pre-built render context from host — takes priority over auto-built one */
  externalRenderContext?: RenderContext;
}

const DEVICE_WIDTHS = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

/** Default canvas presets per templateType */
const TEMPLATE_CANVAS: Record<TemplateType, { width?: string; height?: string; scroll: boolean; checkerboard: boolean }> = {
  page: { scroll: true, checkerboard: false },
  header: { height: '120px', scroll: false, checkerboard: false },
  footer: { height: '300px', scroll: false, checkerboard: false },
  component: { width: '350px', height: '450px', scroll: false, checkerboard: true },
  single: { scroll: true, checkerboard: false },
};

const DEVICE_LABELS: Record<string, string> = {
  desktop: 'Desktop',
  tablet: 'Tablet',
  mobile: 'Mobile',
};

export function BuilderCanvas({ schema, device, selectedNodeId, onSelectNode, customComponents, templateType = 'page', canvasSize, mockData, hostData, customStylesheets, customCSS, customScripts, onCopyNode, onPasteNode, onDuplicateNode, onDeleteNode, canPaste, onEditSection, onSaveAsTemplate, onRepositionNode, onCopyStyle, onPasteStyle, canPasteStyle, externalRenderContext }: BuilderCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: schema.rootNodeId });

  const preset = TEMPLATE_CANVAS[templateType];

  // Resolve dimensions: canvasSize prop > preset > device width
  const resolvedWidth = canvasSize ? `${canvasSize.width}px` : preset.width ?? DEVICE_WIDTHS[device];
  const resolvedHeight = canvasSize ? `${canvasSize.height}px` : preset.height ?? undefined;

  const isCompact = templateType === 'component' || templateType === 'header' || templateType === 'footer';

  // Use external renderContext if provided, otherwise build from mockData
  const resolvedHostData = hostData || mockData;
  const renderContext = useMemo<RenderContext>(() => {
    if (externalRenderContext) return externalRenderContext;
    return {
      mode: 'edit',
      data: buildHostData(resolvedHostData),
      theme: schema.themeTokens,
    };
  }, [externalRenderContext, resolvedHostData, schema.themeTokens]);

  return (
    <div
      className={`flex-1 overflow-auto flex flex-col items-center ${isCompact ? 'justify-center' : ''} p-6 ${preset.checkerboard ? 'nxr-checkerboard' : 'nxr-canvas-grid'}`}
      style={{ backgroundColor: preset.checkerboard ? undefined : 'hsl(var(--muted) / 0.3)' }}
      onClick={() => onSelectNode('')}
    >
      {/* Responsive Preview Ruler */}
      <div
        className="flex items-center gap-2 mb-2 px-3 py-1 rounded-full shrink-0"
        style={{
          backgroundColor: 'hsl(var(--background) / 0.85)',
          border: '1px solid hsl(var(--border) / 0.5)',
          backdropFilter: 'blur(6px)',
          fontSize: '0.65rem',
          fontWeight: 500,
          color: 'hsl(var(--muted-foreground))',
          letterSpacing: '0.03em',
        }}
        title={`${DEVICE_LABELS[device]} — ${resolvedWidth}`}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'hsl(var(--primary) / 0.5)' }} />
        <span>{DEVICE_LABELS[device]}</span>
        <span style={{ opacity: 0.4 }}>•</span>
        <span className="font-mono">{resolvedWidth}</span>
      </div>

      <div
        ref={setNodeRef}
        style={{
          width: resolvedWidth,
          maxWidth: '100%',
          height: resolvedHeight,
          minHeight: resolvedHeight ?? (isCompact ? undefined : '100%'),
          transition: 'width 300ms ease, height 300ms ease, box-shadow 200ms ease',
          overflow: preset.scroll ? 'auto' : 'hidden',
          containerType: 'inline-size',
        }}
        className={`bg-background border nxr-responsive-canvas ${isOver ? 'ring-2 ring-primary/20' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <CustomStylesInjector stylesheets={customStylesheets} css={customCSS} scripts={customScripts} />
        <PageRenderer
          schema={schema}
          mode="edit"
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
          customComponents={customComponents}
          mockData={resolvedHostData}
          hostData={resolvedHostData}
          onCopyNode={onCopyNode}
          onPasteNode={onPasteNode}
          onDuplicateNode={onDuplicateNode}
          onDeleteNode={onDeleteNode}
          canPaste={canPaste}
          onEditSection={onEditSection}
          onSaveAsTemplate={onSaveAsTemplate}
          onRepositionNode={onRepositionNode}
          onCopyStyle={onCopyStyle}
          onPasteStyle={onPasteStyle}
          canPasteStyle={canPasteStyle}
        />
      </div>
    </div>
  );
}
