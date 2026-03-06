// Schema-First Data Model for Nexora Visual Builder

export type NodeType =
  | 'Section' | 'Container' | 'Grid' | 'Stack'
  | 'Text' | 'Image' | 'Divider' | 'Badge'
  | 'Button' | 'Card' | 'Input'
  | 'ProductCard'
  | 'Navbar' | 'Footer'
  | 'AnnouncementBar' | 'FeatureBar' | 'TestimonialCard' | 'NewsletterSection'
  | 'HeroSection'
  | 'Accordion' | 'TabsBlock' | 'VideoEmbed';

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
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  overlayOpacity?: string;
  // ── Aliases for template compatibility ──
  /** Alias for `text` in HeroSection/Newsletter */
  heading?: string;
  /** Alias for `ctaHref` in HeroSection */
  ctaLink?: string;
  /** Secondary CTA button text */
  secondaryCtaText?: string;
  /** Secondary CTA button link */
  secondaryCtaLink?: string;
  /** Overlay label text in HeroSection */
  overlayText?: string;
  /** Alias for `text` in ProductCard */
  name?: string;
  /** Alias for `src` in ProductCard */
  image?: string;
  /** Alias for `text` in TestimonialCard */
  quote?: string;
  /** Alias for `label` in TestimonialCard */
  author?: string;
  /** Alias for `variant` (stars) in TestimonialCard */
  stars?: number;
  /** Alias for `href` in Button */
  link?: string;
  /** Accordion/Tabs panels: array of { title, description } */
  panels?: { title: string; description: string }[];
  /** Video embed URL */
  videoUrl?: string;
  /** Autoplay flag */
  autoplay?: boolean;
  /** Muted flag */
  muted?: boolean;
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

export interface PageDefinition {
  slug: string;
  title: string;
  schema: Schema;
  status?: 'published' | 'draft';
}

export type RenderMode = 'public' | 'preview' | 'edit';
