/**
 * Runtime version of the schema-craft editor package.
 * Injected at build time via Vite's `define` config.
 * Falls back to 'dev' when running outside the build pipeline.
 */
declare const __PKG_VERSION__: string;

export const EDITOR_VERSION: string =
  typeof __PKG_VERSION__ !== 'undefined' ? __PKG_VERSION__ : 'dev';
