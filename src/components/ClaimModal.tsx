import React, { useState } from 'react';
import {
  CombinationRecord,
  TraitSelection,
  VCDLocation,
  ApprovedPalette,
  ClaimReceipt,
  CampaignConfig
} from '../types/campaign';
import { buildCleanIndividualChefSvg, exportHighResPng } from '../utils/svgRenderer';
import { archiveToPermaweb } from '../services/arweaveArchive';
import { Shield, CheckSquare, Square, Loader2, AlertCircle, Sparkles, X } from 'lucide-react';

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  combination: CombinationRecord;
  traits: TraitSelection;
  location: VCDLocation;
  palette: ApprovedPalette;
  customColors: Record<string, string>;
  campaign: CampaignConfig;
  onClaimSuccess: (receipt: ClaimReceipt) => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  isOpen,
  onClose,
  combination,
  traits,
  location,
  palette,
  customColors,
  campaign,
  onClaimSuccess,
}) => {
  const [agreedPersonal, setAgreedPersonal] = useState(false);
  const [agreedCopyright, setAgreedCopyright] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');

  if (!isOpen) return null;

  const canProceed = agreedPersonal && agreedCopyright && agreedTerms && !isProcessing;

  const handleClaim = async () => {
    if (!canProceed) return;
    setIsProcessing(true);

    try {
      setCurrentStep('Compiling standalone clean individual SVG...');
      await new Promise((r) => setTimeout(r, 400));
      const individualSvg = buildCleanIndividualChefSvg(
        traits,
        customColors,
        `VCD ${location.city.toUpperCase()} • EDITION #${combination.index + 1}/480 • CC0 PUBLIC DOMAIN`
      );

      setCurrentStep('Computing cryptographic SHA-256 integrity hash...');
      await new Promise((r) => setTimeout(r, 400));

      setCurrentStep('Syncing individual Chef SVG to Arweave Turbo...');
      const archivalResult = await archiveToPermaweb({
        individualSvg,
        combination,
        traits,
        location,
        palette,
        customColors,
        campaignId: campaign.id,
      });

      setCurrentStep('Issuing official Certificate of Location Encounter...');
      await new Promise((r) => setTimeout(r, 300));

      const receipt: ClaimReceipt = {
        editionNumber: combination.index + 1,
        totalEditions: 480,
        combinationRecord: {
          ...combination,
          state: 'issued',
          claimedAt: Date.now(),
          locationId: location.id,
          txId: archivalResult.txId,
          paletteId: palette.id,
          paletteColors: customColors,
        },
        location,
        palette,
        customColors,
        arweaveTxId: archivalResult.txId,
        contentHash: archivalResult.svgHash,
        timestamp: new Date().toISOString(),
        archivalStatus: archivalResult.status,
        certificateId: `VCD-CERT-${location.city.toUpperCase().slice(0, 3)}-${combination.index + 1}-${Date.now().toString(36).toUpperCase()}`,
      };

      setIsProcessing(false);
      onClaimSuccess(receipt);
    } catch (err) {
      console.error('Claim failed:', err);
      setIsProcessing(false);
      alert('Encounter archival could not be completed: ' + (err as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white border border-stone-200 rounded-lg max-w-xl w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 disabled:opacity-30 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 text-xs uppercase tracking-widest text-amber-700 font-sans font-semibold">
          <Shield className="w-4 h-4" />
          <span>Permanent Digital Encounter Claim</span>
        </div>

        <h2 className="text-2xl font-editorial font-medium text-stone-900 mt-2">
          Claim Edition #{combination.index + 1} of 480
        </h2>

        <p className="text-xs text-stone-500 mt-1">
          Lock this unique trait combination into the Virtue Classic Dish location registry.
        </p>

        {/* Accession Brief */}
        <div className="my-5 p-4 bg-stone-50 border border-stone-200 rounded-md text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-stone-500">Location Encounter</span>
            <span className="font-semibold text-stone-800">{location.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Artist & Estate</span>
            <span className="font-semibold text-stone-800">{campaign.artwork.artist}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Trait Combination</span>
            <span className="font-mono text-stone-700 font-medium truncate max-w-[280px]">
              {combination.canonicalId}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Selected Palette</span>
            <span className="font-semibold text-stone-800">{palette.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Permanent Archive</span>
            <span className="text-stone-700">Arweave Permaweb (ANS-105 Bundle)</span>
          </div>
        </div>

        {/* Rights Notice Callout */}
        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-md text-xs text-amber-950 leading-relaxed mb-5">
          <span className="font-semibold block mb-1">Notice of Permitted Use:</span>
          {campaign.rights.noticeText}
        </div>

        {/* Explicit Checkboxes for Legal & Licensing Principles */}
        <div className="space-y-3 mb-6">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-700 select-none">
            <button
              type="button"
              onClick={() => setAgreedPersonal(!agreedPersonal)}
              disabled={isProcessing}
              className="mt-0.5 text-stone-800 hover:text-stone-950 shrink-0"
            >
              {agreedPersonal ? (
                <CheckSquare className="w-4 h-4 text-stone-900" />
              ) : (
                <Square className="w-4 h-4 text-stone-400" />
              )}
            </button>
            <span>
              I accept this edition as a personal digital collectible record of my encounter at Virtue Classic Dish.
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-700 select-none">
            <button
              type="button"
              onClick={() => setAgreedCopyright(!agreedCopyright)}
              disabled={isProcessing}
              className="mt-0.5 text-stone-800 hover:text-stone-950 shrink-0"
            >
              {agreedCopyright ? (
                <CheckSquare className="w-4 h-4 text-stone-900" />
              ) : (
                <Square className="w-4 h-4 text-stone-400" />
              )}
            </button>
            <span>
              I understand that copyright and commercial reproduction rights remain exclusively with the artist and rights-holder.
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-700 select-none">
            <button
              type="button"
              onClick={() => setAgreedTerms(!agreedTerms)}
              disabled={isProcessing}
              className="mt-0.5 text-stone-800 hover:text-stone-950 shrink-0"
            >
              {agreedTerms ? (
                <CheckSquare className="w-4 h-4 text-stone-900" />
              ) : (
                <Square className="w-4 h-4 text-stone-400" />
              )}
            </button>
            <span>
              I accept the Universal Data License terms and consent to permanent state publication on Arweave.
            </span>
          </label>
        </div>

        {/* Processing State Indicator */}
        {isProcessing && (
          <div className="mb-4 p-3 bg-stone-100 rounded-md flex items-center gap-3 text-xs text-stone-700">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
            <span className="font-medium animate-pulse">{currentStep}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 disabled:opacity-30 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleClaim}
            disabled={!canProceed}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-40 rounded-md transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Confirm & Anchor Permanently</span>
          </button>
        </div>
      </div>
    </div>
  );
};
