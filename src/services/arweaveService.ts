import { TraitSelection, VCDLocation, ApprovedPalette, CombinationRecord } from '../types/campaign';
import { computeSha256 } from '../utils/crypto';

export type StampFormat = 'standalone-svg' | 'trait-json' | 'offline-sha256';

export interface StampResult {
  txId: string;
  format: StampFormat;
  sizeBytes: number;
  svgHash: string;
  sourceSvgTxId: string;
  sourceSvgHash: string;
  status: 'confirmed_permaweb' | 'local_cryptographic_anchor';
  gatewayUrl: string;
  explorerUrl: string;
  timestamp: string;
  tags: { name: string; value: string }[];
  manifest: Record<string, unknown>;
}

const STORAGE_DEVICE_KEY = 'vcd_arweave_device_key';

/**
 * Retrieves or generates an ephemeral 32-byte hex signing key.
 * This enables zero-configuration, walletless Turbo SDK unauthenticated stamping (<100 KiB free tier).
 */
function getOrCreateDeviceKey(): string {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const existing = localStorage.getItem(STORAGE_DEVICE_KEY);
      if (existing && existing.startsWith('0x') && existing.length === 66) {
        return existing;
      }
      const array = new Uint8Array(32);
      if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(array);
      } else {
        for (let i = 0; i < 32; i++) array[i] = Math.floor(Math.random() * 256);
      }
      const hex = '0x' + Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(STORAGE_DEVICE_KEY, hex);
      return hex;
    }
  } catch (err) {
    console.info('Device key localStorage notice:', err);
  }

  // In-memory fallback
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 32; i++) array[i] = Math.floor(Math.random() * 256);
  }
  return '0x' + Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Stamps a unique 1-of-480 Chef Talisman edition to the Arweave Permaweb using Turbo SDK.
 * 
 * Storage Strategy (<100 KiB free unauthenticated tier):
 * - Primary (Tier 1): Standalone SVG (~18–35 KiB), directly viewable on Arweave gateway URLs.
 * - Fallback (Tier 2): Compact Trait JSON manifest (~1.2 KiB) for maximum storage efficiency
 *   if payload >= 95 KiB or upon network constraints.
 * - Offline Fallback: Deterministic SHA-256 cryptographic anchor if disconnected.
 */
export async function stampToArweave(params: {
  individualSvg: string;
  combination: CombinationRecord;
  traits: TraitSelection;
  location: VCDLocation;
  palette: ApprovedPalette;
  customColors: Record<string, string>;
  campaignId: string;
}): Promise<StampResult> {
  const { individualSvg, combination, traits, location, palette, customColors } = params;

  // 1. Calculate cryptographic integrity hash of the individual clean SVG
  const svgHash = await computeSha256(individualSvg);
  const encoder = new TextEncoder();
  const svgBytes = encoder.encode(individualSvg);

  // 2. Prepare ANS-110 metadata manifest
  const manifest = {
    standard: 'ANS-110',
    work: 'The Generative Chef',
    app: 'VCD-Utawala',
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
      id: palette.id,
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
      sourceSvgHash: 'c978d999522052989646ab41fd95545a1d3b2550dda974b315c1094f0157c01f',
      generator: 'VCD Utawala Generative Talisman Engine v1.0.0',
      timestamp: new Date().toISOString(),
    },
  };

  let txId: string = '';
  let stampedFormat: StampFormat = 'standalone-svg';
  let payloadSizeBytes = svgBytes.byteLength;
  let activeTags: { name: string; value: string }[] = [];
  let isPermaweb = false;

  // Standalone SVG tags
  const svgTags = [
    { name: 'Content-Type', value: 'image/svg+xml' },
    { name: 'App-Name', value: 'VCD-Utawala' },
    { name: 'App-Version', value: '1.0.0' },
    { name: 'Title', value: `Virtue Classic Dish - Chef Edition #${combination.index + 1}` },
    { name: 'Type', value: 'talisman' },
    { name: 'Format', value: 'standalone-svg' },
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

  // Compact Trait JSON tags
  const traitJsonTags = [
    { name: 'Content-Type', value: 'application/json' },
    { name: 'App-Name', value: 'VCD-Utawala' },
    { name: 'App-Version', value: '1.0.0' },
    { name: 'Title', value: `Virtue Classic Dish - Chef Edition #${combination.index + 1} Trait Manifest` },
    { name: 'Type', value: 'talisman-manifest' },
    { name: 'Format', value: 'trait-json' },
    { name: 'Edition', value: `${combination.index + 1}/480` },
    { name: 'Location-ID', value: location.id },
    { name: 'Canonical-Trait-ID', value: combination.canonicalId },
    { name: 'Licence', value: 'CC0-1.0; Public-Domain-Dedication' },
    { name: 'SVG-SHA256', value: svgHash },
    { name: 'Timestamp', value: Date.now().toString() },
  ];

  // Try Turbo SDK upload
  try {
    const { TurboFactory } = await import('@ardrive/turbo-sdk/web');
    const privateKey = getOrCreateDeviceKey();
    const turbo = TurboFactory.authenticated({ privateKey, token: 'ethereum' });

    // Tier 1: Standalone SVG if under 95 KiB (leaves headroom below Turbo's 100 KiB free limit)
    const MAX_SVG_BYTES = 95 * 1024; // 95 KiB
    if (svgBytes.byteLength < MAX_SVG_BYTES) {
      try {
        const uploadRes = await turbo.upload({
          data: svgBytes,
          dataItemOpts: { tags: svgTags },
        });

        if (uploadRes && uploadRes.id) {
          txId = uploadRes.id;
          stampedFormat = 'standalone-svg';
          payloadSizeBytes = svgBytes.byteLength;
          activeTags = svgTags;
          isPermaweb = true;
          console.log(`⚓ Stamped Standalone SVG to Arweave! Tx: ${txId} (${payloadSizeBytes} bytes)`);
        }
      } catch (svgUploadErr) {
        console.warn('SVG upload encountered error, engaging Trait JSON efficiency fallback:', svgUploadErr);
      }
    } else {
      console.info(`SVG size (${svgBytes.byteLength} B) >= 95 KiB; defaulting directly to Trait JSON fallback.`);
    }

    // Tier 2: Fallback to Trait JSON for extreme efficiency (~1.2 KiB)
    if (!txId) {
      const jsonBytes = encoder.encode(JSON.stringify(manifest, null, 2));
      try {
        const uploadRes = await turbo.upload({
          data: jsonBytes,
          dataItemOpts: { tags: traitJsonTags },
        });

        if (uploadRes && uploadRes.id) {
          txId = uploadRes.id;
          stampedFormat = 'trait-json';
          payloadSizeBytes = jsonBytes.byteLength;
          activeTags = traitJsonTags;
          isPermaweb = true;
          console.log(`⚓ Stamped Compact Trait JSON to Arweave! Tx: ${txId} (${payloadSizeBytes} bytes)`);
        }
      } catch (jsonUploadErr) {
        console.warn('Trait JSON fallback upload notice:', jsonUploadErr);
      }
    }
  } catch (sdkErr) {
    console.info('Turbo SDK initialization or gateway connection notice:', sdkErr);
  }

  // Tier 3: Deterministic cryptographic fallback if offline or gateway unreachable
  if (!txId) {
    txId = `ar_stamp_${svgHash.slice(0, 32)}_${(combination.index + 1).toString().padStart(3, '0')}`;
    stampedFormat = 'offline-sha256';
    payloadSizeBytes = svgBytes.byteLength;
    activeTags = svgTags;
  }

  const gatewayUrl = `https://arweave.net/${txId}`;
  const explorerUrl = `https://viewblock.io/arweave/tx/${txId}`;

  return {
    txId,
    format: stampedFormat,
    sizeBytes: payloadSizeBytes,
    svgHash,
    sourceSvgTxId: 'HaELFYC9S5TatmpEJRC6xHZXTFHsHbJF8KWrF-uCBvc',
    sourceSvgHash: 'c978d999522052989646ab41fd95545a1d3b2550dda974b315c1094f0157c01f',
    status: isPermaweb ? 'confirmed_permaweb' : 'local_cryptographic_anchor',
    gatewayUrl,
    explorerUrl,
    timestamp: new Date().toISOString(),
    tags: activeTags,
    manifest,
  };
}

// Backwards-compatibility alias for previous imports
export const archiveToPermaweb = stampToArweave;
