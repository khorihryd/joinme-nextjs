/**
 * SVG Vector Normalizer & Sanitizer
 * Normalizes raw SVG string so it scales perfectly, inherits parent colors,
 * and strips XML headers/comments.
 */
export function normalizeSvgString(svgRaw?: string): string {
  if (!svgRaw) return '';
  let svg = svgRaw.trim();
  if (!svg) return '';

  // 1. Remove XML declarations, DOCTYPEs, and HTML/XML comments
  svg = svg.replace(/<\?xml[^>]*\?>/gi, '');
  svg = svg.replace(/<!DOCTYPE[^>]*>/gi, '');
  svg = svg.replace(/<!--[\s\S]*?-->/g, '');
  svg = svg.trim();

  // Find root <svg ... >
  const svgTagMatch = svg.match(/<svg([^>]*)>/i);
  if (!svgTagMatch) return svg;

  let attrs = svgTagMatch[1];

  // 2. Ensure viewBox is present if missing
  if (!/viewBox=/i.test(attrs)) {
    const wMatch = attrs.match(/width=["']?(\d+)/i);
    const hMatch = attrs.match(/height=["']?(\d+)/i);
    const w = wMatch ? wMatch[1] : '24';
    const h = hMatch ? hMatch[1] : '24';
    attrs += ` viewBox="0 0 ${w} ${h}"`;
  }

  // 3. Strip fixed root width/height attributes so CSS controls sizing (width:100%, height:100%)
  attrs = attrs.replace(/\s(width|height)=["'][^"']*["']/gi, '');

  // 4. Ensure xmlns attribute exists
  if (!/xmlns=/i.test(attrs)) {
    attrs += ' xmlns="http://www.w3.org/2000/svg"';
  }

  // 5. Reconstruct root <svg> tag
  const newSvgTag = `<svg${attrs}>`;
  svg = svg.replace(/<svg[^>]*>/i, newSvgTag);

  return svg;
}

/**
 * Checks if a string contains valid SVG markup
 */
export function isSvgMarkup(str?: string): boolean {
  if (!str) return false;
  const s = str.trim().toLowerCase();
  return s.includes('<svg') && s.includes('</svg>');
}
