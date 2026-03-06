import { PageDefinition } from '@/types/schema';
import { FileText, ChevronRight, Layout } from 'lucide-react';

export interface PageManagerProps {
  pages: PageDefinition[];
  activePage?: string;
  onSelectPage: (slug: string) => void;
}

export function PageManager({ pages, activePage, onSelectPage }: PageManagerProps) {
  return (
    <div className="flex flex-col gap-6 p-8 max-w-2xl mx-auto w-full">
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Layout className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Page Manager</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Select a page to edit in the visual builder.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {pages.map((page) => (
          <button
            key={page.slug}
            onClick={() => onSelectPage(page.slug)}
            className={`group flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-left w-full transition-all duration-150 ${
              activePage === page.slug
                ? 'ring-2 ring-primary bg-primary/5 shadow-sm'
                : 'border border-border bg-background hover:border-primary/30 hover:bg-muted/40 hover:shadow-sm'
            }`}
          >
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              activePage === page.slug
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
            }`}>
              <FileText className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{page.title}</p>
              <p className="text-xs text-muted-foreground font-mono">{page.slug}</p>
            </div>
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 uppercase tracking-wider ${
              page.status === 'published'
                ? 'bg-green-500/10 text-green-600 ring-1 ring-green-500/20'
                : 'bg-muted text-muted-foreground ring-1 ring-border'
            }`}>
              {page.status === 'published' ? 'Live' : 'Draft'}
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
}
