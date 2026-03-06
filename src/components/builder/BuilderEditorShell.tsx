import { useEffect, useState, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useSchemaHistory } from '@/hooks/use-schema-history';
import { Schema, NodeType, SchemaNode, PageDefinition } from '@/types/schema';
import { createNode, isContainerType } from '@/lib/node-factory';
import { TopBar } from '@/components/builder/TopBar';
import { BlocksPalette } from '@/components/builder/BlocksPalette';
import { LayersPanel } from '@/components/builder/LayersPanel';
import { Inspector } from '@/components/builder/Inspector';
import { PublishDialog } from '@/components/builder/PublishDialog';
import { BuilderCanvas } from '@/components/builder/BuilderCanvas';
import { PageManager } from '@/components/builder/PageManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export interface BuilderEditorShellProps {
  initialSchema: Schema;
  onSave: (schema: Schema) => void;
  onPublish?: (schema: Schema) => void;
  onPreview?: (schema: Schema) => void;
  onExport?: (schema: Schema) => void;
  className?: string;
  // Multi-page
  pages?: PageDefinition[];
  activePage?: string;
  onPageChange?: (slug: string) => void;
  pageTitle?: string;
}

export function BuilderEditorShell({
  initialSchema,
  onSave: onSaveExternal,
  onPublish,
  onPreview,
  onExport,
  className,
  pages,
  activePage,
  onPageChange,
  pageTitle,
}: BuilderEditorShellProps) {
  const { schema, setSchema, undo, redo, canUndo, canRedo } = useSchemaHistory(initialSchema);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [dirty, setDirty] = useState(false);
  const [activeDragType, setActiveDragType] = useState<string | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishMode, setPublishMode] = useState<'draft' | 'published'>('published');

  const hasPages = pages && pages.length > 0;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const updateSchema = useCallback((updater: (s: Schema) => Schema) => {
    setSchema((prev) => updater(JSON.parse(JSON.stringify(prev))));
    setDirty(true);
  }, [setSchema]);

  const handleSave = useCallback(() => {
    onSaveExternal(schema);
    setDirty(false);
    toast.success('Schema saved');
  }, [schema, onSaveExternal]);

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.type === 'palette') {
      setActiveDragType(data.nodeType);
    } else if (data?.type === 'sortable') {
      setActiveDragType(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragType(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;

    if (activeData?.type === 'palette') {
      const nodeType = activeData.nodeType as NodeType;
      const newNode = createNode(nodeType);

      updateSchema((s) => {
        let parentId = String(over.id);
        const parentNode = s.nodes[parentId];

        if (!parentNode || !isContainerType(parentNode.type)) {
          const actualParent = Object.values(s.nodes).find((n) => n.children.includes(parentId));
          parentId = actualParent ? actualParent.id : s.rootNodeId;
        }

        s.nodes[newNode.id] = newNode;
        s.nodes[parentId].children.push(newNode.id);
        return s;
      });

      setSelectedNodeId(newNode.id);
      return;
    }

    if (activeData?.type === 'sortable') {
      const activeId = String(active.id);
      const overId = String(over.id);
      if (activeId === overId) return;

      updateSchema((s) => {
        const parent = Object.values(s.nodes).find((n) => n.children.includes(activeId));
        if (!parent) return s;

        const oldIndex = parent.children.indexOf(activeId);
        const newIndex = parent.children.indexOf(overId);
        if (oldIndex === -1 || newIndex === -1) return s;

        parent.children = arrayMove(parent.children, oldIndex, newIndex);
        return s;
      });
    }
  };

  const selectedNode = selectedNodeId ? schema.nodes[selectedNodeId] : null;

  const handleUpdateProps = useCallback((props: Partial<SchemaNode['props']>) => {
    if (!selectedNodeId) return;
    updateSchema((s) => {
      s.nodes[selectedNodeId].props = { ...s.nodes[selectedNodeId].props, ...props };
      return s;
    });
  }, [selectedNodeId, updateSchema]);

  const handleUpdateStyle = useCallback((style: Partial<SchemaNode['style']>) => {
    if (!selectedNodeId) return;
    updateSchema((s) => {
      const cleaned = { ...s.nodes[selectedNodeId].style, ...style };
      Object.keys(cleaned).forEach((k) => {
        if ((cleaned as any)[k] === '') delete (cleaned as any)[k];
      });
      s.nodes[selectedNodeId].style = cleaned;
      return s;
    });
  }, [selectedNodeId, updateSchema]);

  const handleDelete = useCallback(() => {
    if (!selectedNodeId || selectedNodeId === schema.rootNodeId) return;
    updateSchema((s) => {
      for (const node of Object.values(s.nodes)) {
        const idx = node.children.indexOf(selectedNodeId);
        if (idx !== -1) { node.children.splice(idx, 1); break; }
      }
      const removeRecursive = (id: string) => {
        const n = s.nodes[id];
        if (n) { n.children.forEach(removeRecursive); delete s.nodes[id]; }
      };
      removeRecursive(selectedNodeId);
      return s;
    });
    setSelectedNodeId(null);
  }, [selectedNodeId, schema.rootNodeId, updateSchema]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
        if (selectedNodeId && selectedNodeId !== schema.rootNodeId) handleDelete();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, handleSave, handleDelete, selectedNodeId, schema.rootNodeId]);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={`h-screen flex flex-col bg-background overflow-hidden ${className || ''}`}>
        <TopBar
          onSave={handleSave}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onPreview={() => onPreview?.(schema)}
          onExport={() => onExport?.(schema)}
          device={device}
          onDeviceChange={setDevice}
          dirty={dirty}
          onPublish={() => { onPublish ? onPublish(schema) : (setPublishMode('published'), setPublishOpen(true)); }}
          onSaveDraft={() => { setPublishMode('draft'); setPublishOpen(true); }}
          pageTitle={pageTitle}
          onBackToPages={hasPages && onPageChange ? () => onPageChange('') : undefined}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-60 border-r bg-background flex flex-col shrink-0">
            <Tabs defaultValue="blocks" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="mx-2 mt-2 w-auto">
                <TabsTrigger value="blocks" className="text-xs">Blocks</TabsTrigger>
                <TabsTrigger value="layers" className="text-xs">Layers</TabsTrigger>
                {hasPages && <TabsTrigger value="pages" className="text-xs">Pages</TabsTrigger>}
              </TabsList>
              <ScrollArea className="flex-1">
                <TabsContent value="blocks" className="mt-0">
                  <BlocksPalette />
                </TabsContent>
                <TabsContent value="layers" className="mt-0">
                  <LayersPanel schema={schema} selectedNodeId={selectedNodeId} onSelectNode={setSelectedNodeId} />
                </TabsContent>
                {hasPages && (
                  <TabsContent value="pages" className="mt-0">
                    <PageManager
                      pages={pages!}
                      activePage={activePage}
                      onSelectPage={(slug) => onPageChange?.(slug)}
                    />
                  </TabsContent>
                )}
              </ScrollArea>
            </Tabs>
          </div>

          {/* Canvas */}
          <BuilderCanvas
            schema={schema}
            device={device}
            selectedNodeId={selectedNodeId}
            onSelectNode={(id) => setSelectedNodeId(id || null)}
          />

          {/* Right Sidebar */}
          <div className="w-64 border-l bg-background shrink-0 overflow-hidden">
            {selectedNode ? (
              <ScrollArea className="h-full">
                <Inspector
                  node={selectedNode}
                  onUpdateProps={handleUpdateProps}
                  onUpdateStyle={handleUpdateStyle}
                  onDelete={handleDelete}
                />
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-muted-foreground">Select an element to inspect</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeDragType && (
          <div className="px-3 py-2 bg-background border shadow-lg rounded-md text-xs font-medium">
            {activeDragType}
          </div>
        )}
      </DragOverlay>

      <PublishDialog open={publishOpen} onOpenChange={setPublishOpen} schema={schema} mode={publishMode} />
    </DndContext>
  );
}
