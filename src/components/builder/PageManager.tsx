import { useMemo, useState } from 'react';
import { PageDefinition, TemplateType } from '@/types/schema';
import { FileText, Circle, ChevronDown, ChevronRight, Globe, Puzzle, Package } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  // Group pages by category
  const groups = useMemo(() => {
    const map = new Map<string, PageDefinition[]>();
    for (const page of pages) {
      const cat = page.category || DEFAULT_CATEGORY;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(page);
    }
    return Array.from(map.entries());
  }, [pages]);

  // Track collapsed state per category
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCategory = (cat: string) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 pt-4 pb-3">
        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.08em]">
          Pages
        </h3>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="flex flex-col gap-1 pb-3">
          {groups.map(([category, categoryPages]) => {
            const isOpen = !collapsed[category];
            const CategoryIcon = getCategoryIcon(category);

            return (
              <Collapsible key={category} open={isOpen} onOpenChange={() => toggleCategory(category)}>
                <CollapsibleTrigger className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors">
                  {isOpen ? (
                    <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  )}
                  <CategoryIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">
                    {category}
                  </span>
                  <span className="text-[10px] text-muted-foreground/50 ml-auto">{categoryPages.length}</span>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="flex flex-col gap-0.5 ml-1 mt-0.5">
                    {categoryPages.map((page) => {
                      const isActive = activePage === page.slug;
                      const isLive = page.status === 'published';
                      const PageIcon = page.icon || FileText;

                      return (
                        <button
                          key={page.slug}
                          onClick={() => onSelectPage(page.slug)}
                          className={`
                            group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left w-full
                            transition-all duration-150 ease-out
                            ${isActive
                              ? 'bg-primary/8 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.2)]'
                              : 'hover:bg-muted/50 active:bg-muted/80'
                            }
                          `}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
                          )}

                          <div className={`
                            h-7 w-7 rounded-md flex items-center justify-center shrink-0 transition-colors
                            ${isActive
                              ? 'bg-primary/15 text-primary'
                              : 'bg-muted/70 text-muted-foreground group-hover:bg-muted group-hover:text-foreground'
                            }
                          `}>
                            <PageIcon className="h-3.5 w-3.5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[13px] leading-tight truncate ${
                                isActive ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'
                              }`}>
                                {page.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-muted-foreground font-mono truncate">
                                {page.slug}
                              </span>
                              <span className="text-muted-foreground/30">·</span>
                              {page.templateType && page.templateType !== 'page' && (
                                <>
                                  <span className="text-[10px] text-muted-foreground/60 capitalize">{page.templateType}</span>
                                  <span className="text-muted-foreground/30">·</span>
                                </>
                              )}
                              <span className={`
                                inline-flex items-center gap-1 text-[10px] font-medium shrink-0
                                ${isLive ? 'text-green-600' : 'text-muted-foreground'}
                              `}>
                                <Circle className={`h-1.5 w-1.5 ${isLive ? 'fill-green-500 text-green-500' : 'fill-muted-foreground/40 text-muted-foreground/40'}`} />
                                {isLive ? 'Live' : 'Draft'}
                              </span>
                            </div>
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
      </ScrollArea>
    </div>
  );
}
