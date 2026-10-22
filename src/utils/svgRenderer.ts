import masterSvgRaw from '../assets/the-generative-chef-master.svg?raw';
import { TraitSelection, ApprovedPalette } from '../types/campaign';

const ALL_SUB_TRAIT_IDS = [
  'samosas',
  'chai',
  'potatoes',
  'head1',
  'head2',
  'apron1',
  'apron2',
  'spoon',
  'spatula',
  'rollingpin',
  'hibiscus-flower',
  'hummingbird',
  'butterfly',
  'neckerchief',
];

export interface ActiveColorSlot {
  id: string;
  varName: string;
  label: string;
}

export function getActiveColorSlots(traits: TraitSelection): ActiveColorSlot[] {
  const slots: ActiveColorSlot[] = [
    { id: 'coat-col', varName: '--color-coat', label: 'Coat' },
  ];

  if (traits.apron === 'apron1') {
    slots.push({ id: 'apron1-col', varName: '--color-apron1', label: 'Bib Apron' });
  } else if (traits.apron === 'apron2') {
    slots.push({ id: 'apron2-col', varName: '--color-apron2', label: 'Half Apron' });
  }

  if (traits['left-hand'] === 'samosas') {
    slots.push({ id: 'samosas-plate-col', varName: '--color-samosas-plate', label: 'Samosas Plate' });
  } else if (traits['left-hand'] === 'chai') {
    slots.push({ id: 'chai-cups-col', varName: '--color-chai-cups', label: 'Chai Cups' });
  } else if (traits['left-hand'] === 'potatoes') {
    slots.push({ id: 'potatoes-plate-col', varName: '--color-potatoes-plate', label: 'Potatoes Plate' });
  }

  if (traits['right-hand'] === 'spoon') {
    slots.push({ id: 'spoon-col', varName: '--color-spoon', label: 'Spoon' });
  } else if (traits['right-hand'] === 'spatula') {
    slots.push({ id: 'spatula-col', varName: '--color-spatula', label: 'Spatula' });
  }

  if (traits.adornments === 'hibiscus-flower') {
    slots.push({ id: 'hibiscus-col', varName: '--color-hibiscus', label: 'Hibiscus Flower' });
  } else if (traits.adornments === 'hummingbird') {
    slots.push(
      { id: 'hummingbird-wing-col', varName: '--color-hummingbird-wing', label: 'Hummingbird Wing' },
      { id: 'hummingbird-body-col', varName: '--color-hummingbird-body', label: 'Hummingbird Body' }
    );
  } else if (traits.adornments === 'butterfly') {
    slots.push({ id: 'butterfly2-wings-col', varName: '--color-butterfly2-wings', label: 'Butterfly' });
  } else if (traits.adornments === 'neckerchief') {
    slots.push({ id: 'neckerchief-col', varName: '--color-neckerchief', label: 'Neckerchief' });
  }

  return slots;
}

/**
 * Transforms the master SVG string into an active standalone SVG string
 * with exact trait visibilities and baked-in color styles.
 */
export function buildRenderedSvg(
  traits: TraitSelection,
  colorMappings: Record<string, string>,
  editionLabel?: string
): string {
  if (typeof DOMParser === 'undefined') {
    return masterSvgRaw;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(masterSvgRaw, 'image/svg+xml');
  const svgEl = doc.documentElement;

  // Active traits to show
  const activeIds = new Set<string>();
  if (traits['left-hand'] !== 'none') activeIds.add(traits['left-hand']);
  if (traits['head']) activeIds.add(traits['head']);
  if (traits['apron'] !== 'none') activeIds.add(traits['apron']);
  if (traits['right-hand'] !== 'none') activeIds.add(traits['right-hand']);
  if (traits['adornments'] !== 'none') activeIds.add(traits['adornments']);

  // Update visibility for all sub-traits
  ALL_SUB_TRAIT_IDS.forEach((id) => {
    const el = doc.getElementById(id);
    if (el) {
      if (activeIds.has(id)) {
        el.removeAttribute('display');
        el.style.display = 'inline';
        el.style.visibility = 'visible';
      } else {
        el.setAttribute('display', 'none');
        el.style.display = 'none';
        el.style.visibility = 'hidden';
      }
    }
  });

  // Apply colors to dynamic color nodes
  Object.entries(colorMappings).forEach(([varName, hexColor]) => {
    // Variable name like "--color-apron1" maps to id "apron1-col"
    const elementId = varName.replace('--color-', '') + '-col';
    const el = doc.getElementById(elementId);
    if (el) {
      el.style.fill = hexColor;
      el.setAttribute('fill', hexColor);
    }
  });

  // Inject or update <style> block in SVG for standalone preservation
  let styleEl = doc.querySelector('svg > style');
  if (!styleEl) {
    styleEl = doc.createElementNS('http://www.w3.org/2000/svg', 'style');
    svgEl.prepend(styleEl);
  }

  const cssRules = Object.entries(colorMappings)
    .map(([varName, val]) => `${varName}: ${val};`)
    .join('\n    ');

  const extraStyles = `
    :root {
      ${cssRules}
    }
    #coat-col            { fill: var(--color-coat, #ffcd00); }
    #apron1-col          { fill: var(--color-apron1, #ffcd00); }
    #samosas-plate-col   { fill: var(--color-samosas-plate, #ffcd00); }
    #apron2-col          { fill: var(--color-apron2, #1a1a1a); }
    #buttons-col         { fill: var(--color-buttons, #1a1a1a); }
    #potatoes-plate-col  { fill: var(--color-potatoes-plate, #1a1a1a); }
    #chai-cups-col       { fill: var(--color-chai-cups, #1a1a1a); }
    #apron1-strap-col    { fill: var(--color-apron1-strap, #ffffff); }
    #apron2-strap-col    { fill: var(--color-apron2-strap, #ffffff); }
    #gloves-col          { fill: var(--color-gloves, #ffffff); }
    #spoon-col           { fill: var(--color-spoon, #ffffff); }
    #spatula-col         { fill: var(--color-spatula, #ffffff); }
    #chai-plate-col      { fill: var(--color-chai-plate, #ffffff); }
    #hibiscus-col        { fill: var(--color-hibiscus, #ff6b6b); }
    #hummingbird-wing-col     { fill: var(--color-hummingbird-wing, #ff6b6b); }
    #hummingbird-body-col     { fill: var(--color-hummingbird-body, #4ecdc4); }
    #butterfly2-wings-col     { fill: var(--color-butterfly2-wings, #4ecdc4); }
    #hummingbird-head-col     { fill: var(--color-hummingbird-head, #45aaf2); }
    #hummingbird-decor1-col   { fill: var(--color-hummingbird-decor1, #45aaf2); }
    #hummingbird-decor2-col   { fill: var(--color-hummingbird-decor2, #45aaf2); }
    #neckerchief-col          { fill: var(--color-neckerchief, #4ecdc4); }
  `;
  styleEl.textContent = extraStyles;

  // Add discrete provenance watermark text at the bottom if edition label provided
  if (editionLabel) {
    const textEl = doc.createElementNS('http://www.w3.org/2000/svg', 'text');
    textEl.setAttribute('x', '10');
    textEl.setAttribute('y', '292');
    textEl.setAttribute('font-size', '2.4');
    textEl.setAttribute('font-family', 'sans-serif');
    textEl.setAttribute('fill', '#888888');
    textEl.setAttribute('letter-spacing', '0.2');
    textEl.textContent = editionLabel;
    svgEl.appendChild(textEl);
  }

  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc);
}

/**
 * Builds an isolated individual chef SVG containing ONLY the traits that involve it.
 * All unused trait groups are completely purged from the DOM tree.
 */
export function buildCleanIndividualChefSvg(
  traits: TraitSelection,
  colorMappings: Record<string, string>,
  editionLabel?: string
): string {
  if (typeof DOMParser === 'undefined') {
    return masterSvgRaw;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(masterSvgRaw, 'image/svg+xml');
  const svgEl = doc.documentElement;

  // Active traits to retain
  const activeIds = new Set<string>();
  if (traits['left-hand'] !== 'none') activeIds.add(traits['left-hand']);
  if (traits['head']) activeIds.add(traits['head']);
  if (traits['apron'] !== 'none') activeIds.add(traits['apron']);
  if (traits['right-hand'] !== 'none') activeIds.add(traits['right-hand']);
  if (traits['adornments'] !== 'none') activeIds.add(traits['adornments']);

  // Completely remove all sub-traits that do not belong to this individual chef
  ALL_SUB_TRAIT_IDS.forEach((id) => {
    const el = doc.getElementById(id);
    if (el) {
      if (activeIds.has(id)) {
        el.removeAttribute('display');
        el.style.removeProperty('display');
      } else {
        // Purge node completely
        el.remove();
      }
    }
  });

  // Apply colors directly to the active elements
  Object.entries(colorMappings).forEach(([varName, hexColor]) => {
    const elementId = varName.replace('--color-', '') + '-col';
    const el = doc.getElementById(elementId);
    if (el) {
      el.style.fill = hexColor;
      el.setAttribute('fill', hexColor);
    }
  });

  // Inject clean <style> block
  let styleEl = doc.querySelector('svg > style');
  if (!styleEl) {
    styleEl = doc.createElementNS('http://www.w3.org/2000/svg', 'style');
    svgEl.prepend(styleEl);
  }

  const cssRules = Object.entries(colorMappings)
    .map(([varName, val]) => `${varName}: ${val};`)
    .join('\n    ');

  styleEl.textContent = `
    :root {
      ${cssRules}
    }
    #coat-col            { fill: var(--color-coat, #ffcd00); }
    #apron1-col          { fill: var(--color-apron1, #ffcd00); }
    #samosas-plate-col   { fill: var(--color-samosas-plate, #ffcd00); }
    #apron2-col          { fill: var(--color-apron2, #1a1a1a); }
    #buttons-col         { fill: var(--color-buttons, #1a1a1a); }
    #potatoes-plate-col  { fill: var(--color-potatoes-plate, #1a1a1a); }
    #chai-cups-col       { fill: var(--color-chai-cups, #1a1a1a); }
    #apron1-strap-col    { fill: var(--color-apron1-strap, #ffffff); }
    #apron2-strap-col    { fill: var(--color-apron2-strap, #ffffff); }
    #gloves-col          { fill: var(--color-gloves, #ffffff); }
    #spoon-col           { fill: var(--color-spoon, #ffffff); }
    #spatula-col         { fill: var(--color-spatula, #ffffff); }
    #chai-plate-col      { fill: var(--color-chai-plate, #ffffff); }
    #hibiscus-col        { fill: var(--color-hibiscus, #ff6b6b); }
    #hummingbird-wing-col     { fill: var(--color-hummingbird-wing, #ff6b6b); }
    #hummingbird-body-col     { fill: var(--color-hummingbird-body, #4ecdc4); }
    #butterfly2-wings-col     { fill: var(--color-butterfly2-wings, #4ecdc4); }
    #hummingbird-head-col     { fill: var(--color-hummingbird-head, #45aaf2); }
    #hummingbird-decor1-col   { fill: var(--color-hummingbird-decor1, #45aaf2); }
    #hummingbird-decor2-col   { fill: var(--color-hummingbird-decor2, #45aaf2); }
    #neckerchief-col          { fill: var(--color-neckerchief, #4ecdc4); }
  `;

  if (editionLabel) {
    const textEl = doc.createElementNS('http://www.w3.org/2000/svg', 'text');
    textEl.setAttribute('x', '10');
    textEl.setAttribute('y', '292');
    textEl.setAttribute('font-size', '2.4');
    textEl.setAttribute('font-family', 'sans-serif');
    textEl.setAttribute('fill', '#888888');
    textEl.setAttribute('letter-spacing', '0.2');
    textEl.textContent = editionLabel;
    svgEl.appendChild(textEl);
  }

  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc);
}

/**
 * Renders high-res PNG (2100×2970) matching the original production specification
 */
export function exportHighResPng(
  svgString: string,
  filename: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 2100;
      canvas.height = 2970;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas 2D context not available');
      }

      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, 2100, 2970);

          const link = document.createElement('a');
          link.download = filename;
          link.href = canvas.toDataURL('image/png');
          link.click();
          resolve();
        } catch (err) {
          reject(err);
        } finally {
          URL.revokeObjectURL(url);
        }
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(new Error('Image failed to render from SVG string: ' + err));
      };

      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Triggers browser download of raw SVG file
 */
export function downloadSvgFile(svgString: string, filename: string): void {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Triggers browser download of formatted JSON bundle
 */
export function downloadJsonFile(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
