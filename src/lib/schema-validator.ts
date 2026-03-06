import { Schema } from '@/types/schema';

export interface SchemaValidationResult {
  valid: boolean;
  errors: string[];
  /** The cleaned schema (orphan children removed) or null if fatally invalid. */
  schema: Schema | null;
}

/**
 * Validates a schema for structural integrity.
 * - rootNodeId must exist in nodes
 * - Every children reference must point to an existing node
 * Returns a cleaned copy with dangling references removed.
 */
export function validateSchema(input: Schema): SchemaValidationResult {
  const errors: string[] = [];

  if (!input) {
    return { valid: false, errors: ['Schema is null or undefined'], schema: null };
  }

  if (!input.rootNodeId || !input.nodes) {
    return { valid: false, errors: ['Schema is missing rootNodeId or nodes'], schema: null };
  }

  if (!input.nodes[input.rootNodeId]) {
    return { valid: false, errors: [`rootNodeId "${input.rootNodeId}" not found in nodes`], schema: null };
  }

  // Deep clone to avoid mutating the original
  const schema: Schema = JSON.parse(JSON.stringify(input));

  // Clean dangling children references
  for (const node of Object.values(schema.nodes)) {
    const validChildren = node.children.filter((childId) => {
      if (!schema.nodes[childId]) {
        errors.push(`Node "${node.id}" references missing child "${childId}" — removed`);
        return false;
      }
      return true;
    });
    node.children = validChildren;
  }

  return { valid: errors.length === 0, errors, schema };
}
