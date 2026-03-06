// ── Nexora Builder i18n ──
// Lightweight localization system for the visual builder UI.

export interface BuilderLocale {
  // TopBar
  save: string;
  saveDraft: string;
  publish: string;
  preview: string;
  export: string;
  undo: string;
  redo: string;
  unsavedChanges: string;

  // BlocksPalette
  blocks: string;
  layers: string;
  pages: string;

  // Inspector
  props: string;
  style: string;
  deleteNode: string;

  // Drop zone
  dropHere: string;
  releaseToDrop: string;

  // Canvas
  selectElement: string;

  // Publish dialog
  publishPage: string;
  saveDraftTitle: string;
  targetDomain: string;
  domainHint: string;
  cancel: string;
  publishing: string;

  // Errors
  cannotPlaceHere: (nodeType: string) => string;
  schemaSaved: string;
  invalidDomain: string;
  noPublishHandler: string;
  publishSuccess: (domain: string) => string;
  draftSuccess: (domain: string) => string;
  publishError: (msg: string) => string;

  // Categories
  categoryLayout: string;
  categoryContent: string;
  categoryUI: string;
  categoryCommerce: string;
  categorySite: string;
  categoryTemplate: string;

  // Style groups
  spacing: string;
  size: string;
  typography: string;
  appearance: string;

  // Preview dialog
  previewTitle: string;
  previewDescription: string;
  closePreview: string;

  // Export dialog
  exportTitle: string;
  exportDescription: string;
  copyToClipboard: string;
  copied: string;
}

export const es: BuilderLocale = {
  save: 'Guardar',
  saveDraft: 'Borrador',
  publish: 'Publicar',
  preview: 'Vista previa',
  export: 'Exportar',
  undo: 'Deshacer',
  redo: 'Rehacer',
  unsavedChanges: 'Cambios sin guardar',

  blocks: 'Bloques',
  layers: 'Capas',
  pages: 'Páginas',

  props: 'Propiedades',
  style: 'Estilo',
  deleteNode: 'Eliminar elemento',

  dropHere: 'Suelta un bloque aquí',
  releaseToDrop: 'Suelta para agregar',

  selectElement: 'Selecciona un elemento para inspeccionar',

  publishPage: 'Publicar página',
  saveDraftTitle: 'Guardar borrador',
  targetDomain: 'Dominio destino',
  domainHint: 'El template leerá este contenido usando el dominio como clave.',
  cancel: 'Cancelar',
  publishing: 'Publicando...',

  cannotPlaceHere: (nodeType) => `"${nodeType}" no se puede colocar aquí`,
  schemaSaved: 'Esquema guardado',
  invalidDomain: 'Ingresa un dominio',
  noPublishHandler: 'No se configuró un handler de publicación.',
  publishSuccess: (domain) => `Página publicada para ${domain}`,
  draftSuccess: (domain) => `Borrador guardado para ${domain}`,
  publishError: (msg) => `Error al publicar: ${msg}`,

  categoryLayout: 'Estructura',
  categoryContent: 'Contenido',
  categoryUI: 'Interfaz',
  categoryCommerce: 'Comercio',
  categorySite: 'Sitio',
  categoryTemplate: 'Plantilla',

  spacing: 'Espaciado',
  size: 'Tamaño',
  typography: 'Tipografía',
  appearance: 'Apariencia',

  previewTitle: 'Vista previa',
  previewDescription: 'Así se verá tu página publicada.',
  closePreview: 'Cerrar',

  exportTitle: 'Exportar schema',
  exportDescription: 'Copia el JSON del schema actual.',
  copyToClipboard: 'Copiar al portapapeles',
  copied: '¡Copiado!',
};

export const en: BuilderLocale = {
  save: 'Save',
  saveDraft: 'Draft',
  publish: 'Publish',
  preview: 'Preview',
  export: 'Export',
  undo: 'Undo',
  redo: 'Redo',
  unsavedChanges: 'Unsaved changes',

  blocks: 'Blocks',
  layers: 'Layers',
  pages: 'Pages',

  props: 'Props',
  style: 'Style',
  deleteNode: 'Delete element',

  dropHere: 'Drop a block here',
  releaseToDrop: 'Release to drop',

  selectElement: 'Select an element to inspect',

  publishPage: 'Publish page',
  saveDraftTitle: 'Save draft',
  targetDomain: 'Target domain',
  domainHint: 'The template will read this content using the domain as key.',
  cancel: 'Cancel',
  publishing: 'Publishing...',

  cannotPlaceHere: (nodeType) => `"${nodeType}" cannot be placed here`,
  schemaSaved: 'Schema saved',
  invalidDomain: 'Enter a domain',
  noPublishHandler: 'No publish handler configured.',
  publishSuccess: (domain) => `Page published for ${domain}`,
  draftSuccess: (domain) => `Draft saved for ${domain}`,
  publishError: (msg) => `Publish error: ${msg}`,

  categoryLayout: 'Layout',
  categoryContent: 'Content',
  categoryUI: 'UI',
  categoryCommerce: 'Commerce',
  categorySite: 'Site',
  categoryTemplate: 'Template',

  spacing: 'Spacing',
  size: 'Size',
  typography: 'Typography',
  appearance: 'Appearance',

  previewTitle: 'Preview',
  previewDescription: 'This is how your published page will look.',
  closePreview: 'Close',

  exportTitle: 'Export schema',
  exportDescription: 'Copy the current schema JSON.',
  copyToClipboard: 'Copy to clipboard',
  copied: 'Copied!',
};

// Default locale
let currentLocale: BuilderLocale = es;

export function setLocale(locale: BuilderLocale) {
  currentLocale = locale;
}

export function setLocaleByCode(code: 'es' | 'en') {
  currentLocale = code === 'en' ? en : es;
}

export function t(): BuilderLocale {
  return currentLocale;
}

/** Category name translation map */
const CATEGORY_MAP_ES: Record<string, string> = {
  Layout: es.categoryLayout,
  Content: es.categoryContent,
  UI: es.categoryUI,
  Commerce: es.categoryCommerce,
  Site: es.categorySite,
  Template: es.categoryTemplate,
};

const CATEGORY_MAP_EN: Record<string, string> = {
  Layout: en.categoryLayout,
  Content: en.categoryContent,
  UI: en.categoryUI,
  Commerce: en.categoryCommerce,
  Site: en.categorySite,
  Template: en.categoryTemplate,
};

export function translateCategory(category: string): string {
  if (currentLocale === en) return CATEGORY_MAP_EN[category] || category;
  return CATEGORY_MAP_ES[category] || category;
}
