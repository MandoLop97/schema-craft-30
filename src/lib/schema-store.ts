import { Page, Schema } from '@/types/schema';
import { createDefaultHomeSchema } from './default-schema';

const PAGES_KEY = 'nexora_pages';
const SCHEMAS_KEY = 'nexora_schemas';
const LICENSE_KEY = 'nexora_license_status';

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

function ensureDefaults() {
  const pages = readJSON<Page[]>(PAGES_KEY, []);
  if (pages.length === 0) {
    const { page, schema } = createDefaultHomeSchema();
    writeJSON(PAGES_KEY, [page]);
    writeJSON(SCHEMAS_KEY, { [schema.id]: schema });
  }
}

// --- Public API ---

export const SchemaStore = {
  init() {
    ensureDefaults();
  },

  getPages(): Page[] {
    ensureDefaults();
    return readJSON<Page[]>(PAGES_KEY, []);
  },

  getPageBySlug(slug: string): Page | undefined {
    return this.getPages().find((p) => p.slug === slug);
  },

  getSchema(schemaId: string): Schema | undefined {
    const schemas = readJSON<Record<string, Schema>>(SCHEMAS_KEY, {});
    return schemas[schemaId];
  },

  saveSchema(schema: Schema) {
    const schemas = readJSON<Record<string, Schema>>(SCHEMAS_KEY, {});
    schema.updatedAt = new Date().toISOString();
    schema.version += 1;
    schemas[schema.id] = schema;
    writeJSON(SCHEMAS_KEY, schemas);
  },

  createPage(name: string, slug: string): Page {
    const pages = this.getPages();
    const schemaId = `schema-${slug}`;
    const page: Page = { id: `page-${slug}`, slug, name, schemaId };

    const schema: Schema = {
      id: schemaId,
      version: 1,
      updatedAt: new Date().toISOString(),
      themeTokens: {
        colors: { primary: '222.2 47.4% 11.2%', secondary: '210 40% 96.1%', background: '0 0% 100%', text: '222.2 84% 4.9%', muted: '215.4 16.3% 46.9%', border: '214.3 31.8% 91.4%' },
        typography: { fontFamily: 'system-ui, sans-serif', baseSize: '16px', headingScale: 1.25 },
        radius: { sm: '0.25rem', md: '0.5rem', lg: '0.75rem' },
        spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '2rem', xl: '4rem' },
      },
      rootNodeId: 'root',
      nodes: {
        root: { id: 'root', type: 'Section', props: {}, style: { minHeight: '100vh' }, children: [] },
      },
    };

    pages.push(page);
    writeJSON(PAGES_KEY, pages);
    const schemas = readJSON<Record<string, Schema>>(SCHEMAS_KEY, {});
    schemas[schemaId] = schema;
    writeJSON(SCHEMAS_KEY, schemas);
    return page;
  },

  duplicatePage(pageId: string): Page | undefined {
    const pages = this.getPages();
    const original = pages.find((p) => p.id === pageId);
    if (!original) return undefined;
    const originalSchema = this.getSchema(original.schemaId);
    if (!originalSchema) return undefined;

    const newSlug = `${original.slug}-copy-${Date.now()}`;
    const page = this.createPage(`${original.name} (Copy)`, newSlug);
    const schema = this.getSchema(page.schemaId)!;
    schema.nodes = JSON.parse(JSON.stringify(originalSchema.nodes));
    schema.rootNodeId = originalSchema.rootNodeId;
    schema.themeTokens = JSON.parse(JSON.stringify(originalSchema.themeTokens));
    this.saveSchema(schema);
    return page;
  },

  deletePage(pageId: string) {
    let pages = this.getPages();
    const page = pages.find((p) => p.id === pageId);
    if (!page) return;
    pages = pages.filter((p) => p.id !== pageId);
    writeJSON(PAGES_KEY, pages);
    const schemas = readJSON<Record<string, Schema>>(SCHEMAS_KEY, {});
    delete schemas[page.schemaId];
    writeJSON(SCHEMAS_KEY, schemas);
  },

  renamePage(pageId: string, newName: string) {
    const pages = this.getPages();
    const page = pages.find((p) => p.id === pageId);
    if (page) {
      page.name = newName;
      writeJSON(PAGES_KEY, pages);
    }
  },

  // License
  getLicenseStatus(): 'active' | 'inactive' | 'exceeded' {
    return (localStorage.getItem(LICENSE_KEY) as any) || 'active';
  },

  setLicenseStatus(status: 'active' | 'inactive' | 'exceeded') {
    localStorage.setItem(LICENSE_KEY, status);
  },
};
