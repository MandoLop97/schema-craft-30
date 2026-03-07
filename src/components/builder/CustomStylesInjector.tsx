import { useEffect, useRef } from 'react';

interface CustomStylesInjectorProps {
  /** External CSS stylesheet URLs to load */
  stylesheets?: string[];
  /** Raw CSS string to inject */
  css?: string;
  /** External script URLs to inject (e.g. Tailwind CDN) */
  scripts?: string[];
}

/**
 * Injects custom stylesheets (<link>), raw CSS (<style>), and scripts (<script>)
 * into the canvas so builder preview matches the real site appearance.
 */
export function CustomStylesInjector({ stylesheets, css, scripts }: CustomStylesInjectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Inject <link> elements for external stylesheets
  useEffect(() => {
    if (!stylesheets?.length || !containerRef.current) return;

    const parent = containerRef.current.parentElement;
    if (!parent) return;

    const links: HTMLLinkElement[] = [];

    stylesheets.forEach((href) => {
      if (parent.querySelector(`link[href="${href}"]`)) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute('data-nxr-custom', 'true');
      parent.prepend(link);
      links.push(link);
    });

    return () => {
      links.forEach((l) => l.remove());
    };
  }, [stylesheets]);

  // Inject <style> for raw CSS
  useEffect(() => {
    if (!css || !containerRef.current) return;

    const parent = containerRef.current.parentElement;
    if (!parent) return;

    const style = document.createElement('style');
    style.setAttribute('data-nxr-custom', 'true');
    style.textContent = css;
    parent.prepend(style);

    return () => {
      style.remove();
    };
  }, [css]);

  // Inject <script> elements for external scripts
  useEffect(() => {
    if (!scripts?.length || !containerRef.current) return;

    const doc = containerRef.current.ownerDocument;
    const target = doc?.head || containerRef.current.parentElement;
    if (!target) return;

    const scriptEls: HTMLScriptElement[] = [];

    scripts.forEach((src) => {
      if (target.querySelector(`script[src="${src}"]`)) return;
      const script = doc.createElement('script');
      script.src = src;
      script.async = false;
      script.setAttribute('data-nxr-custom', 'true');
      target.appendChild(script);
      scriptEls.push(script);
    });

    return () => {
      scriptEls.forEach((s) => s.remove());
    };
  }, [scripts]);

  return <div ref={containerRef} style={{ display: 'none' }} />;
}
