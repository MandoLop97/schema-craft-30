/**
 * ════════════════════════════════════════════════════════════════════════════
 * DATA BINDING UTILITIES
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Utilities for resolving data bindings, hydrating templates with real data,
 * and transforming bound values.
 */

import { 
  NodeBindings, 
  DataBinding, 
  RenderContext, 
  BoundSchemaNode,
  NodeDataSource 
} from '@/types/contract';
import { Schema, SchemaNode } from '@/types/schema';

// ═══════════════════════════════════════════════════════════════════════════
// VALUE TRANSFORMERS
// ═══════════════════════════════════════════════════════════════════════════

/** Built-in transform functions */
const transforms: Record<string, (value: any, ...args: any[]) => any> = {
  uppercase: (v) => String(v).toUpperCase(),
  lowercase: (v) => String(v).toLowerCase(),
  capitalize: (v) => String(v).charAt(0).toUpperCase() + String(v).slice(1),
  formatPrice: (v, currency = '$') => `${currency}${Number(v).toFixed(2)}`,
  truncate: (v, length = 50) => {
    const str = String(v);
    return str.length > length ? str.slice(0, length) + '...' : str;
  },
  default: (v, fallback) => v ?? fallback,
  json: (v) => JSON.stringify(v),
  first: (v) => Array.isArray(v) ? v[0] : v,
  last: (v) => Array.isArray(v) ? v[v.length - 1] : v,
  count: (v) => Array.isArray(v) ? v.length : 0,
  join: (v, separator = ', ') => Array.isArray(v) ? v.join(separator) : String(v),
};

/**
 * Apply a transform to a value
 */
function applyTransform(value: any, transformName?: string): any {
  if (!transformName) return value;
  
  // Parse transform: "functionName" or "functionName:arg1:arg2"
  const [fnName, ...args] = transformName.split(':');
  const fn = transforms[fnName];
  
  if (!fn) {
    console.warn(`[Bindings] Unknown transform: ${fnName}`);
    return value;
  }
  
  return fn(value, ...args);
}

// ═══════════════════════════════════════════════════════════════════════════
// FIELD PATH RESOLUTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Resolve a nested field path like "product.images[0].url"
 */
export function resolveFieldPath(data: any, path: string): any {
  if (!data || !path) return undefined;
  
  const segments = path.split(/[.\[\]]+/).filter(Boolean);
  let current = data;
  
  for (const segment of segments) {
    if (current === null || current === undefined) return undefined;
    current = current[segment];
  }
  
  return current;
}

/**
 * Set a value at a nested path
 */
export function setFieldPath(data: any, path: string, value: any): void {
  if (!data || !path) return;
  
  const segments = path.split(/[.\[\]]+/).filter(Boolean);
  let current = data;
  
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    if (current[segment] === undefined) {
      // Create array or object based on next segment
      const nextSegment = segments[i + 1];
      current[segment] = /^\d+$/.test(nextSegment) ? [] : {};
    }
    current = current[segment];
  }
  
  current[segments[segments.length - 1]] = value;
}

// ═══════════════════════════════════════════════════════════════════════════
// BINDING RESOLUTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Resolve all bindings for a node and return the final props
 */
export function resolveBindings(
  node: BoundSchemaNode,
  context: RenderContext
): Record<string, any> {
  const { bindings } = node;
  
  // If no bindings or manual mode, return original props
  if (!bindings || bindings.mode === 'manual') {
    return { ...node.props };
  }
  
  const resolvedProps: Record<string, any> = {};
  const dataSource = bindings.dataSource;
  
  // Get the data based on source type
  let sourceData: any = null;
  
  if (dataSource) {
    switch (dataSource.type) {
      case 'products':
        sourceData = context.data?.products;
        break;
      case 'collections':
        sourceData = context.data?.collections;
        break;
      case 'pages':
        sourceData = context.data?.pages;
        break;
      case 'settings':
        sourceData = context.data?.settings;
        break;
      case 'custom':
        sourceData = context.data?.custom;
        break;
    }
    
    // If we're in an iteration context, use the current item
    if (context.currentItem !== undefined) {
      sourceData = context.currentItem;
    }
    
    // Apply query filters if it's a collection
    if (dataSource.isCollection && Array.isArray(sourceData) && dataSource.query) {
      sourceData = applyQueryFilters(sourceData, dataSource.query);
    }
  }
  
  // Resolve each binding
  if (bindings.bindings && sourceData) {
    for (const binding of bindings.bindings) {
      const rawValue = resolveFieldPath(sourceData, binding.fieldPath);
      const transformedValue = applyTransform(rawValue, binding.transform);
      
      if (transformedValue !== undefined) {
        resolvedProps[binding.propKey] = transformedValue;
      }
    }
  }
  
  // Merge with fallback props and original props
  // Priority: bindings > original props > fallback props
  return {
    ...bindings.fallbackProps,
    ...node.props,
    ...resolvedProps,
  };
}

/**
 * Apply query filters to a data array
 */
function applyQueryFilters(
  data: any[],
  query: NonNullable<NodeDataSource['query']>
): any[] {
  let result = [...data];
  
  // Filter by category
  if (query.category) {
    result = result.filter(item => item.category === query.category);
  }
  
  // Filter by collection
  if (query.collection) {
    result = result.filter(item => item.collection === query.collection);
  }
  
  // Apply custom filters
  if (query.filter) {
    result = result.filter(item => {
      for (const [key, value] of Object.entries(query.filter!)) {
        if (item[key] !== value) return false;
      }
      return true;
    });
  }
  
  // Sort
  if (query.sort) {
    result.sort((a, b) => {
      switch (query.sort) {
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'price-asc':
          return (a.price || 0) - (b.price || 0);
        case 'price-desc':
          return (b.price || 0) - (a.price || 0);
        case 'popular':
          return (b.popularity || 0) - (a.popularity || 0);
        default:
          return 0;
      }
    });
  }
  
  // Limit
  if (query.limit) {
    result = result.slice(0, query.limit);
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE HYDRATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hydrate a template schema with real data.
 * Creates a new schema with bound values resolved.
 */
export function hydrateTemplate(
  template: Schema,
  data: RenderContext['data']
): Schema {
  const context: RenderContext = {
    mode: 'public',
    data,
    theme: template.themeTokens,
  };
  
  const hydratedNodes: Record<string, SchemaNode> = {};
  
  for (const [nodeId, node] of Object.entries(template.nodes)) {
    const boundNode = node as BoundSchemaNode;
    const resolvedProps = resolveBindings(boundNode, context);
    
    hydratedNodes[nodeId] = {
      ...node,
      props: resolvedProps,
    };
  }
  
  return {
    ...template,
    nodes: hydratedNodes,
  };
}

/**
 * Hydrate a single node for iteration (e.g., ProductGrid items)
 */
export function hydrateNodeForItem(
  node: SchemaNode,
  item: any,
  index: number,
  template: Schema
): SchemaNode {
  const boundNode = node as BoundSchemaNode;
  const context: RenderContext = {
    mode: 'public',
    currentItem: item,
    currentIndex: index,
    theme: template.themeTokens,
  };
  
  const resolvedProps = resolveBindings(boundNode, context);
  
  return {
    ...node,
    props: resolvedProps,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// BINDING HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a default binding configuration for a node type
 */
export function createDefaultBindings(nodeType: string): NodeBindings {
  switch (nodeType) {
    case 'ProductGrid':
      return {
        mode: 'bound',
        dataSource: {
          type: 'products',
          isCollection: true,
          itemVariable: 'product',
          query: { limit: 8 },
        },
      };
    
    case 'ProductCard':
      return {
        mode: 'bound',
        bindings: [
          { propKey: 'text', fieldPath: 'name' },
          { propKey: 'price', fieldPath: 'price', transform: 'formatPrice' },
          { propKey: 'originalPrice', fieldPath: 'original_price', transform: 'formatPrice' },
          { propKey: 'src', fieldPath: 'image_url' },
          { propKey: 'badge', fieldPath: 'badge' },
        ],
        fallbackProps: {
          text: 'Product Name',
          price: '$0.00',
          src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
        },
      };
    
    case 'CollectionGrid':
      return {
        mode: 'bound',
        dataSource: {
          type: 'collections',
          isCollection: true,
          itemVariable: 'collection',
          query: { limit: 6 },
        },
      };
    
    default:
      return { mode: 'manual' };
  }
}

/**
 * Check if a node has active bindings
 */
export function hasActiveBindings(node: SchemaNode): boolean {
  const boundNode = node as BoundSchemaNode;
  return boundNode.bindings?.mode === 'bound' || boundNode.bindings?.mode === 'hybrid';
}

/**
 * Get the list of props that are currently bound
 */
export function getBoundProps(node: SchemaNode): string[] {
  const boundNode = node as BoundSchemaNode;
  if (!boundNode.bindings?.bindings) return [];
  return boundNode.bindings.bindings.map(b => b.propKey);
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSFORM REGISTRY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Register a custom transform function
 */
export function registerTransform(name: string, fn: (value: any, ...args: any[]) => any): void {
  transforms[name] = fn;
}

/**
 * Get available transform names
 */
export function getAvailableTransforms(): string[] {
  return Object.keys(transforms);
}
