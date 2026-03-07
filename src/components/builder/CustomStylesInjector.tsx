import { useEffect, useRef } from 'react';

interface CustomStylesInjectorProps {
  /** External CSS stylesheet URLs to load */
  stylesheets?: string[];
  /** Raw CSS string to inject */
  css?: string;
}

/**
 * Injects custom stylesheets (<link>) and raw CSS (<style>) into the
 * canvas so builder preview matches the real site appearance.
 */
export function CustomStylesInjector({ stylesheets, css }: CustomStylesInjectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Inject <link> elements for external stylesheets
  useEffect(() => {
    if (!stylesheets?.length || !containerRef.current) return;

    const parent = containerRef.current.parentElement;
    if (!parent) return;

    const links: HTMLLinkElement[] = [];

    stylesheets.forEach((href) => {
      // Avoid duplicates
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

  return <div ref={containerRef} style={{ display: 'none' }} />;
}
