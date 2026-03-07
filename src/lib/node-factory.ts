import { SchemaNode, NodeType, NodeProps, NodeStyle, Schema } from '@/types/schema';
import { getBlockDef, CompositeNodeTree } from './block-registry';

const uid = () => `node-${Math.random().toString(36).slice(2, 9)}`;

export function isContainerType(type: NodeType): boolean {
  const def = getBlockDef(type);
  return def?.canHaveChildren ?? false;
}

export function createNode(type: NodeType): SchemaNode {
  const def = getBlockDef(type);
  return {
    id: uid(),
    type,
    props: { ...(def?.defaultProps || {}) },
    style: { ...(def?.defaultStyle || {}) },
    children: [],
  };
}

/**
 * Creates a node tree. If the block has a compositeFactory, returns the full
 * composite tree. Otherwise returns a single-node tree.
 */
export function createNodeTree(type: NodeType): CompositeNodeTree {
  const def = getBlockDef(type);
  if (def?.compositeFactory) {
    return def.compositeFactory();
  }
  const node = createNode(type);
  return { rootId: node.id, nodes: { [node.id]: node } };
}

/**
 * Deep-clone a node and all its descendants, assigning fresh IDs.
 * Returns a map of all new nodes (keyed by new ID) and the new root ID.
 */
export function duplicateNodeTree(
  sourceId: string,
  nodes: Record<string, SchemaNode>,
): { newNodes: Record<string, SchemaNode>; newRootId: string } {
  const newNodes: Record<string, SchemaNode> = {};

  function cloneRecursive(id: string): string {
    const source = nodes[id];
    if (!source) return id;

    const newId = uid();
    const clonedChildren = source.children.map(cloneRecursive);

    newNodes[newId] = {
      id: newId,
      type: source.type,
      props: JSON.parse(JSON.stringify(source.props)),
      style: JSON.parse(JSON.stringify(source.style)),
      children: clonedChildren,
      locked: source.locked,
      hidden: source.hidden,
    };

    return newId;
  }

  const newRootId = cloneRecursive(sourceId);
  return { newNodes, newRootId };
}
