/**
 * ════════════════════════════════════════════════════════════════════════════
 * NEXORA VISUAL BUILDER — OFFICIAL CONTRACT
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * This file defines the **shared contract** between the Nexora Visual Builder
 * and any host template that installs it via NPM.
 * 
 * Both systems MUST use these exact types, names, and structures to ensure
 * full compatibility and seamless data flow.
 * 
 * VERSION: 1.5.0
 */

import { NodeStyle, ThemeTokens, AnimationPreset, SchemaNode, Schema } from './schema';

// ═══════════════════════════════════════════════════════════════════════════
// 1. NODE TYPES — Official list of supported block types
// ═══════════════════════════════════════════════════════════════════════════

/** All built-in node types supported by the builder */
export type BuiltInNodeType =
  // Layout
  | 'Section' | 'Container' | 'Grid' | 'Stack'
  // Content
  | 'Text' | 'Image' | 'Divider' | 'Badge' | 'Spacer' | 'Icon' | 'SocialIcons'
  // UI
  | 'Button' | 'Card' | 'Input'
  // Interactive
  | 'Accordion' | 'TabsBlock' | 'VideoEmbed' | 'FormBlock'
  // Commerce
  | 'ProductCard' | 'ProductGrid' | 'CollectionGrid'
  // Site (global)
  | 'Navbar' | 'Footer' | 'AnnouncementBar'
  // Template blocks (e-commerce specific)
  | 'HeroSection' | 'FeatureBar' | 'TestimonialCard' | 'NewsletterSection'
  | 'ImageBanner' | 'RichTextSection' | 'CTASection' | 'TestimonialSection'
  | 'FAQSection';

/** Extensible node type — accepts built-in types plus any custom string */
export type NodeType = BuiltInNodeType | (string & {});

// ═══════════════════════════════════════════════════════════════════════════
// 2. DATA BINDING SYSTEM — Connect nodes to real data sources
// ═══════════════════════════════════════════════════════════════════════════

/** Supported data sources for binding */
export type DataSourceType =
  | 'products'      // Product catalog
  | 'collections'   // Product collections/categories
  | 'pages'         // CMS pages
  | 'media'         // Media library
  | 'settings'      // Site settings
  | 'custom';       // Custom data source defined by host

/** A binding maps a node prop to a data field */
export interface DataBinding {
  /** The prop key on the node (e.g., 'text', 'src', 'price') */
  propKey: string;
  /** The field path in the data source (e.g., 'product.title', 'product.images[0].url') */
  fieldPath: string;
  /** Optional transform function name (e.g., 'formatPrice', 'uppercase') */
  transform?: string;
}

/** Data source configuration for a node */
export interface NodeDataSource {
  /** Type of data source */
  type: DataSourceType;
  /** Query/filter parameters */
  query?: {
    collection?: string;
    category?: string;
    limit?: number;
    sort?: 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'popular';
    filter?: Record<string, any>;
  };
  /** Whether this node iterates over multiple items (e.g., ProductGrid) */
  isCollection?: boolean;
  /** Variable name for the current item in iteration context */
  itemVariable?: string;
}

/** Complete binding configuration for a node */
export interface NodeBindings {
  /** Data source configuration */
  dataSource?: NodeDataSource;
  /** Property bindings */
  bindings?: DataBinding[];
  /** Fallback props when no data is available */
  fallbackProps?: Record<string, any>;
  /** Binding mode */
  mode: 'manual' | 'bound' | 'hybrid';
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. NODE PROPS — Complete property definitions per node type
// ═══════════════════════════════════════════════════════════════════════════

/** Base props shared by all nodes */
export interface BaseNodeProps {
  /** Custom display name in layers panel */
  customName?: string;
  /** Scroll-triggered animation */
  scrollAnimation?: AnimationPreset | 'none';
  scrollAnimationDelay?: string;
  scrollAnimationDuration?: string;
}

/** Text node props */
export interface TextNodeProps extends BaseNodeProps {
  text?: string;
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
}

/** Image node props */
export interface ImageNodeProps extends BaseNodeProps {
  src?: string;
  alt?: string;
  loading?: 'lazy' | 'eager';
}

/** Button node props */
export interface ButtonNodeProps extends BaseNodeProps {
  text?: string;
  href?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
}

/** ProductCard props (for template) */
export interface ProductCardNodeProps extends BaseNodeProps {
  // These are typically bound to product data
  productId?: string;
  title?: string;
  price?: string;
  originalPrice?: string;
  image?: string;
  badge?: string;
  inStock?: boolean;
}

/** ProductGrid props */
export interface ProductGridNodeProps extends BaseNodeProps {
  columns?: number;
  limit?: number;
  category?: string;
  gap?: string;
  collection?: string;
  sort?: 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'popular';
}

/** CollectionGrid props */
export interface CollectionGridNodeProps extends BaseNodeProps {
  columns?: number;
  limit?: number;
  gap?: string;
  showTitle?: boolean;
  showCount?: boolean;
}

/** HeroSection props */
export interface HeroSectionNodeProps extends BaseNodeProps {
  heading?: string;
  text?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  src?: string;
  overlayOpacity?: string;
  overlayColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  minHeight?: string;
}

/** ImageBanner props */
export interface ImageBannerNodeProps extends BaseNodeProps {
  src?: string;
  alt?: string;
  href?: string;
  overlayText?: string;
  overlayPosition?: 'top' | 'center' | 'bottom';
}

/** RichTextSection props */
export interface RichTextSectionNodeProps extends BaseNodeProps {
  content?: string;
  columns?: 1 | 2;
}

/** CTASection props */
export interface CTASectionNodeProps extends BaseNodeProps {
  heading?: string;
  description?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  backgroundStyle?: 'solid' | 'gradient' | 'image';
  backgroundImage?: string;
}

/** TestimonialSection props */
export interface TestimonialSectionNodeProps extends BaseNodeProps {
  heading?: string;
  testimonials?: Array<{
    quote: string;
    author: string;
    role?: string;
    avatar?: string;
    rating?: number;
  }>;
  layout?: 'grid' | 'carousel' | 'stack';
}

/** FAQSection props */
export interface FAQSectionNodeProps extends BaseNodeProps {
  heading?: string;
  subtitle?: string;
  items?: Array<{
    question: string;
    answer: string;
  }>;
  layout?: 'accordion' | 'grid';
}

/** Navbar props */
export interface NavbarNodeProps extends BaseNodeProps {
  logoText?: string;
  logoSrc?: string;
  links?: Array<{ text: string; href: string }>;
  showSearch?: boolean;
  showCart?: boolean;
  showAccount?: boolean;
  mobileMenuStyle?: 'sidebar' | 'dropdown';
  announcementText?: string;
  announcementHref?: string;
  announcementDismissible?: boolean;
}

/** Footer props */
export interface FooterNodeProps extends BaseNodeProps {
  logoText?: string;
  logoSrc?: string;
  copyright?: string;
  links?: Array<{ text: string; href: string }>;
  columns?: Array<{
    title: string;
    links: Array<{ text: string; href: string }>;
  }>;
  socialLinks?: Array<{ platform: string; url: string }>;
  showNewsletter?: boolean;
  newsletterTitle?: string;
  newsletterPlaceholder?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. EXTENDED SCHEMA NODE — With bindings support
// ═══════════════════════════════════════════════════════════════════════════

/** Extended schema node with data binding support */
export interface BoundSchemaNode extends SchemaNode {
  /** Data binding configuration */
  bindings?: NodeBindings;
  /** Metadata for builder/renderer */
  metadata?: {
    /** Node was created from a template */
    fromTemplate?: string;
    /** Template version */
    templateVersion?: string;
    /** Node is a master template that others reference */
    isMasterTemplate?: boolean;
    /** Last edited timestamp */
    lastEdited?: string;
    /** Created by (user or system) */
    createdBy?: 'user' | 'system';
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. RENDER CONFIGURATION — How nodes should be rendered
// ═══════════════════════════════════════════════════════════════════════════

export type RenderMode = 'public' | 'preview' | 'edit';

export interface RenderContext {
  mode: RenderMode;
  /** Data available for binding */
  data?: {
    products?: any[];
    collections?: any[];
    pages?: any[];
    settings?: Record<string, any>;
    custom?: Record<string, any>;
  };
  /** Current item when rendering inside a collection */
  currentItem?: any;
  /** Item index when rendering inside a collection */
  currentIndex?: number;
  /** Theme tokens */
  theme?: ThemeTokens;
  /** Resolve asset URLs */
  resolveAssetUrl?: (path: string) => string;
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. TEMPLATE INTEGRATION — For host templates
// ═══════════════════════════════════════════════════════════════════════════

export type TemplateType = 'page' | 'header' | 'footer' | 'component' | 'single';

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

// ═══════════════════════════════════════════════════════════════════════════
// 7. BLOCK REGISTRY CONTRACT — Block definition structure
// ═══════════════════════════════════════════════════════════════════════════

export interface InspectorFieldDef {
  key: string;
  label: string;
  type: 'text' | 'select' | 'color' | 'number' | 'image' | 'toggle' | 'slider' | 'textarea' | 'link' | 'icon' | 'spacing' | 'group' | 'binding';
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  rows?: number;
  accept?: string;
  children?: InspectorFieldDef[];
  defaultValue?: any;
  /** For binding type: allowed data sources */
  allowedDataSources?: DataSourceType[];
  /** For binding type: available fields */
  bindableFields?: string[];
}

export interface BlockDefinition {
  type: NodeType;
  label: string;
  category: 'Layout' | 'Content' | 'UI' | 'Interactive' | 'Commerce' | 'Site' | 'Template' | string;
  icon: React.ComponentType<{ className?: string }>;
  canHaveChildren: boolean;
  defaultProps: Record<string, any>;
  defaultStyle: Partial<NodeStyle>;
  allowedParents?: NodeType[];
  allowedChildren?: NodeType[];
  inspectorFields?: InspectorFieldDef[];
  allowedTemplateTypes?: TemplateType[];
  /** Factory for composite blocks */
  compositeFactory?: () => { rootId: string; nodes: Record<string, SchemaNode> };
  /** Whether this block supports data binding */
  supportsBinding?: boolean;
  /** Default binding configuration */
  defaultBindings?: NodeBindings;
  /** Documentation/help text */
  description?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. EXPORT CONTRACT — What the NPM package exports
// ═══════════════════════════════════════════════════════════════════════════

/**
 * This interface documents what the @mandolop97/constructor-nexora package exports.
 * Host templates should import these items to integrate with the builder.
 */
export interface NexoraExports {
  // ── Main Component ──
  NexoraBuilderApp: React.ComponentType<any>;
  
  // ── Renderer ──
  PageRenderer: React.ComponentType<any>;
  CustomStylesInjector: React.ComponentType<any>;
  
  // ── Schema Factories ──
  createHomeSchema: () => Schema;
  createProductsSchema: () => Schema;
  createFAQSchema: () => Schema;
  createContactSchema: () => Schema;
  createHelpSchema: () => Schema;
  createPrivacySchema: () => Schema;
  createTermsSchema: () => Schema;
  createWishlistSchema: () => Schema;
  PAGE_DEFINITIONS: PageDefinition[];
  getDefaultSchemaForSlug: (slug: string) => Schema | null;
  
  // ── Block Registry ──
  blockRegistry: BlockDefinition[];
  getBlockDef: (type: NodeType) => BlockDefinition | undefined;
  registerBlock: (def: BlockDefinition) => void;
  registerBlocks: (defs: BlockDefinition[]) => void;
  getCategories: () => string[];
  getBlocksByCategory: (category: string, templateType?: TemplateType) => BlockDefinition[];
  
  // ── Node Utilities ──
  createNode: (type: NodeType) => SchemaNode;
  createNodeTree: (type: NodeType) => { rootId: string; nodes: Record<string, SchemaNode> };
  duplicateNodeTree: (sourceId: string, nodes: Record<string, SchemaNode>) => { newNodes: Record<string, SchemaNode>; newRootId: string };
  isContainerType: (type: NodeType) => boolean;
  
  // ── Style Utilities ──
  nodeStyleToCSS: (style: NodeStyle, nodeId: string) => string;
  themeTokensToCSS: (tokens: ThemeTokens) => React.CSSProperties;
  generatePseudoStateCSS: (style: NodeStyle, nodeId: string) => string;
  generateResponsiveCSS: (style: NodeStyle, nodeId: string) => string;
  
  // ── Validation ──
  validateSchema: (schema: any) => { schema: Schema | null; errors: string[] };
  
  // ── Binding Utilities ──
  resolveBindings: (node: BoundSchemaNode, context: RenderContext) => Record<string, any>;
  hydrateTemplate: (template: Schema, data: any) => Schema;
  
  // ── Version ──
  EDITOR_VERSION: string;
  
  // ── Types (re-exported) ──
  // All types from this file
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. UTILITY TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Union of all node prop types */
export type AllNodeProps =
  | TextNodeProps
  | ImageNodeProps
  | ButtonNodeProps
  | ProductCardNodeProps
  | ProductGridNodeProps
  | CollectionGridNodeProps
  | HeroSectionNodeProps
  | ImageBannerNodeProps
  | RichTextSectionNodeProps
  | CTASectionNodeProps
  | TestimonialSectionNodeProps
  | FAQSectionNodeProps
  | NavbarNodeProps
  | FooterNodeProps
  | BaseNodeProps;

/** Type guard for checking if a node supports binding */
export function supportsDataBinding(nodeType: NodeType): boolean {
  const bindableTypes: NodeType[] = [
    'ProductCard', 'ProductGrid', 'CollectionGrid',
    'HeroSection', 'TestimonialSection', 'FAQSection',
  ];
  return bindableTypes.includes(nodeType);
}

/** Type guard for checking if a node is a commerce block */
export function isCommerceBlock(nodeType: NodeType): boolean {
  const commerceTypes: NodeType[] = [
    'ProductCard', 'ProductGrid', 'CollectionGrid',
  ];
  return commerceTypes.includes(nodeType);
}

/** Type guard for checking if a node is a template block */
export function isTemplateBlock(nodeType: NodeType): boolean {
  const templateTypes: NodeType[] = [
    'HeroSection', 'FeatureBar', 'TestimonialCard', 'NewsletterSection',
    'ImageBanner', 'RichTextSection', 'CTASection', 'TestimonialSection',
    'FAQSection', 'AnnouncementBar',
  ];
  return templateTypes.includes(nodeType);
}
