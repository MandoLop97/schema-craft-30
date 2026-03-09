/**
 * ════════════════════════════════════════════════════════════════════════════
 * NEXORA — PAGE TYPES, METADATA, VISIBILITY & CONSTRAINTS
 * ════════════════════════════════════════════════════════════════════════════
 */

import { NodeType } from './schema';

// ═══════════════════════════════════════════════════════════════════════════
// PAGE TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Supported page types for the e-commerce builder */
export type PageType =
  | 'home'
  | 'collection'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'static'
  | 'landing'
  | 'blog'
  | 'blog-post'
  | 'account'
  | 'search'
  | 'custom';

/** Mapping of page types to human-readable labels */
export const PAGE_TYPE_LABELS: Record<PageType, string> = {
  home: 'Home',
  collection: 'Collection',
  product: 'Product Detail',
  cart: 'Cart',
  checkout: 'Checkout',
  static: 'Static Page',
  landing: 'Landing Page',
  blog: 'Blog',
  'blog-post': 'Blog Post',
  account: 'Account',
  search: 'Search Results',
  custom: 'Custom',
};

// ═══════════════════════════════════════════════════════════════════════════
// PAGE METADATA (SEO)
// ═══════════════════════════════════════════════════════════════════════════

export interface PageMetadata {
  /** Page title for <title> tag and og:title */
  title?: string;
  /** Meta description for SEO and og:description */
  description?: string;
  /** Open Graph image URL */
  ogImage?: string;
  /** Canonical URL */
  canonical?: string;
  /** Additional meta tags */
  meta?: Array<{ name: string; content: string }>;
  /** Whether search engines should index this page */
  noIndex?: boolean;
  /** JSON-LD structured data */
  jsonLd?: Record<string, any>;
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE CONTEXT — Runtime context for a page
// ═══════════════════════════════════════════════════════════════════════════

export interface PageContext {
  /** Type of the current page */
  pageType: PageType;
  /** Current page slug */
  slug: string;
  /** URL parameters (e.g., product handle, collection handle) */
  params?: Record<string, string>;
  /** Query string parameters */
  query?: Record<string, string>;
  /** Whether this is a preview render */
  isPreview?: boolean;
  /** The page metadata */
  metadata?: PageMetadata;
}

// ═══════════════════════════════════════════════════════════════════════════
// VISIBILITY RULES
// ═══════════════════════════════════════════════════════════════════════════

export type DeviceVisibility = 'all' | 'desktop' | 'tablet' | 'mobile' | 'desktop+tablet' | 'tablet+mobile';

export interface VisibilityRule {
  /** Show/hide on specific devices */
  device?: DeviceVisibility;
  /** Show only on specific page types */
  pageTypes?: PageType[];
  /** Show only when user is authenticated */
  requireAuth?: boolean;
  /** Custom condition expression (future) */
  condition?: string;
  /** Schedule visibility */
  schedule?: {
    startDate?: string;
    endDate?: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// LOCKED PROPS — Props that should not be editable by certain users
// ═══════════════════════════════════════════════════════════════════════════

/** Configuration for locking specific props on a node */
export interface LockedPropsConfig {
  /** List of prop keys that are locked (cannot be edited) */
  lockedProps?: string[];
  /** List of style keys that are locked */
  lockedStyles?: string[];
  /** Whether the entire node is locked from deletion */
  preventDelete?: boolean;
  /** Whether the node can be moved/reordered */
  preventMove?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// BLOCK COMPATIBILITY — Per-block page type restrictions
// ═══════════════════════════════════════════════════════════════════════════

/** Default block-to-page-type compatibility map */
export const BLOCK_PAGE_TYPE_DEFAULTS: Partial<Record<NodeType, PageType[]>> = {
  ProductCard: ['home', 'collection', 'search', 'landing'],
  ProductGrid: ['home', 'collection', 'search', 'landing'],
  CollectionGrid: ['home', 'landing'],
  HeroSection: ['home', 'landing', 'collection'],
  CTASection: ['home', 'landing', 'static'],
  TestimonialSection: ['home', 'landing', 'static'],
  FAQSection: ['home', 'landing', 'static', 'product'],
  NewsletterSection: ['home', 'landing', 'static', 'blog'],
  // Layout, Content, UI, Interactive blocks are allowed on all page types by default
};

/** Check if a block type is compatible with a page type */
export function isBlockCompatibleWithPage(blockType: NodeType, pageType: PageType, allowedPageTypes?: PageType[]): boolean {
  // If the block explicitly declares allowedPageTypes, use those
  const allowed = allowedPageTypes || BLOCK_PAGE_TYPE_DEFAULTS[blockType];
  // No restrictions = allowed everywhere
  if (!allowed || allowed.length === 0) return true;
  return allowed.includes(pageType);
}
