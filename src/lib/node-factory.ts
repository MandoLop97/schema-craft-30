import { SchemaNode, NodeType, NodeProps, NodeStyle } from '@/types/schema';
import { getBlockDef } from './block-registry';

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
