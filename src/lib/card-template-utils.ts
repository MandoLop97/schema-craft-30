/**
 * Utilities for hydrating a Product Card template with real product data.
 * The template is stored as a schema in page_schemas (slug: '__template/product-card').
 */
import { SchemaNode } from '@/types/schema';

export interface ProductData {
  id: string;
  name: string;
  price: number;
  original_price?: number | null;
  image_url?: string | null;
  badge?: string | null;
  description?: string | null;
  category?: string | null;
  in_stock?: boolean | null;
  sku?: string | null;
}

const uid = () => `node-${Math.random().toString(36).slice(2, 9)}`;

/**
 * Clones a template's node tree and injects product data into the appropriate nodes.
 * Detection strategy:
 *  - Image node → src = product.image_url
 *  - Text with level 'h3' → text = product.name
 *  - Text with fontWeight '600' (price) → text = formatted price
 *  - Text with textDecoration 'line-through' → text = original price (hidden if null)
 *  - Badge → text = product.badge (hidden if null)
 *  - Button → locked, emits addToCart event
 */
export function hydrateCardTemplate(
  templateNodes: Record<string, SchemaNode>,
  rootNodeId: string,
  product: ProductData,
): { nodes: Record<string, SchemaNode>; rootId: string } {
  const idMap = new Map<string, string>();

  // First pass: create ID mappings
  for (const oldId of Object.keys(templateNodes)) {
    idMap.set(oldId, `${uid()}-${product.id.slice(0, 6)}`);
  }

  const newNodes: Record<string, SchemaNode> = {};

  for (const [oldId, node] of Object.entries(templateNodes)) {
    const newId = idMap.get(oldId)!;
    const cloned: SchemaNode = {
      id: newId,
      type: node.type,
      props: JSON.parse(JSON.stringify(node.props)),
      style: JSON.parse(JSON.stringify(node.style)),
      children: node.children.map((cid) => idMap.get(cid) || cid),
      locked: node.locked,
      hidden: node.hidden,
      customName: node.customName,
      customCSS: node.customCSS,
      appliedGlobalStyles: node.appliedGlobalStyles ? [...node.appliedGlobalStyles] : undefined,
    };

    // Normalize root node styles for grid context
    if (oldId === rootNodeId) {
      delete cloned.style.width;
      delete cloned.style.maxWidth;
      delete cloned.style.minWidth;
      cloned.style.width = '100%';
      cloned.style.height = 'auto';
      cloned.style.overflow = 'hidden';
    }

    // Inject product data based on node type and style hints
    if (cloned.type === 'Image') {
      cloned.props.src = product.image_url || '/placeholder.svg';
      cloned.props.alt = product.name;
      cloned.style.width = '100%';
      cloned.style.height = 'auto';
      cloned.style.objectFit = 'cover';
    } else if (cloned.type === 'Text') {
      if (cloned.props.level === 'h3') {
        // Product name
        cloned.props.text = product.name;
      } else if (cloned.style.textDecoration === 'line-through') {
        // Original price
        if (product.original_price) {
          cloned.props.text = `$${product.original_price}`;
          cloned.hidden = false;
        } else {
          cloned.hidden = true;
        }
      } else if (cloned.style.fontWeight === '600') {
        // Current price
        cloned.props.text = `$${product.price}`;
      }
    } else if (cloned.type === 'Badge') {
      if (product.badge) {
        cloned.props.text = product.badge;
        cloned.hidden = false;
      } else {
        cloned.hidden = true;
      }
    } else if (cloned.type === 'Button') {
      // Keep the button text from the template but attach product ID
      cloned.props._productId = product.id;
      cloned.locked = true;
    } else if (cloned.type === 'ProductCard') {
      // Attach product ID to root for event dispatching
      cloned.props._productId = product.id;
    }

    newNodes[newId] = cloned;
  }

  const newRootId = idMap.get(rootNodeId)!;
  return { nodes: newNodes, rootId: newRootId };
}

/**
 * Formats a number as a currency string.
 */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2).replace(/\.00$/, '')}`;
}
