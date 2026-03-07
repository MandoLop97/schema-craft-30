import { useDroppable } from '@dnd-kit/core';
import { PageRenderer } from '@/components/schema/PageRenderer';
import { Schema, TemplateType } from '@/types/schema';
import { CustomComponentMap } from '@/components/schema/NodeRegistry';
import { CustomStylesInjector } from '@/components/builder/CustomStylesInjector';

interface BuilderCanvasProps {
  schema: Schema;
  device: 'desktop' | 'tablet' | 'mobile';
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  customComponents?: CustomComponentMap;
  templateType?: TemplateType;
  canvasSize?: { width: number; height: number };
  mockData?: Record<string, any>;
  customStylesheets?: string[];
  customCSS?: string;
  onCopyNode?: (nodeId: string) => void;
  onPasteNode?: (nodeId: string) => void;
  onDuplicateNode?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  canPaste?: boolean;
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

export function BuilderCanvas({ schema, device, selectedNodeId, onSelectNode, customComponents, templateType = 'page', canvasSize, mockData, customStylesheets, customCSS, onCopyNode, onPasteNode, onDuplicateNode, onDeleteNode, canPaste }: BuilderCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: schema.rootNodeId });

  const preset = TEMPLATE_CANVAS[templateType];

  // Resolve dimensions: canvasSize prop > preset > device width
  const resolvedWidth = canvasSize ? `${canvasSize.width}px` : preset.width ?? DEVICE_WIDTHS[device];
  const resolvedHeight = canvasSize ? `${canvasSize.height}px` : preset.height ?? undefined;

  const isCompact = templateType === 'component' || templateType === 'header' || templateType === 'footer';

  return (
    <div
      className={`flex-1 overflow-auto flex justify-center ${isCompact ? 'items-center' : ''} p-6 ${preset.checkerboard ? 'nxr-checkerboard' : 'nxr-canvas-grid'}`}
      style={{ backgroundColor: preset.checkerboard ? undefined : 'hsl(var(--muted) / 0.3)' }}
      onClick={() => onSelectNode('')}
    >
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
        <CustomStylesInjector stylesheets={customStylesheets} css={customCSS} />
        <PageRenderer
          schema={schema}
          mode="edit"
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
          customComponents={customComponents}
          mockData={mockData}
          onCopyNode={onCopyNode}
          onPasteNode={onPasteNode}
          onDuplicateNode={onDuplicateNode}
          onDeleteNode={onDeleteNode}
          canPaste={canPaste}
        />
      </div>
    </div>
  );
}
