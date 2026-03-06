import { PageDefinition } from '@/types/schema';
import { FileText, ChevronRight } from 'lucide-react';

export interface PageManagerProps {
  pages: PageDefinition[];
  activePage?: string;
  onSelectPage: (slug: string) => void;
}

export function PageManager({ pages, activePage, onSelectPage }: PageManagerProps) {
  return (
    <div className="flex flex-col gap-4 p-6 max-w-2xl mx-auto w-full">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Page Manager</h2>
        <p className="text-sm text-muted-foreground">Select a page to edit in the visual builder.</p>
      </div>

      <div className="flex flex-col gap-2">
        {pages.map((page) => (
          <button
            key={page.slug}
            onClick={() => onSelectPage(page.slug)}
            className={`flex items-center gap-3 rounded-lg bg-background px-4 py-3 text-left w-full transition-colors hover:bg-muted/50 ${
              activePage === page.slug
                ? 'ring-2 ring-foreground'
                : 'border border-border'
            }`}
          >
            <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{page.title}</p>
              <p className="text-xs text-muted-foreground">{page.slug}</p>
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
              page.status === 'published'
                ? 'bg-green-100 text-green-700'
                : 'bg-muted text-muted-foreground'
            }`}>
              {page.status === 'published' ? '✓ Published' : '○ Draft'}
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}
