import React, { useMemo } from 'react';
import { Schema, RenderMode, ThemeTokens } from '@/types/schema';
import { getNodeComponent, CustomComponentMap } from './NodeRegistry';
import { EditableDropZone } from './EditableDropZone';
import { SortableNodeWrapper } from './SortableNodeWrapper';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { getBlockDef } from '@/lib/block-registry';

interface PageRendererProps {
  schema: Schema;
  mode: RenderMode;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  customComponents?: CustomComponentMap;
  /** Mock data passed to custom components in edit/preview mode */
  mockData?: Record<string, any>;
}

export function PageRenderer({ schema, mode, selectedNodeId, onSelectNode, customComponents, mockData }: PageRendererProps) {
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

  return <div style={{ fontFamily: schema.themeTokens.typography.fontFamily }}>{renderNode(schema.rootNodeId)}</div>;
}
