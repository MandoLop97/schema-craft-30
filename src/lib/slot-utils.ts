/**
 * ════════════════════════════════════════════════════════════════════════════
 * SLOT UTILITIES
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Runtime utilities for handling slot behavior in the builder and renderer.
 */

import { SchemaNode, Schema } from '@/types/schema';
import { SlotBehavior, SlotAssignment } from '@/types/contract';

/**
 * Get the slot assignment for a node, if any.
 */
export function getSlotAssignment(node: SchemaNode): SlotAssignment | undefined {
  return node.slot;
}

/**
 * Check if a node is assigned to a specific slot.
 */
export function isInSlot(node: SchemaNode, slotName: string): boolean {
  return node.slot?.__slot === slotName;
}

/**
 * Get the behavior of a node's slot.
 * Returns 'editable' as default if no slot is assigned.
 */
export function getSlotBehavior(node: SchemaNode): SlotBehavior {
  return node.slot?.behavior ?? 'editable';
}

/**
 * Check if a node is locked (cannot be edited/moved/deleted).
 */
export function isSlotLocked(node: SchemaNode): boolean {
  return node.slot?.behavior === 'locked' || node.locked === true;
}

/**
 * Check if a node is editable in the current context.
 */
export function isSlotEditable(node: SchemaNode): boolean {
  const behavior = getSlotBehavior(node);
  return behavior === 'editable' && node.locked !== true;
}

/**
 * Check if a node is dynamic (data-driven).
 */
export function isSlotDynamic(node: SchemaNode): boolean {
  return node.slot?.behavior === 'dynamic';
}

/**
 * Get all nodes assigned to a specific slot.
 */
export function getNodesInSlot(schema: Schema, slotName: string): SchemaNode[] {
  return Object.values(schema.nodes).filter((node) => isInSlot(node, slotName));
}

/**
 * Get the fallback node ID for a slot, if configured.
 */
export function getSlotFallback(node: SchemaNode): string | undefined {
  return node.slot?.fallbackNodeId;
}

/**
 * Build slot constraints for the Inspector.
 * Returns which props/actions should be disabled based on slot behavior.
 */
export interface SlotConstraints {
  /** Can edit props in inspector */
  canEditProps: boolean;
  /** Can edit styles in inspector */
  canEditStyles: boolean;
  /** Can delete the node */
  canDelete: boolean;
  /** Can move/reorder the node */
  canMove: boolean;
  /** Can duplicate the node */
  canDuplicate: boolean;
  /** Reason for restrictions (shown to user) */
  restrictionReason?: string;
}

export function getSlotConstraints(node: SchemaNode): SlotConstraints {
  const behavior = getSlotBehavior(node);
  const locked = node.locked === true;

  if (locked || behavior === 'locked') {
    return {
      canEditProps: false,
      canEditStyles: false,
      canDelete: false,
      canMove: false,
      canDuplicate: false,
      restrictionReason: locked ? 'This node is locked' : 'This slot is locked by the template',
    };
  }

  if (behavior === 'dynamic') {
    return {
      canEditProps: true, // Can edit binding configuration
      canEditStyles: true,
      canDelete: false,
      canMove: false,
      canDuplicate: false,
      restrictionReason: 'Dynamic slots are data-driven',
    };
  }

  // editable (default)
  return {
    canEditProps: true,
    canEditStyles: true,
    canDelete: true,
    canMove: true,
    canDuplicate: true,
  };
}

/**
 * Validate slot assignments in a schema.
 * Returns issues found.
 */
export function validateSlots(schema: Schema): string[] {
  const issues: string[] = [];
  const slotNodes = new Map<string, string[]>();

  for (const [nodeId, node] of Object.entries(schema.nodes)) {
    if (node.slot) {
      const slotName = node.slot.__slot;
      if (!slotNodes.has(slotName)) {
        slotNodes.set(slotName, []);
      }
      slotNodes.get(slotName)!.push(nodeId);

      // Validate fallback exists if specified
      if (node.slot.fallbackNodeId && !schema.nodes[node.slot.fallbackNodeId]) {
        issues.push(`Slot "${slotName}" references missing fallback node "${node.slot.fallbackNodeId}"`);
      }
    }
  }

  return issues;
}
