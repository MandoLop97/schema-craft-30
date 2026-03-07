import { SchemaNode } from '@/types/schema';

const SAVED_SECTIONS_KEY = 'nexora_saved_sections';

export interface SavedSection {
  id: string;
  name: string;
  createdAt: string;
  /** The root node + all descendants */
  nodes: Record<string, SchemaNode>;
  rootNodeId: string;
}

function readSections(): SavedSection[] {
  try {
    const raw = localStorage.getItem(SAVED_SECTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeSections(sections: SavedSection[]) {
  localStorage.setItem(SAVED_SECTIONS_KEY, JSON.stringify(sections));
}

export function getSavedSections(): SavedSection[] {
  return readSections();
}

export function saveSection(section: SavedSection): void {
  const sections = readSections();
  sections.push(section);
  writeSections(sections);
}

export function deleteSavedSection(id: string): void {
  const sections = readSections().filter((s) => s.id !== id);
  writeSections(sections);
}

export function renameSavedSection(id: string, name: string): void {
  const sections = readSections();
  const section = sections.find((s) => s.id === id);
  if (section) {
    section.name = name;
    writeSections(sections);
  }
}

/**
 * Extract a node and all its descendants from a schema nodes map.
 */
export function extractNodeTree(
  nodeId: string,
  allNodes: Record<string, SchemaNode>,
): Record<string, SchemaNode> {
  const result: Record<string, SchemaNode> = {};

  function collect(id: string) {
    const node = allNodes[id];
    if (!node) return;
    result[id] = JSON.parse(JSON.stringify(node));
    node.children.forEach(collect);
  }

  collect(nodeId);
  return result;
}
