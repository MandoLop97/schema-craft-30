import React from 'react';
import { SchemaNode, NodeType, RenderMode } from '@/types/schema';
import { SectionNode, ContainerNode, GridNode, StackNode } from './nodes/LayoutNodes';
import { TextNode, ImageNode, DividerNode, BadgeNode, SpacerNode, IconNode, SocialIconsNode } from './nodes/ContentNodes';
import { ButtonNode, CardNode, InputNode } from './nodes/UINodes';
import { ProductCardNode } from './nodes/CommerceNodes';
import { NavbarNode, FooterNode } from './nodes/SiteNodes';
import { AnnouncementBarNode, FeatureBarNode, TestimonialCardNode, NewsletterSectionNode, HeroSectionNode } from './nodes/TemplateNodes';
import { AccordionNode, TabsBlockNode, VideoEmbedNode } from './nodes/InteractiveNodes';

export interface NodeComponentProps {
  node: SchemaNode;
  mode: RenderMode;
  renderChildren: (childIds: string[]) => React.ReactNode;
  /** Mock data from PageDefinition, available in edit/preview mode */
  mockData?: Record<string, any>;
}

export type NodeComponent = React.FC<NodeComponentProps>;

/** Map of NodeType → custom React component provided by the host */
export type CustomComponentMap = Partial<Record<NodeType, NodeComponent>>;

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
  AnnouncementBar: AnnouncementBarNode,
  FeatureBar: FeatureBarNode,
  TestimonialCard: TestimonialCardNode,
  NewsletterSection: NewsletterSectionNode,
  HeroSection: HeroSectionNode,
  Accordion: AccordionNode,
  TabsBlock: TabsBlockNode,
  VideoEmbed: VideoEmbedNode,
};

export function getNodeComponent(type: NodeType, customComponents?: CustomComponentMap): NodeComponent | undefined {
  return customComponents?.[type] ?? registry[type];
}
