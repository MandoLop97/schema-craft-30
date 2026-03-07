import React, { useMemo } from 'react';
import { Schema, RenderMode, ThemeTokens } from '@/types/schema';
import { getNodeComponent, CustomComponentMap } from './NodeRegistry';
import { EditableDropZone } from './EditableDropZone';
import { SortableNodeWrapper } from './SortableNodeWrapper';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { getBlockDef } from '@/lib/block-registry';
import { generatePseudoStateCSS, generateResponsiveCSS } from '@/lib/style-utils';

/** Given an HSL string like "222 84% 4.9%", returns a contrasting foreground HSL */
function computeContrastForeground(hsl: string): string {
  const parts = hsl.replace(/%/g, '').trim().split(/\s+/).map(Number);
  const l = parts[2] ?? 50;
  // If background is dark (L < 50), use white-ish foreground; otherwise dark
  return l < 50 ? '0 0% 98%' : '0 0% 3.9%';
}
interface PageRendererProps {
  schema: Schema;
  mode: RenderMode;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  customComponents?: CustomComponentMap;
  mockData?: Record<string, any>;
  onCopyNode?: (nodeId: string) => void;
  onPasteNode?: (nodeId: string) => void;
  onDuplicateNode?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  canPaste?: boolean;
  onEditSection?: (nodeType: string) => void;
  onSaveAsTemplate?: (nodeId: string) => void;
}

export function PageRenderer({ schema, mode, selectedNodeId, onSelectNode, customComponents, mockData, onCopyNode, onPasteNode, onDuplicateNode, onDeleteNode, canPaste, onEditSection }: PageRendererProps) {
  const renderNode = (nodeId: string): React.ReactNode => {
    const node = schema.nodes[nodeId];
    if (!node || node.hidden) return null;

    const Component = getNodeComponent(node.type, customComponents);
    if (!Component) return null;

    const blockDef = getBlockDef(node.type);
    const canHaveChildren = blockDef?.canHaveChildren ?? false;

    const renderChildren = (childIds: string[]) => {
      if (mode !== 'edit' || !canHaveChildren) {
        return childIds.map((cid) => <React.Fragment key={cid}>{renderNode(cid)}</React.Fragment>);
      }

      // In edit mode, wrap children in SortableContext for reordering
      return (
        <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
          {childIds.map((cid) => {
            const childNode = schema.nodes[cid];
            if (!childNode || childNode.hidden) return null;

            const ChildComponent = getNodeComponent(childNode.type, customComponents);
            if (!ChildComponent) return null;

            const childBlockDef = getBlockDef(childNode.type);
            const childCanHaveChildren = childBlockDef?.canHaveChildren ?? false;

            const childElement = <ChildComponent node={childNode} mode={mode} renderChildren={(ids: string[]) => renderChildren2(ids)} />;

            const wrappedChild = childCanHaveChildren ? (
              <EditableDropZone nodeId={childNode.id} isEmpty={childNode.children.length === 0}>
                {childElement}
              </EditableDropZone>
            ) : (
              childElement
            );

            return (
              <SortableNodeWrapper
                key={cid}
                nodeId={cid}
                isSelected={selectedNodeId === cid}
                nodeType={childNode.type}
                onSelect={(id) => onSelectNode?.(id)}
                onCopy={onCopyNode}
                onPaste={onPasteNode}
                onDuplicate={onDuplicateNode}
                onDelete={onDeleteNode}
                canPaste={canPaste}
                onEditSection={onEditSection}
              >
                {wrappedChild}
              </SortableNodeWrapper>
            );
          })}
        </SortableContext>
      );
    };

    // Non-sortable renderChildren for nested levels
    const renderChildren2 = (childIds: string[]): React.ReactNode => {
      if (mode !== 'edit') {
        return childIds.map((cid) => <React.Fragment key={cid}>{renderNode(cid)}</React.Fragment>);
      }

      return (
        <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
          {childIds.map((cid) => {
            const childNode = schema.nodes[cid];
            if (!childNode || childNode.hidden) return null;

            const ChildComponent = getNodeComponent(childNode.type, customComponents);
            if (!ChildComponent) return null;

            const childBlockDef = getBlockDef(childNode.type);
            const childCanHaveChildren = childBlockDef?.canHaveChildren ?? false;

            const childElement = <ChildComponent node={childNode} mode={mode} renderChildren={(ids: string[]) => renderChildren2(ids)} />;

            const wrappedChild = childCanHaveChildren ? (
              <EditableDropZone nodeId={childNode.id} isEmpty={childNode.children.length === 0}>
                {childElement}
              </EditableDropZone>
            ) : (
              childElement
            );

            return (
              <SortableNodeWrapper
                key={cid}
                nodeId={cid}
                isSelected={selectedNodeId === cid}
                nodeType={childNode.type}
                onSelect={(id) => onSelectNode?.(id)}
                onCopy={onCopyNode}
                onPaste={onPasteNode}
                onDuplicate={onDuplicateNode}
                onDelete={onDeleteNode}
                canPaste={canPaste}
                onEditSection={onEditSection}
              >
                {wrappedChild}
              </SortableNodeWrapper>
            );
          })}
        </SortableContext>
      );
    };

    const element = <Component node={node} mode={mode} renderChildren={renderChildren} mockData={mockData} />;

    // Root node: don't wrap in sortable
    if (mode !== 'edit') return element;

    if (nodeId === schema.rootNodeId) {
      return (
        <EditableDropZone nodeId={node.id} isEmpty={node.children.length === 0}>
          {element}
        </EditableDropZone>
      );
    }

    // Non-root nodes at top level (shouldn't happen normally, but safety)
    const isSelected = selectedNodeId === node.id;

    return (
      <div
        key={node.id}
        onClick={(e) => {
          e.stopPropagation();
          onSelectNode?.(node.id);
        }}
        style={{
          outline: isSelected ? '2px solid hsl(var(--primary))' : undefined,
          outlineOffset: isSelected ? '2px' : undefined,
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              top: '-1.5rem',
              left: 0,
              fontSize: '0.65rem',
              padding: '0.15rem 0.5rem',
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
              borderRadius: '0.25rem',
              zIndex: 10,
              fontWeight: 500,
            }}
          >
            {node.type}
          </div>
        )}
        {canHaveChildren ? (
          <EditableDropZone nodeId={node.id} isEmpty={node.children.length === 0}>
            {element}
          </EditableDropZone>
        ) : (
          element
        )}
      </div>
    );
  };

  /** Convert themeTokens into inline CSS custom properties so that
   *  all descendant elements (which use hsl(var(--...)) tokens) reflect
   *  the theme editor values in real-time. */
  const themeStyle = useMemo<React.CSSProperties>(() => {
    const t = schema.themeTokens;
    return {
      // Colors (HSL values without the hsl() wrapper — matching the CSS var format)
      '--primary': t.colors.primary,
      '--secondary': t.colors.secondary,
      '--background': t.colors.background,
      '--foreground': t.colors.text,
      '--muted': t.colors.muted,
      '--border': t.colors.border,
      '--accent': t.colors.accent || t.colors.secondary,
      '--accent-foreground': t.colors.text,
      // Foreground variants — auto-computed for contrast
      '--primary-foreground': computeContrastForeground(t.colors.primary),
      '--secondary-foreground': computeContrastForeground(t.colors.secondary),
      '--muted-foreground': t.colors.muted,
      '--card': t.colors.background,
      '--card-foreground': t.colors.text,
      '--popover': t.colors.background,
      '--popover-foreground': t.colors.text,
      '--input': t.colors.border,
      // Typography
      fontFamily: t.typography.fontFamily,
      fontSize: t.typography.baseSize,
      '--nxr-heading-scale': String(t.typography.headingScale),
      // Radius
      '--radius': t.radius.md,
      '--nxr-radius-sm': t.radius.sm,
      '--nxr-radius-lg': t.radius.lg,
      // Spacing as custom properties for templates to consume
      '--nxr-space-xs': t.spacing.xs,
      '--nxr-space-sm': t.spacing.sm,
      '--nxr-space-md': t.spacing.md,
      '--nxr-space-lg': t.spacing.lg,
      '--nxr-space-xl': t.spacing.xl,
      // Ensure text color follows theme
      color: `hsl(${t.colors.text})`,
      backgroundColor: `hsl(${t.colors.background})`,
      // Global gradient (if set, overlays on top of background color)
      ...(t.gradient ? { backgroundImage: t.gradient } : {}),
    } as React.CSSProperties;
  }, [schema.themeTokens]);

  // Generate dynamic CSS for pseudo-states and responsive overrides
  const dynamicCSS = useMemo(() => {
    const rules: string[] = [];
    for (const node of Object.values(schema.nodes)) {
      const pseudo = generatePseudoStateCSS(node.id, node.style);
      if (pseudo) rules.push(pseudo);
      const responsive = generateResponsiveCSS(node.id, node.style);
      if (responsive) rules.push(responsive);
      // Custom CSS per widget
      if (node.customCSS) {
        rules.push(node.customCSS.replace(/selector/g, `[data-node-id="${node.id}"]`));
      }
    }
    return rules.join('\n');
  }, [schema.nodes]);

  return (
    <div style={{ ...themeStyle, containerType: 'inline-size' as any }}>
      {dynamicCSS && <style dangerouslySetInnerHTML={{ __html: dynamicCSS }} />}
      {renderNode(schema.rootNodeId)}
    </div>
  );
}
