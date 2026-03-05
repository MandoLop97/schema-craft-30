import React from 'react';
import { SchemaNode, NodeType, RenderMode } from '@/types/schema';
import { SectionNode, ContainerNode, GridNode, StackNode } from './nodes/LayoutNodes';
import { TextNode, ImageNode, DividerNode, BadgeNode } from './nodes/ContentNodes';
import { ButtonNode, CardNode, InputNode } from './nodes/UINodes';
import { ProductCardNode } from './nodes/CommerceNodes';
import { NavbarNode, FooterNode } from './nodes/SiteNodes';

export interface NodeComponentProps {
  node: SchemaNode;
  mode: RenderMode;
  renderChildren: (childIds: string[]) => React.ReactNode;
}

type NodeComponent = React.FC<NodeComponentProps>;

const registry: Record<NodeType, NodeComponent> = {
  Section: SectionNode,
  Container: ContainerNode,
  Grid: GridNode,
  Stack: StackNode,
  Text: TextNode,
  Image: ImageNode,
  Divider: DividerNode,
  Badge: BadgeNode,
  Button: ButtonNode,
  Card: CardNode,
  Input: InputNode,
  ProductCard: ProductCardNode,
  Navbar: NavbarNode,
  Footer: FooterNode,
};

export function getNodeComponent(type: NodeType): NodeComponent | undefined {
  return registry[type];
}
