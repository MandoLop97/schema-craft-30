// Schema-First Data Model for Nexora Visual Builder

export type NodeType =
  | 'Section' | 'Container' | 'Grid' | 'Stack'
  | 'Text' | 'Image' | 'Divider' | 'Badge'
  | 'Button' | 'Card' | 'Input'
  | 'ProductCard'
  | 'Navbar' | 'Footer'
  | 'AnnouncementBar' | 'FeatureBar' | 'TestimonialCard' | 'NewsletterSection'
  | 'HeroSection';

export interface NodeStyle {
  padding?: string;
  margin?: string;
  gap?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  boxShadow?: string;
  width?: string;
  height?: string;
  minHeight?: string;
  maxWidth?: string;
  alignItems?: string;
  justifyContent?: string;
  textAlign?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  display?: string;
  flexDirection?: string;
  gridTemplateColumns?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  opacity?: string;
  overflow?: string;
  position?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  zIndex?: string;
}

export interface NodeProps {
  text?: string;
  href?: string;
  src?: string;
  alt?: string;
  variant?: string;
  placeholder?: string;
  label?: string;
  price?: string;
  originalPrice?: string;
  badge?: string;
  logoText?: string;
  links?: { text: string; href: string }[];
  columns?: number;
  direction?: 'horizontal' | 'vertical';
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  copyright?: string;
  items?: { icon?: string; title: string; description: string }[];
}

export interface SchemaNode {
  id: string;
  type: NodeType;
  props: NodeProps;
  style: NodeStyle;
  children: string[];
  locked?: boolean;
  hidden?: boolean;
}

export interface ThemeTokens {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    muted: string;
    border: string;
    accent?: string;
  };
  typography: {
    fontFamily: string;
    baseSize: string;
    headingScale: number;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface Schema {
  id: string;
  version: number;
  updatedAt: string;
  themeTokens: ThemeTokens;
  rootNodeId: string;
  nodes: Record<string, SchemaNode>;
}

export interface Page {
  id: string;
  slug: string;
  name: string;
  schemaId: string;
}

export type RenderMode = 'public' | 'preview' | 'edit';
