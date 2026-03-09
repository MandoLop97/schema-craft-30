import React, { useMemo } from 'react';
import { Schema, RenderMode, ThemeTokens, SchemaNode } from '@/types/schema';
import { ThemeProvider } from './ThemeContext';
import { getNodeComponent, CustomComponentMap } from './NodeRegistry';
import { EditableDropZone } from './EditableDropZone';
import { SortableNodeWrapper } from './SortableNodeWrapper';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { getBlockDef } from '@/lib/block-registry';
import { generatePseudoStateCSS, generateResponsiveCSS, mergeGlobalStyles } from '@/lib/style-utils';
import { ScrollAnimationWrapper } from './ScrollAnimationWrapper';
import { RenderContext, BoundSchemaNode } from '@/types/contract';
import { resolveBindings, hasActiveBindings } from '@/lib/binding-utils';
import { getSlotConstraints, isSlotLocked, isSlotDynamic, getSlotFallback } from '@/lib/slot-utils';

/** Given an HSL string like "222 84% 4.9%", returns a contrasting foreground HSL */
function computeContrastForeground(hsl: string): string {
  const parts = hsl.replace(/%/g, '').trim().split(/\s+/).map(Number);
  const l = parts[2] ?? 50;
  return l < 50 ? '0 0% 98%' : '0 0% 3.9%';
}

interface PageRendererProps {
  schema: Schema;
  mode: RenderMode;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  customComponents?: CustomComponentMap;
  /** @deprecated Use hostData */
  mockData?: Record<string, any>;
  /** Host-provided data for edit/preview binding resolution */
  hostData?: Record<string, any>;
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
  /** Data context for resolving bindings in public/preview mode */
  renderContext?: RenderContext;
}

export function PageRenderer({ 
  schema, 
  mode, 
  selectedNodeId, 
  onSelectNode, 
  customComponents, 
  mockData, 
  hostData, 
  onCopyNode, 
  onPasteNode, 
  onDuplicateNode, 
  onDeleteNode, 
  canPaste, 
  onEditSection, 
  onSaveAsTemplate, 
  onRepositionNode, 
  onCopyStyle, 
  onPasteStyle, 
  canPasteStyle, 
  renderContext 
}: PageRendererProps) {
  const resolvedHostData = hostData || mockData;

  /**
   * Resolve bindings for a node if renderContext is available.
   */
  const resolveNodeBindings = (node: SchemaNode): SchemaNode => {
    if (!renderContext) return node;
    
    const bindingsConfig = (node.props as any).__bindings;
    if (bindingsConfig && (bindingsConfig.mode === 'bound' || bindingsConfig.mode === 'hybrid')) {
      const resolvedProps = resolveBindings(
        { ...node as BoundSchemaNode, bindings: bindingsConfig },
        renderContext
      );
      return { ...node, props: { ...resolvedProps } };
    }
    return node;
  };

  /**
   * Wrap element with scroll animation if configured.
   */
  const wrapWithScrollAnimation = (nodeId: string, element: React.ReactNode): React.ReactNode => {
    if (mode === 'edit') return element;
    const node = schema.nodes[nodeId];
    if (!node?.props.scrollAnimation || node.props.scrollAnimation === 'none') return element;
    return (
      <ScrollAnimationWrapper
        animation={node.props.scrollAnimation}
        delay={node.props.scrollAnimationDelay}
        duration={node.props.scrollAnimationDuration}
      >
        {element}
      </ScrollAnimationWrapper>
    );
  };

  /**
   * Render children with edit mode support (sortable wrappers).
   */
  const renderEditableChildren = (childIds: string[], depth: number = 0): React.ReactNode => {
    return (
      <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
        {childIds.map((cid) => {
          const childNode = schema.nodes[cid];
          if (!childNode || childNode.hidden) return null;

          // Check slot constraints
          const constraints = getSlotConstraints(childNode);
          const resolvedChild = resolveNodeBindings(childNode);
          
          const ChildComponent = getNodeComponent(resolvedChild.type, customComponents);
          if (!ChildComponent) return null;

          const childBlockDef = getBlockDef(resolvedChild.type);
          const childCanHaveChildren = childBlockDef?.canHaveChildren ?? false;

          const childElement = (
            <ChildComponent 
              node={resolvedChild} 
              mode={mode} 
              renderChildren={(ids: string[]) => renderEditableChildren(ids, depth + 1)} 
              mockData={resolvedHostData}
            />
          );

          const wrappedChild = childCanHaveChildren ? (
            <EditableDropZone nodeId={childNode.id} isEmpty={childNode.children.length === 0}>
              {childElement}
            </EditableDropZone>
          ) : (
            childElement
          );

          // Apply slot constraints to wrapper
          return (
            <SortableNodeWrapper
              key={cid}
              nodeId={cid}
              isSelected={selectedNodeId === cid}
              nodeType={childNode.type}
              onSelect={constraints.canEditProps ? (id) => onSelectNode?.(id) : undefined}
              onCopy={constraints.canDuplicate ? onCopyNode : undefined}
              onPaste={constraints.canEditProps ? onPasteNode : undefined}
              onDuplicate={constraints.canDuplicate ? onDuplicateNode : undefined}
              onDelete={constraints.canDelete ? onDeleteNode : undefined}
              canPaste={constraints.canEditProps ? canPaste : false}
              onEditSection={onEditSection}
              onSaveAsTemplate={onSaveAsTemplate}
              onCopyStyle={constraints.canEditStyles ? onCopyStyle : undefined}
              onPasteStyle={constraints.canEditStyles ? onPasteStyle : undefined}
              canPasteStyle={constraints.canEditStyles ? canPasteStyle : false}
              nodeStyle={childNode.style}
              onRepositionNode={constraints.canMove ? onRepositionNode : undefined}
              {wrappedChild}
            </SortableNodeWrapper>
          );
        })}
      </SortableContext>
    );
  };

  /**
   * Render children for public/preview mode (no edit wrappers).
   */
  const renderPublicChildren = (childIds: string[]): React.ReactNode => {
    return childIds.map((cid) => (
      <React.Fragment key={cid}>{renderNode(cid)}</React.Fragment>
    ));
  };

  /**
   * Main node render function.
   */
  const renderNode = (nodeId: string): React.ReactNode => {
    const node = schema.nodes[nodeId];
    if (!node || node.hidden) return null;

    // Handle dynamic slots with fallback
    if (isSlotDynamic(node) && node.children.length === 0) {
      const fallbackId = getSlotFallback(node);
      if (fallbackId && schema.nodes[fallbackId]) {
        return renderNode(fallbackId);
      }
      // In edit mode, show placeholder for empty dynamic slots
      if (mode === 'edit') {
        return (
          <div 
            data-node-id={nodeId}
            style={{
              border: '2px dashed hsl(var(--muted))',
              borderRadius: '0.5rem',
              padding: '2rem',
              textAlign: 'center',
              color: 'hsl(var(--muted-foreground))',
              fontSize: '0.75rem',
            }}
          >
            Dynamic slot: {node.slot?.__slot || nodeId}
            <br />
            <span style={{ opacity: 0.6 }}>Will be populated by data</span>
          </div>
        );
      }
      return null;
    }

    const resolvedNode = resolveNodeBindings(node);
    const Component = getNodeComponent(resolvedNode.type, customComponents);
    if (!Component) return null;

    const blockDef = getBlockDef(resolvedNode.type);
    const canHaveChildren = blockDef?.canHaveChildren ?? false;

    const renderChildren = mode === 'edit' && canHaveChildren
      ? (childIds: string[]) => renderEditableChildren(childIds)
      : renderPublicChildren;

    const element = (
      <Component 
        node={resolvedNode} 
        mode={mode} 
        renderChildren={renderChildren} 
        hostData={resolvedHostData}
        mockData={resolvedHostData} // backward compat
      />
    );

    // Root node handling
    if (mode !== 'edit') {
      return wrapWithScrollAnimation(nodeId, element);
    }

    if (nodeId === schema.rootNodeId) {
      return (
        <EditableDropZone nodeId={node.id} isEmpty={node.children.length === 0}>
          {element}
        </EditableDropZone>
      );
    }

    // Non-root nodes at top level (safety)
    const isSelected = selectedNodeId === node.id;
    const constraints = getSlotConstraints(node);

    return (
      <div
        key={node.id}
        onClick={(e) => {
          if (!constraints.canEditProps) return;
          e.stopPropagation();
          onSelectNode?.(node.id);
        }}
        style={{
          outline: isSelected ? '2px solid hsl(var(--primary))' : undefined,
          outlineOffset: isSelected ? '2px' : undefined,
          cursor: constraints.canEditProps ? 'pointer' : 'not-allowed',
          position: 'relative',
          opacity: isSlotLocked(node) && mode === 'edit' ? 0.7 : 1,
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
            {isSlotLocked(node) && ' 🔒'}
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

  /** Convert themeTokens into inline CSS custom properties */
  const themeStyle = useMemo<React.CSSProperties>(() => {
    const t = schema.themeTokens;
    return {
      '--primary': t.colors.primary,
      '--secondary': t.colors.secondary,
      '--background': t.colors.background,
      '--foreground': t.colors.text,
      '--muted': t.colors.muted,
      '--border': t.colors.border,
      '--accent': t.colors.accent || t.colors.secondary,
      '--accent-foreground': t.colors.text,
      '--primary-foreground': computeContrastForeground(t.colors.primary),
      '--secondary-foreground': computeContrastForeground(t.colors.secondary),
      '--muted-foreground': t.colors.muted,
      '--card': t.colors.background,
      '--card-foreground': t.colors.text,
      '--popover': t.colors.background,
      '--popover-foreground': t.colors.text,
      '--input': t.colors.border,
      fontFamily: t.typography.fontFamily,
      fontSize: t.typography.baseSize,
      '--nxr-heading-scale': String(t.typography.headingScale),
      '--radius': t.radius.md,
      '--nxr-radius-sm': t.radius.sm,
      '--nxr-radius-lg': t.radius.lg,
      '--nxr-space-xs': t.spacing.xs,
      '--nxr-space-sm': t.spacing.sm,
      '--nxr-space-md': t.spacing.md,
      '--nxr-space-lg': t.spacing.lg,
      '--nxr-space-xl': t.spacing.xl,
      color: `hsl(${t.colors.text})`,
      backgroundColor: `hsl(${t.colors.background})`,
      ...(t.gradient ? { backgroundImage: t.gradient } : {}),
    } as React.CSSProperties;
  }, [schema.themeTokens]);

  // Generate dynamic CSS for pseudo-states, responsive overrides, and global styles
  const dynamicCSS = useMemo(() => {
    const rules: string[] = [];

    // Global styles as CSS classes
    if (schema.globalStyles) {
      for (const [id, def] of Object.entries(schema.globalStyles)) {
        const entries = Object.entries(def.style).filter(([k, v]) => v && !['hover', 'focus', 'active', 'responsive'].includes(k));
        if (entries.length > 0) {
          const declarations = entries.map(([key, value]) => `${camelToKebab(key)}: ${value}`).join('; ');
          rules.push(`.nxr-gs-${id} { ${declarations}; }`);
        }
      }
    }

    for (const node of Object.values(schema.nodes)) {
      const pseudo = generatePseudoStateCSS(node.id, node.style);
      if (pseudo) rules.push(pseudo);
      const responsive = generateResponsiveCSS(node.id, node.style);
      if (responsive) rules.push(responsive);
      if (node.customCSS) {
        rules.push(node.customCSS.replace(/selector/g, `[data-node-id="${node.id}"]`));
      }
    }
    return rules.join('\n');
  }, [schema.nodes, schema.globalStyles]);

  return (
    <ThemeProvider value={schema.themeTokens}>
      <div style={{ ...themeStyle, containerType: 'inline-size' as any }}>
        {dynamicCSS && <style dangerouslySetInnerHTML={{ __html: dynamicCSS }} />}
        {renderNode(schema.rootNodeId)}
      </div>
    </ThemeProvider>
  );
}

function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
}
