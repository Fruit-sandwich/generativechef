import {
  CampaignConfig,
  VCDLocation,
  ApprovedPalette,
  CombinationRecord,
  LeftHandTrait,
  HeadTrait,
  ApronTrait,
  RightHandTrait,
  AdornmentTrait,
  TraitSelection
} from '../types/campaign';

export const CAMPAIGN_CONFIG: CampaignConfig = {
  id: 'vcd-location-2026-01',
  title: 'The Generative Chef — Location Edition',
  startsAt: '2026-01-01',
  endsAt: '2026-12-31',
  cap: {
    unit: 'unique_trait_combination',
    maximum: 480,
    formula: '4 × 2 × 3 × 4 × 5',
    paletteChangesCountAsNewCombination: false,
  },
  artwork: {
    workId: 'vcd-work-chef-01',
    title: 'The Generative Chef',
    sourceSvg: {
      arweaveTxId: 'HaELFYC9S5TatmpEJRC6xHZXTFHsHbJF8KWrF-uCBvc',
      contentHash: 'c978d999522052989646ab41fd95545a1d3b2550dda974b315c1094f0157c01f',
      version: '1.0.0',
    },
    artist: 'Rashid & Studio VCD',
    rightsHolder: 'Virtue Classic Dish & Artist Estate',
    generatorVersion: '1.0.0',
  },
  rights: {
    noticeText:
      'Released into the Public Domain under Creative Commons Zero (CC0 1.0 Universal). Rashid & Studio VCD and Virtue Classic Dish dedicate all copyright and related rights in this generated edition to the public domain worldwide. Free for personal and commercial enjoyment.',
    termsUrl: '#public-domain',
    licenceMetadataFormat: 'Creative Commons Zero (CC0 1.0 Universal) / Public Domain Dedication',
  },
};

export const VCD_LOCATIONS: VCDLocation[] = [
  {
    id: 'vcd-utawala',
    name: 'Virtue Classic Dish • Utawala',
    city: 'Nairobi',
    country: 'Kenya',
    address: 'Eastern Bypass, Utawala, Nairobi, Kenya',
    publicLabel: 'Virtue Classic Dish • Utawala, Nairobi Kenya',
    qrUrlPath: '?loc=vcd-utawala',
    curatorNote: 'On-site generative culinary art encounter at Virtue Classic Dish in Utawala, Nairobi, Kenya.',
  },
];

export const TRAIT_OPTIONS = {
  left_hand: ['samosas', 'chai', 'potatoes', 'none'] as LeftHandTrait[],
  head: ['head1', 'head2'] as HeadTrait[],
  apron: ['apron1', 'apron2', 'none'] as ApronTrait[],
  right_hand: ['spoon', 'spatula', 'rollingpin', 'none'] as RightHandTrait[],
  adornments: ['hibiscus-flower', 'hummingbird', 'butterfly', 'neckerchief', 'none'] as AdornmentTrait[],
};

export const APPROVED_PALETTES: ApprovedPalette[] = [
  {
    id: 'palette-turmeric-charcoal',
    name: 'Flagship Turmeric & Charcoal',
    subtitle: 'Official Virtue Classic Dish Signature',
    brandColors: ['#ffcd00', '#1a1a1a', '#ffffff'],
    accentColors: ['#eb3b5a', '#2bcbba', '#45aaf2'],
    mappings: {
      '--color-coat': '#ffcd00',
      '--color-apron1': '#ffcd00',
      '--color-samosas-plate': '#ffcd00',
      '--color-apron2': '#1a1a1a',
      '--color-buttons': '#1a1a1a',
      '--color-potatoes-plate': '#1a1a1a',
      '--color-chai-cups': '#1a1a1a',
      '--color-apron1-strap': '#ffffff',
      '--color-apron2-strap': '#ffffff',
      '--color-gloves': '#ffffff',
      '--color-spoon': '#ffffff',
      '--color-spatula': '#ffffff',
      '--color-chai-plate': '#ffffff',
      '--color-hibiscus': '#eb3b5a',
      '--color-hummingbird-wing': '#eb3b5a',
      '--color-hummingbird-body': '#2bcbba',
      '--color-butterfly2-wings': '#2bcbba',
      '--color-hummingbird-head': '#45aaf2',
      '--color-hummingbird-decor1': '#45aaf2',
      '--color-hummingbird-decor2': '#45aaf2',
      '--color-neckerchief': '#2bcbba',
    },
  },
  {
    id: 'palette-cardamom-indigo',
    name: 'Royal Cardamom & Indigo',
    subtitle: 'Aromatic Botanical & Deep Clay',
    brandColors: ['#1e272e', '#20bf6b', '#fdfbf7'],
    accentColors: ['#fa8231', '#45aaf2', '#a55eea'],
    mappings: {
      '--color-coat': '#1e272e',
      '--color-apron1': '#20bf6b',
      '--color-samosas-plate': '#fa8231',
      '--color-apron2': '#1e272e',
      '--color-buttons': '#fdfbf7',
      '--color-potatoes-plate': '#1e272e',
      '--color-chai-cups': '#1e272e',
      '--color-apron1-strap': '#fdfbf7',
      '--color-apron2-strap': '#fdfbf7',
      '--color-gloves': '#fdfbf7',
      '--color-spoon': '#fdfbf7',
      '--color-spatula': '#fdfbf7',
      '--color-chai-plate': '#20bf6b',
      '--color-hibiscus': '#fa8231',
      '--color-hummingbird-wing': '#fa8231',
      '--color-hummingbird-body': '#20bf6b',
      '--color-butterfly2-wings': '#20bf6b',
      '--color-hummingbird-head': '#45aaf2',
      '--color-hummingbird-decor1': '#45aaf2',
      '--color-hummingbird-decor2': '#45aaf2',
      '--color-neckerchief': '#fa8231',
    },
  },
  {
    id: 'palette-terracotta-brass',
    name: 'Spiced Terracotta & Brass',
    subtitle: 'Warm Hearth & Clay Oven Tones',
    brandColors: ['#e15f41', '#ffd32a', '#2f3542'],
    accentColors: ['#c44569', '#0fb9b1', '#f78fb3'],
    mappings: {
      '--color-coat': '#e15f41',
      '--color-apron1': '#ffd32a',
      '--color-samosas-plate': '#ffd32a',
      '--color-apron2': '#2f3542',
      '--color-buttons': '#ffd32a',
      '--color-potatoes-plate': '#2f3542',
      '--color-chai-cups': '#2f3542',
      '--color-apron1-strap': '#ffffff',
      '--color-apron2-strap': '#ffffff',
      '--color-gloves': '#ffffff',
      '--color-spoon': '#ffffff',
      '--color-spatula': '#ffffff',
      '--color-chai-plate': '#ffffff',
      '--color-hibiscus': '#c44569',
      '--color-hummingbird-wing': '#c44569',
      '--color-hummingbird-body': '#0fb9b1',
      '--color-butterfly2-wings': '#0fb9b1',
      '--color-hummingbird-head': '#ffd32a',
      '--color-hummingbird-decor1': '#ffd32a',
      '--color-hummingbird-decor2': '#ffd32a',
      '--color-neckerchief': '#c44569',
    },
  },
  {
    id: 'palette-midnight-saffron',
    name: 'Midnight Saffron Monolith',
    subtitle: 'High Contrast Obsidian & Raw Gold',
    brandColors: ['#121212', '#ffa801', '#ffffff'],
    accentColors: ['#0be881', '#05c46b', '#ff3f34'],
    mappings: {
      '--color-coat': '#121212',
      '--color-apron1': '#ffa801',
      '--color-samosas-plate': '#ffa801',
      '--color-apron2': '#121212',
      '--color-buttons': '#ffa801',
      '--color-potatoes-plate': '#121212',
      '--color-chai-cups': '#121212',
      '--color-apron1-strap': '#ffffff',
      '--color-apron2-strap': '#ffffff',
      '--color-gloves': '#ffffff',
      '--color-spoon': '#ffffff',
      '--color-spatula': '#ffffff',
      '--color-chai-plate': '#ffffff',
      '--color-hibiscus': '#ff3f34',
      '--color-hummingbird-wing': '#ff3f34',
      '--color-hummingbird-body': '#0be881',
      '--color-butterfly2-wings': '#0be881',
      '--color-hummingbird-head': '#ffa801',
      '--color-hummingbird-decor1': '#ffa801',
      '--color-hummingbird-decor2': '#ffa801',
      '--color-neckerchief': '#0be881',
    },
  },
  {
    id: 'palette-verdigris-bone',
    name: 'Artisan Verdigris & Bone',
    subtitle: 'Patinated Copper & Vintage Parchment',
    brandColors: ['#0fb9b1', '#34495e', '#faf8f5'],
    accentColors: ['#d35400', '#8e44ad', '#27ae60'],
    mappings: {
      '--color-coat': '#0fb9b1',
      '--color-apron1': '#faf8f5',
      '--color-samosas-plate': '#d35400',
      '--color-apron2': '#34495e',
      '--color-buttons': '#faf8f5',
      '--color-potatoes-plate': '#34495e',
      '--color-chai-cups': '#34495e',
      '--color-apron1-strap': '#faf8f5',
      '--color-apron2-strap': '#faf8f5',
      '--color-gloves': '#faf8f5',
      '--color-spoon': '#faf8f5',
      '--color-spatula': '#faf8f5',
      '--color-chai-plate': '#faf8f5',
      '--color-hibiscus': '#d35400',
      '--color-hummingbird-wing': '#d35400',
      '--color-hummingbird-body': '#27ae60',
      '--color-butterfly2-wings': '#27ae60',
      '--color-hummingbird-head': '#8e44ad',
      '--color-hummingbird-decor1': '#8e44ad',
      '--color-hummingbird-decor2': '#8e44ad',
      '--color-neckerchief': '#d35400',
    },
  },
];

/**
 * Builds the canonical combination identifier:
 * Canonical sorted trait values, e.g.
 * left=samosas|head=head1|apron=apron2|right=spoon|adornment=hibiscus-flower
 */
export function formatCanonicalId(traits: TraitSelection): string {
  return `left=${traits['left-hand']}|head=${traits['head']}|apron=${traits['apron']}|right=${traits['right-hand']}|adornment=${traits['adornments']}`;
}

/**
 * Generates all 480 deterministic trait combinations.
 * Total = 4 × 2 × 3 × 4 × 5 = 480
 */
export function generateAllCombinations(): CombinationRecord[] {
  const records: CombinationRecord[] = [];
  let index = 0;

  for (const left of TRAIT_OPTIONS.left_hand) {
    for (const head of TRAIT_OPTIONS.head) {
      for (const apron of TRAIT_OPTIONS.apron) {
        for (const right of TRAIT_OPTIONS.right_hand) {
          for (const adornment of TRAIT_OPTIONS.adornments) {
            const traits: TraitSelection = {
              'left-hand': left,
              'head': head,
              'apron': apron,
              'right-hand': right,
              'adornments': adornment,
            };

            const canonicalId = formatCanonicalId(traits);

            // Pre-seed some records deterministically so the application has realistic
            // historical activity (e.g. ~142 issued, 2 reserved, remaining available)
            let state: 'available' | 'reserved' | 'issued' = 'available';
            let claimedAt: number | undefined;
            let locationId: string | undefined;
            let txId: string | undefined;

            // Deterministic pseudo-random seed based on index
            const isIssued = (index * 37 + 13) % 480 < 142;
            const isReserved = !isIssued && index === 215;

            if (isIssued) {
              state = 'issued';
              // Staggered claimed dates in 2026
              const daysAgo = (index % 60) + 1;
              claimedAt = Date.now() - daysAgo * 24 * 60 * 60 * 1000 - (index * 1337);
              locationId = 'vcd-utawala';
              txId = `ar_tx_${(index * 99991 + 104729).toString(36).padStart(12, '0')}_${index.toString().padStart(3, '0')}`;
            } else if (isReserved) {
              state = 'reserved';
            }

            records.push({
              index,
              canonicalId,
              traits,
              state,
              claimedAt,
              locationId,
              txId,
              reservedUntil: isReserved ? Date.now() + 12 * 60 * 1000 : undefined,
            });

            index++;
          }
        }
      }
    }
  }

  return records;
}

const REGISTRY_STORAGE_KEY = 'vcd_location_art_registry_utawala_v2';

export function loadSavedRegistry(): CombinationRecord[] {
  try {
    const raw = localStorage.getItem(REGISTRY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 480) {
        // Expire any expired reservations
        const now = Date.now();
        return parsed.map((item) => {
          if (item.state === 'reserved' && item.reservedUntil && item.reservedUntil < now) {
            return {
              ...item,
              state: 'available',
              reservedAt: undefined,
              reservedUntil: undefined,
            };
          }
          return item;
        });
      }
    }
  } catch (err) {
    console.warn('Failed to parse saved registry from localStorage, initializing fresh:', err);
  }

  const fresh = generateAllCombinations();
  try {
    localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(fresh));
  } catch (e) {
    // Ignore storage quota
  }
  return fresh;
}

export function saveRegistry(records: CombinationRecord[]): void {
  try {
    localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.warn('Failed to save registry to localStorage:', err);
  }
}
