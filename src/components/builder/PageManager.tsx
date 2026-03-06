import { PageDefinition } from '@/types/schema';
import { FileText, Circle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface PageManagerProps {
  pages: PageDefinition[];
  activePage?: string;
  onSelectPage: (slug: string) => void;
}

export function PageManager({ pages, activePage, onSelectPage }: PageManagerProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 pt-4 pb-3">
        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.08em]">
          Pages
        </h3>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="flex flex-col gap-0.5 pb-3">
          {pages.map((page) => {
            const isActive = activePage === page.slug;
            const isLive = page.status === 'published';

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
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
                )}

                {/* Icon */}
                <div className={`
                  h-7 w-7 rounded-md flex items-center justify-center shrink-0 transition-colors
                  ${isActive
                    ? 'bg-primary/15 text-primary'
                    : 'bg-muted/70 text-muted-foreground group-hover:bg-muted group-hover:text-foreground'
                  }
                `}>
                  <FileText className="h-3.5 w-3.5" />
                </div>

                {/* Content */}
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
      </ScrollArea>
    </div>
  );
}
