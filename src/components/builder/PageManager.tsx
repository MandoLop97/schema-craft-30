import { PageDefinition } from '@/types/schema';
import { FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface PageManagerProps {
  pages: PageDefinition[];
  activePage?: string;
  onSelectPage: (slug: string) => void;
}

export function PageManager({ pages, activePage, onSelectPage }: PageManagerProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 pt-3 pb-2 space-y-0.5">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Pages</h3>
        <p className="text-[11px] text-muted-foreground leading-tight">Select a page to edit</p>
      </div>

      <ScrollArea className="flex-1 px-1.5">
        <div className="flex flex-col gap-1 pb-2">
          {pages.map((page) => {
            const isActive = activePage === page.slug;
            return (
              <button
                key={page.slug}
                onClick={() => onSelectPage(page.slug)}
                className={`group flex items-start gap-2 rounded-lg px-2.5 py-2 text-left w-full transition-all duration-100 ${
                  isActive
                    ? 'bg-primary/10 ring-1 ring-primary/30'
                    : 'hover:bg-muted/60'
                }`}
              >
                <FileText className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                }`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[13px] leading-tight truncate ${
                      isActive ? 'font-semibold text-primary' : 'font-medium text-foreground'
                    }`}>
                      {page.title}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 uppercase tracking-wider ${
                      page.status === 'published'
                        ? 'bg-green-500/15 text-green-600'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {page.status === 'published' ? 'Live' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">
                    {page.slug}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
