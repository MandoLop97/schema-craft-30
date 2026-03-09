/**
 * ════════════════════════════════════════════════════════════════════════════
 * NEXORA — PUBLISH VALIDATOR
 * ════════════════════════════════════════════════════════════════════════════
 * Validates a schema before publishing to catch structural issues,
 * missing required props, orphan nodes, and binding errors.
 */

import { Schema, SchemaNode, NodeType } from '@/types/schema';
import { getBlockDef } from '@/lib/block-registry';
import { PageType, isBlockCompatibleWithPage } from '@/types/page-types';

export type ValidationSeverity = 'error' | 'warning';

export interface ValidationIssue {
  severity: ValidationSeverity;
  nodeId?: string;
  nodeType?: string;
  message: string;
  code: string;
}

export interface PublishValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

interface ValidatorOptions {
  /** Current page type for compatibility checks */
  pageType?: PageType;
  /** Whether to check bindings */
  checkBindings?: boolean;
  /** Custom required props per node type */
  requiredProps?: Partial<Record<NodeType, string[]>>;
}

/** Default required props for built-in blocks */
const DEFAULT_REQUIRED_PROPS: Partial<Record<NodeType, string[]>> = {
  Image: ['src'],
  Button: ['text'],
  HeroSection: ['heading'],
  ProductGrid: ['columns'],
  Navbar: ['logoText'],
  Footer: ['copyright'],
};

export function validateForPublish(schema: Schema, options: ValidatorOptions = {}): PublishValidationResult {
  const issues: ValidationIssue[] = [];
  const { pageType, checkBindings = true, requiredProps } = options;
  const mergedRequired = { ...DEFAULT_REQUIRED_PROPS, ...requiredProps };

  // ── 1. Structural validation ──
  if (!schema.rootNodeId) {
    issues.push({ severity: 'error', message: 'Schema has no root node', code: 'NO_ROOT' });
    return buildResult(issues);
  }

  if (!schema.nodes[schema.rootNodeId]) {
    issues.push({ severity: 'error', message: `Root node "${schema.rootNodeId}" not found`, code: 'ROOT_MISSING' });
    return buildResult(issues);
  }

  // ── 2. Build reachability set ──
  const reachable = new Set<string>();
  function walk(nodeId: string) {
    if (reachable.has(nodeId)) return;
    reachable.add(nodeId);
    const node = schema.nodes[nodeId];
    if (node?.children) {
      node.children.forEach(walk);
    }
  }
  walk(schema.rootNodeId);

  // ── 3. Detect orphan nodes ──
  const allNodeIds = Object.keys(schema.nodes);
  const orphans = allNodeIds.filter((id) => !reachable.has(id));
  if (orphans.length > 0) {
    issues.push({
      severity: 'warning',
      message: `${orphans.length} orphan node(s) detected: ${orphans.slice(0, 3).join(', ')}${orphans.length > 3 ? '...' : ''}`,
      code: 'ORPHAN_NODES',
    });
  }

  // ── 4. Per-node validation ──
  for (const nodeId of reachable) {
    const node = schema.nodes[nodeId];
    if (!node) {
      issues.push({ severity: 'error', nodeId, message: `Node "${nodeId}" referenced but not found`, code: 'NODE_MISSING' });
      continue;
    }

    // Check dangling children
    for (const childId of node.children) {
      if (!schema.nodes[childId]) {
        issues.push({
          severity: 'error',
          nodeId,
          nodeType: node.type,
          message: `Node "${nodeId}" references missing child "${childId}"`,
          code: 'CHILD_MISSING',
        });
      }
    }

    // Check required props
    const required = mergedRequired[node.type];
    if (required) {
      for (const propKey of required) {
        const value = node.props[propKey];
        if (value === undefined || value === null || value === '') {
          issues.push({
            severity: 'warning',
            nodeId,
            nodeType: node.type,
            message: `${node.type} is missing required prop "${propKey}"`,
            code: 'MISSING_PROP',
          });
        }
      }
    }

    // Check page type compatibility
    if (pageType) {
      const blockDef = getBlockDef(node.type);
      const allowedPageTypes = (blockDef as any)?.allowedPageTypes;
      if (!isBlockCompatibleWithPage(node.type, pageType, allowedPageTypes)) {
        issues.push({
          severity: 'warning',
          nodeId,
          nodeType: node.type,
          message: `${node.type} is not recommended for page type "${pageType}"`,
          code: 'PAGE_TYPE_INCOMPATIBLE',
        });
      }
    }

    // Check invalid bindings
    if (checkBindings) {
      const bindings = (node.props as any).__bindings;
      if (bindings) {
        if (bindings.mode === 'bound' && (!bindings.bindings || bindings.bindings.length === 0)) {
          issues.push({
            severity: 'warning',
            nodeId,
            nodeType: node.type,
            message: `${node.type} has binding mode "bound" but no bindings configured`,
            code: 'EMPTY_BINDINGS',
          });
        }
        if (bindings.bindings) {
          for (const binding of bindings.bindings) {
            if (!binding.propKey || !binding.fieldPath) {
              issues.push({
                severity: 'error',
                nodeId,
                nodeType: node.type,
                message: `${node.type} has an incomplete binding (missing propKey or fieldPath)`,
                code: 'INVALID_BINDING',
              });
            }
          }
        }
      }
    }

    // Check node type is registered
    const blockDef = getBlockDef(node.type);
    if (!blockDef) {
      issues.push({
        severity: 'warning',
        nodeId,
        nodeType: node.type,
        message: `Node type "${node.type}" is not registered in the block registry`,
        code: 'UNKNOWN_TYPE',
      });
    }
  }

  // ── 5. Theme tokens validation ──
  if (!schema.themeTokens) {
    issues.push({ severity: 'warning', message: 'Schema has no theme tokens', code: 'NO_THEME' });
  }

  return buildResult(issues);
}

function buildResult(issues: ValidationIssue[]): PublishValidationResult {
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  return {
    valid: errors.length === 0,
    issues,
    errors,
    warnings,
  };
}
