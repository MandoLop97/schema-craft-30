import React, { useMemo } from 'react';
import { Schema, RenderMode, ThemeTokens } from '@/types/schema';
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

export function PageRenderer({ schema, mode, selectedNodeId, onSelectNode, customComponents, mockData, hostData, onCopyNode, onPasteNode, onDuplicateNode, onDeleteNode, canPaste, onEditSection, onSaveAsTemplate, onRepositionNode, onCopyStyle, onPasteStyle, canPasteStyle, renderContext }: PageRendererProps) {
  const resolvedHostData = hostData || mockData;

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

  const renderNode = (nodeId: string): React.ReactNode => {
    const node = schema.nodes[nodeId];
    if (!node || node.hidden) return null;

    // Resolve bindings in all modes when renderContext is available
    let resolvedNode = node;
    if (renderContext) {
      const bindingsConfig = (node.props as any).__bindings;
      if (bindingsConfig && (bindingsConfig.mode === 'bound' || bindingsConfig.mode === 'hybrid')) {
        const resolvedProps = resolveBindings(
          { ...node as BoundSchemaNode, bindings: bindingsConfig },
          renderContext
        );
        resolvedNode = { ...node, props: { ...resolvedProps } };
      }
    }

    const Component = getNodeComponent(resolvedNode.type, customComponents);
    if (!Component) return null;

    const blockDef = getBlockDef(resolvedNode.type);
    const canHaveChildren = blockDef?.canHaveChildren ?? false;

    const renderChildren = (childIds: string[]) => {
      if (mode !== 'edit' || !canHaveChildren) {
        return childIds.map((cid) => <React.Fragment key={cid}>{renderNode(cid)}</React.Fragment>);
      }

      return (
        <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
          {childIds.map((cid) => {
            const childNode = schema.nodes[cid];
            if (!childNode || childNode.hidden) return null;

            // Resolve bindings for child nodes in edit mode
            let resolvedChild = childNode;
            if (renderContext) {
              const childBindings = (childNode.props as any).__bindings;
              if (childBindings && (childBindings.mode === 'bound' || childBindings.mode === 'hybrid')) {
                const resolvedChildProps = resolveBindings(
                  { ...childNode as BoundSchemaNode, bindings: childBindings },
                  renderContext
                );
                resolvedChild = { ...childNode, props: { ...resolvedChildProps } };
              }
            }

            const ChildComponent = getNodeComponent(resolvedChild.type, customComponents);
            if (!ChildComponent) return null;

            const childBlockDef = getBlockDef(resolvedChild.type);
            const childCanHaveChildren = childBlockDef?.canHaveChildren ?? false;

            const childElement = <ChildComponent node={resolvedChild} mode={mode} renderChildren={(ids: string[]) => renderChildren2(ids)} mockData={resolvedHostData} />;

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
                onSaveAsTemplate={onSaveAsTemplate}
                onCopyStyle={onCopyStyle}
                onPasteStyle={onPasteStyle}
                canPasteStyle={canPasteStyle}
                nodeStyle={childNode.style}
                onRepositionNode={onRepositionNode}
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

            // Resolve bindings for nested child nodes
            let resolvedChild = childNode;
            if (renderContext) {
              const childBindings = (childNode.props as any).__bindings;
              if (childBindings && (childBindings.mode === 'bound' || childBindings.mode === 'hybrid')) {
                const resolvedChildProps = resolveBindings(
                  { ...childNode as BoundSchemaNode, bindings: childBindings },
                  renderContext
                );
                resolvedChild = { ...childNode, props: { ...resolvedChildProps } };
              }
            }

            const ChildComponent = getNodeComponent(resolvedChild.type, customComponents);
            if (!ChildComponent) return null;

            const childBlockDef = getBlockDef(resolvedChild.type);
            const childCanHaveChildren = childBlockDef?.canHaveChildren ?? false;

            const childElement = <ChildComponent node={resolvedChild} mode={mode} renderChildren={(ids: string[]) => renderChildren2(ids)} mockData={resolvedHostData} />;

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
                onSaveAsTemplate={onSaveAsTemplate}
                onCopyStyle={onCopyStyle}
                onPasteStyle={onPasteStyle}
                canPasteStyle={canPasteStyle}
                nodeStyle={childNode.style}
                onRepositionNode={onRepositionNode}
              >
                {wrappedChild}
              </SortableNodeWrapper>
            );
          })}
        </SortableContext>
      );
    };

    const element = <Component node={resolvedNode} mode={mode} renderChildren={renderChildren} mockData={mockData} />;

    // Root node: don't wrap in sortable
    if (mode !== 'edit') return wrapWithScrollAnimation(nodeId, element);

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
