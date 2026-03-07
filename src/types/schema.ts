// Schema-First Data Model for Nexora Visual Builder
import React from 'react';

export type BuiltInNodeType =
  | 'Section' | 'Container' | 'Grid' | 'Stack'
  | 'Text' | 'Image' | 'Divider' | 'Badge'
  | 'Button' | 'Card' | 'Input'
  | 'ProductCard'
  | 'Navbar' | 'Footer'
  | 'AnnouncementBar' | 'FeatureBar' | 'TestimonialCard' | 'NewsletterSection'
  | 'HeroSection'
  | 'Accordion' | 'TabsBlock' | 'VideoEmbed'
  | 'Spacer' | 'Icon' | 'SocialIcons'
  | 'FormBlock';

/** Extensible node type — accepts all built-in types plus any custom string. */
export type NodeType = BuiltInNodeType | (string & {});

export interface NodeStyle {
  // ── Layout & Box Model ──
  padding?: string;
  margin?: string;
  gap?: string;
  width?: string;
  height?: string;
  minHeight?: string;
  maxWidth?: string;
  minWidth?: string;
  maxHeight?: string;
  display?: string;
  flexDirection?: string;
  flexWrap?: string;
  flexGrow?: string;
  flexShrink?: string;
  alignItems?: string;
  justifyContent?: string;
  alignSelf?: string;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridColumn?: string;
  gridRow?: string;
  overflow?: string;
  overflowX?: string;
  overflowY?: string;
  position?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  zIndex?: string;
  float?: string;
  clear?: string;

  // ── Typography ──
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  fontStyle?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: string;
  textTransform?: string;
  textDecoration?: string;
  textShadow?: string;
  wordSpacing?: string;
  whiteSpace?: string;
  textOverflow?: string;

  // ── Background ──
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  backgroundAttachment?: string;
  backgroundBlendMode?: string;
  backgroundGradient?: string;
  backgroundClip?: string;

  // ── Border ──
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  borderStyle?: string;
  borderTop?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRight?: string;
  borderTopLeftRadius?: string;
  borderTopRightRadius?: string;
  borderBottomLeftRadius?: string;
  borderBottomRightRadius?: string;

  // ── Outline ──
  outline?: string;
  outlineOffset?: string;
  outlineColor?: string;
  outlineStyle?: string;
  outlineWidth?: string;

  // ── Shadow & Effects ──
  boxShadow?: string;
  opacity?: string;
  filter?: string;
  backdropFilter?: string;
  mixBlendMode?: string;
  clipPath?: string;
  cursor?: string;
  pointerEvents?: string;
  userSelect?: string;
  visibility?: string;

  // ── Transforms ──
  transform?: string;
  transformOrigin?: string;
  perspective?: string;
  perspectiveOrigin?: string;

  // ── Transitions ──
  transition?: string;
  transitionProperty?: string;
  transitionDuration?: string;
  transitionTimingFunction?: string;
  transitionDelay?: string;

  // ── Animations ──
  animation?: string;
  animationName?: string;
  animationDuration?: string;
  animationDelay?: string;
  animationTimingFunction?: string;
  animationIterationCount?: string;
  animationFillMode?: string;
  animationDirection?: string;
  animationPlayState?: string;

  // ── Pseudo-state overrides ──
  hover?: Partial<Omit<NodeStyle, 'hover' | 'focus' | 'active' | 'responsive'>>;
  focus?: Partial<Omit<NodeStyle, 'hover' | 'focus' | 'active' | 'responsive'>>;
  active?: Partial<Omit<NodeStyle, 'hover' | 'focus' | 'active' | 'responsive'>>;

  // ── Responsive overrides by breakpoint ──
  responsive?: {
    sm?: Partial<Omit<NodeStyle, 'hover' | 'focus' | 'active' | 'responsive'>>;
    md?: Partial<Omit<NodeStyle, 'hover' | 'focus' | 'active' | 'responsive'>>;
    lg?: Partial<Omit<NodeStyle, 'hover' | 'focus' | 'active' | 'responsive'>>;
    xl?: Partial<Omit<NodeStyle, 'hover' | 'focus' | 'active' | 'responsive'>>;
  };
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
  heading?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  overlayText?: string;
  name?: string;
  image?: string;
  quote?: string;
  author?: string;
  stars?: number;
  link?: string;
  panels?: { title: string; description: string }[];
  videoUrl?: string;
  autoplay?: boolean;
  muted?: boolean;
  /** Allow arbitrary extra props from custom blocks */
  [key: string]: any;
}

export interface SchemaNode {
  id: string;
  type: NodeType;
  props: NodeProps;
  style: NodeStyle;
  children: string[];
  locked?: boolean;
  hidden?: boolean;
  customName?: string;
  /** Raw CSS applied to this specific widget */
  customCSS?: string;
  /** IDs of global styles applied to this node */
  appliedGlobalStyles?: string[];
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
  gradient?: string;
  /** Default ProductCard layout used across the site */
  defaultCardLayout?: 'vertical' | 'horizontal' | 'minimal' | 'overlay';
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
  templateType?: TemplateType;
  category?: string;
  icon?: React.ComponentType;
  canvasSize?: { width: number; height: number };
  mockData?: Record<string, any>;
}

export type RenderMode = 'public' | 'preview' | 'edit';

export type TemplateType = 'page' | 'header' | 'footer' | 'component' | 'single';

/** Predefined animation presets available in the Inspector */
export type AnimationPreset =
  | 'fadeIn' | 'fadeOut'
  | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight'
  | 'scaleIn' | 'scaleOut'
  | 'bounceIn' | 'pulse' | 'shake'
  | 'none';

/** Maps animation preset names to CSS animation values */
export const ANIMATION_PRESETS: Record<AnimationPreset, string> = {
  none: '',
  fadeIn: 'nxr-fadeIn 0.5s ease-out forwards',
  fadeOut: 'nxr-fadeOut 0.5s ease-out forwards',
  slideUp: 'nxr-slideUp 0.5s ease-out forwards',
  slideDown: 'nxr-slideDown 0.5s ease-out forwards',
  slideLeft: 'nxr-slideLeft 0.5s ease-out forwards',
  slideRight: 'nxr-slideRight 0.5s ease-out forwards',
  scaleIn: 'nxr-scaleIn 0.4s ease-out forwards',
  scaleOut: 'nxr-scaleOut 0.4s ease-out forwards',
  bounceIn: 'nxr-bounceIn 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards',
  pulse: 'nxr-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  shake: 'nxr-shake 0.5s ease-in-out',
};
