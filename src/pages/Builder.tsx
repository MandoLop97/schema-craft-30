import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SchemaStore } from '@/lib/schema-store';
import { useSchemaHistory } from '@/hooks/use-schema-history';
import { Schema, NodeType, SchemaNode } from '@/types/schema';
import { createNode, isContainerType } from '@/lib/node-factory';
import { TopBar } from '@/components/builder/TopBar';
import { BlocksPalette } from '@/components/builder/BlocksPalette';
import { LayersPanel } from '@/components/builder/LayersPanel';
import { Inspector } from '@/components/builder/Inspector';
import { BuilderCanvas } from '@/components/builder/BuilderCanvas';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export default function Builder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pageSlug = searchParams.get('page') || 'home';

  const [initialSchema, setInitialSchema] = useState<Schema | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [dirty, setDirty] = useState(false);
  const [activeDragType, setActiveDragType] = useState<string | null>(null);

  useEffect(() => {
    SchemaStore.init();
    const page = SchemaStore.getPageBySlug(pageSlug);
    if (page) {
      const s = SchemaStore.getSchema(page.schemaId);
      if (s) setInitialSchema(s);
    }
  }, [pageSlug]);

  if (!initialSchema) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground text-sm">Loading builder...</p></div>;
  }

  return <BuilderInner
    key={initialSchema.id}
    initialSchema={initialSchema}
    selectedNodeId={selectedNodeId}
    setSelectedNodeId={setSelectedNodeId}
    device={device}
    setDevice={setDevice}
    dirty={dirty}
    setDirty={setDirty}
    activeDragType={activeDragType}
    setActiveDragType={setActiveDragType}
    navigate={navigate}
    pageSlug={pageSlug}
  />;
}

function BuilderInner({
  initialSchema, selectedNodeId, setSelectedNodeId, device, setDevice,
  dirty, setDirty, activeDragType, setActiveDragType, navigate, pageSlug,
}: {
  initialSchema: Schema;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  device: 'desktop' | 'tablet' | 'mobile';
  setDevice: (d: 'desktop' | 'tablet' | 'mobile') => void;
  dirty: boolean;
  setDirty: (d: boolean) => void;
  activeDragType: string | null;
  setActiveDragType: (t: string | null) => void;
  navigate: ReturnType<typeof useNavigate>;
  pageSlug: string;
}) {
  const { schema, setSchema, undo, redo, canUndo, canRedo } = useSchemaHistory(initialSchema);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const updateSchema = useCallback((updater: (s: Schema) => Schema) => {
    setSchema((prev) => updater(JSON.parse(JSON.stringify(prev))));
    setDirty(true);
  }, [setSchema, setDirty]);

  const handleSave = useCallback(() => {
    SchemaStore.saveSchema(schema);
    setDirty(false);
    toast.success('Schema saved');
  }, [schema, setDirty]);

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.type === 'palette') {
      setActiveDragType(data.nodeType);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragType(null);
    const { active, over } = event;
    if (!over) return;

    const data = active.data.current;
    if (data?.type === 'palette') {
      const nodeType = data.nodeType as NodeType;
      const newNode = createNode(nodeType);

      updateSchema((s) => {
        // Find target parent
        let parentId = selectedNodeId || s.rootNodeId;
        const parentNode = s.nodes[parentId];

        // If selected node is not a container, insert into its parent
        if (parentNode && !isContainerType(parentNode.type)) {
          // Find actual parent
          const actualParent = Object.values(s.nodes).find((n) => n.children.includes(parentId));
          if (actualParent) {
            parentId = actualParent.id;
          } else {
            parentId = s.rootNodeId;
          }
        }

        s.nodes[newNode.id] = newNode;
        s.nodes[parentId].children.push(newNode.id);
        return s;
      });

      setSelectedNodeId(newNode.id);
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
      // Remove empty string values
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
      // Remove from parent
      for (const node of Object.values(s.nodes)) {
        const idx = node.children.indexOf(selectedNodeId);
        if (idx !== -1) {
          node.children.splice(idx, 1);
          break;
        }
      }
      // Remove node and its children recursively
      const removeRecursive = (id: string) => {
        const n = s.nodes[id];
        if (n) {
          n.children.forEach(removeRecursive);
          delete s.nodes[id];
        }
      };
      removeRecursive(selectedNodeId);
      return s;
    });
    setSelectedNodeId(null);
  }, [selectedNodeId, schema.rootNodeId, updateSchema, setSelectedNodeId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
        if (selectedNodeId && selectedNodeId !== schema.rootNodeId) {
          handleDelete();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, handleSave, handleDelete, selectedNodeId, schema.rootNodeId]);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        <TopBar
          onSave={handleSave}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onPreview={() => navigate(`/preview?page=${pageSlug}`)}
          onExport={() => navigate(`/admin/export?page=${pageSlug}`)}
          device={device}
          onDeviceChange={setDevice}
          dirty={dirty}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-60 border-r bg-background flex flex-col shrink-0">
            <Tabs defaultValue="blocks" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="mx-2 mt-2 w-auto">
                <TabsTrigger value="blocks" className="text-xs">Blocks</TabsTrigger>
                <TabsTrigger value="layers" className="text-xs">Layers</TabsTrigger>
              </TabsList>
              <ScrollArea className="flex-1">
                <TabsContent value="blocks" className="mt-0">
                  <BlocksPalette />
                </TabsContent>
                <TabsContent value="layers" className="mt-0">
                  <LayersPanel schema={schema} selectedNodeId={selectedNodeId} onSelectNode={setSelectedNodeId} />
                </TabsContent>
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
    </DndContext>
  );
}
