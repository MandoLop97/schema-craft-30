import { useMemo, useState } from 'react';
import { PageDefinition } from '@/types/schema';
import { FileText, Circle, ChevronDown, ChevronRight, Globe, Puzzle, Package, Layers } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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

export function PageManager({ pages, activePage, onSelectPage }: PageManagerProps) {
  const groups = useMemo(() => {
    const map = new Map<string, PageDefinition[]>();
    for (const page of pages) {
      const cat = page.category || DEFAULT_CATEGORY;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(page);
    }
    return Array.from(map.entries());
  }, [pages]);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCategory = (cat: string) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-5 flex items-center gap-3" style={{ backgroundColor: 'hsla(210, 60%, 50%, 0.08)' }}>
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Layers className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">NEXORA</h1>
          <p className="text-[11px] text-muted-foreground">Select a page or template to edit</p>
        </div>
        <span className="ml-auto text-[10px] text-muted-foreground font-mono">v{EDITOR_VERSION}</span>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 max-w-3xl mx-auto w-full">
        <div className="space-y-4">
          {groups.map(([category, categoryPages]) => {
            const isOpen = !collapsed[category];
            const CategoryIcon = getCategoryIcon(category);

            return (
              <Collapsible key={category} open={isOpen} onOpenChange={() => toggleCategory(category)}>
                <CollapsibleTrigger className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <CategoryIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-semibold text-foreground">{category}</span>
                  <span className="text-xs text-muted-foreground/60 ml-auto">{categoryPages.length}</span>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="grid gap-2 mt-1 ml-2">
                    {categoryPages.map((page) => {
                      const isLive = page.status === 'published';
                      const PageIcon = page.icon || FileText;

                      return (
                        <button
                          key={page.slug}
                          onClick={() => onSelectPage(page.slug)}
                          className="group relative flex items-center gap-3 rounded-xl border bg-background px-4 py-3.5 text-left w-full transition-all duration-150 ease-out hover:shadow-md hover:border-primary/20 hover:scale-[1.01] active:scale-[0.99]"
                        >
                          <div className="h-10 w-10 rounded-lg bg-muted/70 flex items-center justify-center shrink-0 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                            <PageIcon className="h-5 w-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {page.title}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-muted-foreground font-mono truncate">
                                {page.slug}
                              </span>
                              {page.templateType && page.templateType !== 'page' && (
                                <>
                                  <span className="text-muted-foreground/30">·</span>
                                  <span className="text-[11px] text-muted-foreground/70 capitalize">{page.templateType}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium shrink-0 ${isLive ? 'text-green-600' : 'text-muted-foreground'}`}>
                            <Circle className={`h-2 w-2 ${isLive ? 'fill-green-500 text-green-500' : 'fill-muted-foreground/40 text-muted-foreground/40'}`} />
                            {isLive ? 'Live' : 'Draft'}
                          </span>
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
