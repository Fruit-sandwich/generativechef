import React from 'react';
import { CampaignConfig } from '../types/campaign';
import { ShieldCheck, FileText, CheckCircle2, XCircle, Info, ExternalLink, Scale, X } from 'lucide-react';

interface LicenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: CampaignConfig;
}

export const LicenceModal: React.FC<LicenceModalProps> = ({
  isOpen,
  onClose,
  campaign,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white border border-stone-200 rounded-lg max-w-3xl w-full p-6 sm:p-10 shadow-xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-stone-400 hover:text-stone-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-stone-500 font-sans">
          <Scale className="w-4 h-4 text-stone-700" />
          <span>Curatorial & Rights Constitution</span>
        </div>

        <h2 className="text-3xl font-editorial font-medium text-stone-900 mt-2">
          Rights, Licensing & Archival Terms
        </h2>

        <p className="text-xs text-stone-600 mt-1 max-w-xl font-serif italic">
          Clear, plain-language boundaries governing on-site encounters, digital collectibles, and artistic rights.
        </p>

        {/* Core Principle Box */}
        <div className="my-6 p-5 bg-[#faf8f2] border-l-4 border-amber-600 rounded-r-md">
          <div className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
            The Governing Principle
          </div>
          <p className="mt-1 text-sm text-stone-800 font-serif leading-relaxed">
            "The original artwork remains with its rights-holder. The visitor receives a personal collectible, not ownership of the underlying artwork or commercial reproduction rights."
          </p>
        </div>

        {/* Two-Column Permissions Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 text-xs">
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-md space-y-3">
            <div className="font-semibold text-emerald-900 flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Visitor Permissions (Granted)</span>
            </div>
            <ul className="space-y-2 text-emerald-950">
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">✓</span>
                <span>May retain, download, and display your generated edition for personal, non-commercial enjoyment.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">✓</span>
                <span>May share a digital image or public link of your collectible with attribution to the artist and restaurant.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">✓</span>
                <span>Receive permanent digital provenance registered on the Arweave Permaweb with cryptographic proof.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-md space-y-3">
            <div className="font-semibold text-rose-900 flex items-center gap-1.5 text-sm">
              <XCircle className="w-4 h-4 text-rose-700" />
              <span>Restricted Rights (Reserved)</span>
            </div>
            <ul className="space-y-2 text-rose-950">
              <li className="flex items-start gap-2">
                <span className="text-rose-700 font-bold">✗</span>
                <span>May NOT sell, license, merchandise, or commercially reproduce the artwork in any medium.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-700 font-bold">✗</span>
                <span>Does NOT acquire copyright, intellectual property, or exclusive rights to the underlying vector characters.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-700 font-bold">✗</span>
                <span>May not mint unauthorized derivative secondary tokens representing the primary artwork.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Technical & Archival Architecture */}
        <div className="border-t border-stone-200 pt-6 space-y-4 text-xs text-stone-700">
          <h3 className="text-base font-semibold text-stone-900 font-editorial">
            Permanent Archival vs. Speculative Tokens
          </h3>
          <p className="leading-relaxed">
            Uploading JSON and SVG data to Arweave creates an immutable, permanent record; it is not automatically a speculative NFT. Virtue Classic Dish uses the Arweave Permaweb to establish durable historical records of genuine restaurant encounters without unnecessary gas speculation, private keys, or friction.
          </p>

          <h3 className="text-base font-semibold text-stone-900 font-editorial pt-2">
            The 480 Uniqueness Cap
          </h3>
          <p className="leading-relaxed">
            The campaign is strictly bounded by mathematical trait permutations (4 left hands × 2 heads × 3 aprons × 4 right hands × 5 adornments = 480 variations). Virtue Classic Dish operates the shared uniqueness registry. While Arweave is an append-only archive, the VCD registry enforces that only one visitor may reserve and claim each canonical combination.
          </p>

          <div className="p-3 bg-stone-100 rounded-md font-mono text-[11px] text-stone-600">
            Source SVG: ar://{campaign.artwork.sourceSvg.arweaveTxId}
            <br />
            Content Hash: {campaign.artwork.sourceSvg.contentHash}
            <br />
            Licence Standard: Universal Data License (UDL-1.0) / ANS-105
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-md transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
