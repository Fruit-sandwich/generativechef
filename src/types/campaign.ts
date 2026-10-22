/**
 * VCD Location Art Generator Domain Types
 * Based on the Virtue Classic Dish Generative Art Specification
 */

export type LeftHandTrait = 'samosas' | 'chai' | 'potatoes' | 'none';
export type HeadTrait = 'head1' | 'head2';
export type ApronTrait = 'apron1' | 'apron2' | 'none';
export type RightHandTrait = 'spoon' | 'spatula' | 'rollingpin' | 'none';
export type AdornmentTrait = 'hibiscus-flower' | 'hummingbird' | 'butterfly' | 'neckerchief' | 'none';

export interface TraitSelection {
  'left-hand': LeftHandTrait;
  'head': HeadTrait;
  'apron': ApronTrait;
  'right-hand': RightHandTrait;
  'adornments': AdornmentTrait;
}

export type CombinationState = 'available' | 'reserved' | 'issued';

export interface CombinationRecord {
  index: number; // 0 to 479 (representing 1 to 480)
  canonicalId: string; // e.g. "left=samosas|head=head1|apron=apron2|right=spoon|adornment=hibiscus-flower"
  traits: TraitSelection;
  state: CombinationState;
  reservedAt?: number; // timestamp
  reservedUntil?: number; // timestamp (reservedAt + 15 mins)
  claimedAt?: number;
  locationId?: string;
  txId?: string; // Arweave transaction or simulated bundle ID
  paletteId?: string;
  paletteColors?: Record<string, string>;
}

export interface ApprovedPalette {
  id: string;
  name: string;
  subtitle: string;
  brandColors: string[]; // Primary brand slots
  accentColors: string[]; // Secondary decorative slots
  mappings: Record<string, string>; // CSS variable to hex
}

export interface VCDLocation {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  publicLabel: string;
  qrUrlPath: string;
  curatorNote: string;
}

export interface CampaignConfig {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  cap: {
    unit: string;
    maximum: number; // 480
    formula: string; // "4 × 2 × 3 × 4 × 5"
    paletteChangesCountAsNewCombination: boolean;
  };
  artwork: {
    workId: string;
    title: string;
    sourceSvg: {
      arweaveTxId: string;
      contentHash: string;
      version: string;
    };
    artist: string;
    rightsHolder: string;
    generatorVersion: string;
  };
  rights: {
    noticeText: string;
    termsUrl: string;
    licenceMetadataFormat: string;
  };
}

export interface ClaimReceipt {
  editionNumber: number; // e.g. 87
  totalEditions: number; // 480
  combinationRecord: CombinationRecord;
  location: VCDLocation;
  palette: ApprovedPalette;
  customColors: Record<string, string>;
  arweaveTxId: string;
  contentHash: string;
  timestamp: string;
  archivalStatus: 'confirmed_permaweb' | 'local_cryptographic_anchor';
  certificateId: string;
}
