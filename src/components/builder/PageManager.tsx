import { useMemo, useState } from 'react';
import { PageDefinition } from '@/types/schema';
import { PageRenderer } from '@/components/schema/PageRenderer';
import { FileText, Circle, ChevronDown, ChevronRight, Globe, Puzzle, Package, Layers, Search, X } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { EDITOR_VERSION } from '@/lib/version';

export interface PageManagerProps {
  pages: PageDefinition[];
  activePage?: string;
  onSelectPage: (slug: string) => void;
}

const DEFAULT_CATEGORY = 'Páginas';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Páginas': Globe,
  'Pages': Globe,
  'Elementos Globales': Puzzle,
  'Global Elements': Puzzle,
  'Templates': Package,
};

function getCategoryIcon(category: string): React.ElementType {
  return CATEGORY_ICONS[category] ?? FileText;
}

/** Scaled-down live mini-render of a page schema */
function PageThumbnail({ page }: { page: PageDefinition }) {
  // Use a wide virtual viewport so the page renders at "desktop" size,
  // then scale down to fit the card. The container measures its own width
  // via a ref so the scale is always pixel-perfect.
  const innerWidth = 1440;
  const thumbHeight = 210;
  const scale = 0.22; // ≈ 317px card → 1440 virtual
  const innerHeight = thumbHeight / scale;

  return (
    <div
      className="relative rounded-t-xl overflow-hidden shrink-0 bg-muted/30"
      style={{ width: '100%', height: thumbHeight }}
    >
      <div
        style={{
          width: innerWidth,
          minHeight: innerHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
          overflow: 'hidden',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <PageRenderer schema={page.schema} mode="preview" />
      </div>
      {/* Fade-out at bottom */}
      <div
        className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, hsl(var(--card)), hsl(var(--card) / 0.6) 40%, transparent)',
        }}
      />
    </div>
  );
}

export function PageManager({ pages, activePage, onSelectPage }: PageManagerProps) {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Filter pages by search query
  const filteredPages = useMemo(() => {
    if (!search.trim()) return pages;
    const q = search.toLowerCase().trim();
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.templateType || '').toLowerCase().includes(q)
    );
  }, [pages, search]);

  const groups = useMemo(() => {
    const map = new Map<string, PageDefinition[]>();
    for (const page of filteredPages) {
      const cat = page.category || DEFAULT_CATEGORY;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(page);
    }
    return Array.from(map.entries());
  }, [filteredPages]);

  const toggleCategory = (cat: string) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="min-h-screen flex flex-col nxr-canvas-grid nxr-view-enter" style={{ backgroundColor: 'hsl(var(--muted) / 0.15)' }}>
      {/* Header */}
      <div
        className="border-b px-6 py-5 flex items-center gap-3 backdrop-blur-md sticky top-0 z-10"
        style={{
          backgroundColor: 'hsl(var(--background) / 0.8)',
          boxShadow: '0 1px 20px hsl(var(--primary) / 0.06), 0 1px 3px hsl(var(--border) / 0.4)',
        }}
      >
        <div
          className="h-9 w-9 rounded-lg flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.05))',
            boxShadow: '0 0 12px hsl(var(--primary) / 0.1)',
          }}
        >
          <Layers className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">NEXORA</h1>
          <p className="text-[11px] text-muted-foreground">Select a page or template to edit</p>
        </div>
        <span className="ml-auto text-[10px] text-muted-foreground font-mono px-2 py-1 rounded-md bg-muted/50">
          v{EDITOR_VERSION}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
        {/* Search bar */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search pages, templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9 h-10 bg-background/80 backdrop-blur-sm border-border/60 focus-visible:ring-primary/30 transition-shadow duration-200"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Empty state */}
        {filteredPages.length === 0 && (
          <div className="text-center py-16 nxr-fade-in-up-anim">
            <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No results for "<span className="font-medium text-foreground">{search}</span>"</p>
          </div>
        )}

        <div className="space-y-6">
          {groups.map(([category, categoryPages]) => {
            const isOpen = !collapsed[category];
            const CategoryIcon = getCategoryIcon(category);

            return (
              <Collapsible key={category} open={isOpen} onOpenChange={() => toggleCategory(category)}>
                <CollapsibleTrigger className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl hover:bg-muted/60 transition-all duration-200 group">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200" />
                  )}
                  <CategoryIcon className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors duration-200" />
                  <span className="text-sm font-semibold text-foreground">{category}</span>
                  <span
                    className="text-[10px] font-medium text-muted-foreground ml-auto px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'hsl(var(--muted) / 0.8)' }}
                  >
                    {categoryPages.length}
                  </span>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="grid gap-4 mt-3 ml-1 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {categoryPages.map((page, i) => {
                      const isLive = page.status === 'published';

                      return (
                        <button
                          key={page.slug}
                          onClick={() => onSelectPage(page.slug)}
                          className="group flex flex-col rounded-xl overflow-hidden text-left w-full transition-all duration-200 ease-out hover:scale-[1.03] active:scale-[0.98] nxr-page-card"
                          style={{ animationDelay: `${i * 50}ms` }}
                        >
                          <PageThumbnail page={page} />
                          <div className="px-4 py-3 flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200 truncate block">
                                {page.title}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-muted-foreground font-mono truncate">
                                  {page.slug}
                                </span>
                                {page.templateType && page.templateType !== 'page' && (
                                  <>
                                    <span className="text-muted-foreground/30">·</span>
                                    <span className="text-[10px] text-muted-foreground/70 capitalize">{page.templateType}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-medium shrink-0 px-2 py-0.5 rounded-full ${
                                isLive ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'
                              }`}
                              style={{
                                backgroundColor: isLive ? 'hsl(142 71% 45% / 0.1)' : 'hsl(var(--muted) / 0.6)',
                              }}
                            >
                              <Circle
                                className={`h-1.5 w-1.5 ${
                                  isLive ? 'fill-green-500 text-green-500' : 'fill-muted-foreground/40 text-muted-foreground/40'
                                }`}
                              />
                              {isLive ? 'Live' : 'Draft'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </div>
    </div>
  );
}
