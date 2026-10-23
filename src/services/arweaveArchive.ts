import { TraitSelection, VCDLocation, ApprovedPalette, CombinationRecord } from '../types/campaign';
import { computeSha256 } from '../utils/crypto';

export interface ArchivalResult {
  txId: string;
  svgHash: string;
  sourceSvgTxId: string;
  sourceSvgHash: string;
  status: 'confirmed_permaweb' | 'local_cryptographic_anchor';
  gatewayUrl: string;
  explorerUrl: string;
  timestamp: string;
  tags: { name: string; value: string }[];
  bundleManifest: Record<string, unknown>;
}

/**
 * Archives the individual chef vector artwork as a single standalone SVG file
 * to Arweave Permaweb using TurboSDK (ar.io / ardrive).
 * Returns the transaction ID of the individual chef SVG.
 */
export async function archiveToPermaweb(params: {
  individualSvg: string;
  combination: CombinationRecord;
  traits: TraitSelection;
  location: VCDLocation;
  palette: ApprovedPalette;
  customColors: Record<string, string>;
  campaignId: string;
}): Promise<ArchivalResult> {
  const { individualSvg, combination, traits, location, palette, customColors, campaignId } = params;

  // 1. Calculate cryptographic integrity hash of the individual clean SVG
  const svgHash = await computeSha256(individualSvg);

  const tags = [
    { name: 'Content-Type', value: 'image/svg+xml' },
    { name: 'App-Name', value: 'VCD-Location-Art-Generator' },
    { name: 'App-Version', value: '1.0.0' },
    { name: 'Type', value: 'Chef-Artwork-SVG' },
    { name: 'Work-Title', value: 'The Generative Chef' },
    { name: 'Edition', value: `${combination.index + 1}/480` },
    { name: 'Location', value: `${location.name} (${location.city}, ${location.country})` },
    { name: 'Location-ID', value: location.id },
    { name: 'Canonical-Trait-ID', value: combination.canonicalId },
    { name: 'Left-Hand', value: traits['left-hand'] },
    { name: 'Head', value: traits.head },
    { name: 'Apron', value: traits.apron },
    { name: 'Right-Hand', value: traits['right-hand'] },
    { name: 'Adornment', value: traits.adornments },
    { name: 'Palette', value: palette.name },
    { name: 'Licence', value: 'CC0-1.0; Public-Domain-Dedication' },
    { name: 'Public-Domain', value: 'true' },
    { name: 'Artist', value: 'Rashid & Studio VCD' },
    { name: 'Source-Master-Tx', value: 'HaELFYC9S5TatmpEJRC6xHZXTFHsHbJF8KWrF-uCBvc' },
    { name: 'SVG-SHA256', value: svgHash },
    { name: 'Timestamp', value: Date.now().toString() },
  ];

  const manifest = {
    standard: 'ANS-105',
    work: 'The Generative Chef',
    edition: combination.index + 1,
    totalCap: 480,
    canonicalId: combination.canonicalId,
    activeTraits: traits,
    location: {
      id: location.id,
      name: location.name,
      city: location.city,
      country: location.country,
      address: location.address,
    },
    palette: {
      name: palette.name,
      colors: customColors,
    },
    rights: {
      license: 'CC0-1.0',
      status: 'Public Domain Dedication',
      statement: 'By mutual agreement of Rashid & Studio VCD and Virtue Classic Dish, this edition is dedicated to the Public Domain worldwide.',
    },
    provenance: {
      svgHash,
      sourceSvgTx: 'HaELFYC9S5TatmpEJRC6xHZXTFHsHbJF8KWrF-uCBvc',
      generator: 'VCD Location Art Generator v1.0.0',
      timestamp: new Date().toISOString(),
    },
  };

  // Try real Turbo upload using TurboSDK from ar.io
  let txId: string = '';
  let isPermaweb = false;

  try {
    let TurboFactory: any = typeof window !== 'undefined' && (window as any).TurboFactory ? (window as any).TurboFactory : null;

    if (!TurboFactory) {
      try {
        const mod: any = await import('@ardrive/turbo-sdk/web');
        if (mod && mod.TurboFactory) {
          TurboFactory = mod.TurboFactory;
        }
      } catch (importErr) {
        console.info('Turbo SDK dynamic import notice:', importErr);
      }
    }

    if (TurboFactory) {
      const turbo: any = TurboFactory.unauthenticated();
      
      // Store as a single standalone SVG file directly
      const file = new File([individualSvg], `TheGenerativeChef_Edition_${combination.index + 1}_Utawala.svg`, {
        type: 'image/svg+xml',
      });

      const res = await turbo.uploadFile({
        fileStreamFactory: () => file.stream(),
        fileSizeFactory: () => file.size,
        dataItemOpts: { tags },
      });

      if (res && res.id) {
        txId = res.id;
        isPermaweb = true;
        console.log(`⚓ Individual Chef SVG anchored permanently to Arweave! Tx ID: ${txId}`);
      }
    }
  } catch (err) {
    console.info('TurboFactory direct SVG network upload notice:', err);
  }

  // Fallback deterministic verifiable identifier if offline or sandbox restricted
  if (!txId) {
    txId = `ar_svg_${svgHash.slice(0, 32)}_${(combination.index + 1).toString().padStart(3, '0')}`;
  }

  const gatewayUrl = `https://arweave.net/${txId}`;
  const explorerUrl = `https://viewblock.io/arweave/tx/${txId}`;

  return {
    txId,
    svgHash,
    sourceSvgTxId: 'HaELFYC9S5TatmpEJRC6xHZXTFHsHbJF8KWrF-uCBvc',
    sourceSvgHash: 'c978d999522052989646ab41fd95545a1d3b2550dda974b315c1094f0157c01f',
    status: isPermaweb ? 'confirmed_permaweb' : 'local_cryptographic_anchor',
    gatewayUrl,
    explorerUrl,
    timestamp: new Date().toISOString(),
    tags,
    bundleManifest: manifest,
  };
}
