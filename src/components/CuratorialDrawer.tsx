import React, { useState } from 'react';
import { CombinationRecord, VCDLocation, ApprovedPalette, CampaignConfig } from '../types/campaign';
import { downloadSvgFile, downloadJsonFile, exportHighResPng } from '../utils/svgRenderer';
import { X, Copy, Check, Download, ExternalLink, Globe, Sparkles, QrCode } from 'lucide-react';

interface CuratorialDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentCombination: CombinationRecord;
  renderedSvg: string;
  location: VCDLocation;
  palette: ApprovedPalette;
  customColors: Record<string, string>;
  campaign: CampaignConfig;
  onOpenQrModal: () => void;
  onOpenRegistry: () => void;
}

export const CuratorialDrawer: React.FC<CuratorialDrawerProps> = ({
  isOpen,
  onClose,
  currentCombination,
  renderedSvg,
  location,
  palette,
  customColors,
  campaign,
  onOpenQrModal,
  onOpenRegistry,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);

  if (!isOpen) return null;

  const handleCopyCanonical = () => {
    navigator.clipboard.writeText(currentCombination.canonicalId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    downloadSvgFile(
      renderedSvg,
      `VCD_Chef_Edition_${currentCombination.index + 1}_${location.city}.svg`
    );
  };

  const handleExportPng = async () => {
    setIsExportingPng(true);
    try {
      await exportHighResPng(
        renderedSvg,
        `VCD_Chef_Edition_${currentCombination.index + 1}_HighRes.png`
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleDownloadManifest = () => {
    downloadJsonFile(
      {
        work: 'The Generative Chef',
        edition: currentCombination.index + 1,
        totalCap: 480,
        canonicalId: currentCombination.canonicalId,
        traits: currentCombination.traits,
        location: location.publicLabel,
        artist: campaign.artwork.artist,
        license: 'Creative Commons Zero (CC0 1.0 Universal) Public Domain Dedication',
        timestamp: new Date().toISOString(),
        sourceSvgTx: campaign.artwork.sourceSvg.arweaveTxId,
        sourceSvgHash: campaign.artwork.sourceSvg.contentHash,
      },
      `VCD_Chef_${currentCombination.index + 1}_Manifest.json`
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-md border border-stone-200 rounded-xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-stone-500 font-sans">
          <Globe className="w-3.5 h-3.5 text-stone-700" />
          <span>Public Domain Release · Creative Commons CC0</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-editorial font-medium text-stone-900 mt-2">
          The Generative Chef
        </h2>
        <div className="text-xs text-stone-500 font-sans mt-0.5">
          Edition #{currentCombination.index + 1} of 480 · {location.publicLabel}
        </div>

        {/* Public Domain Dedication Statement */}
        <div className="mt-5 p-4 bg-[#fbf9f5] border border-stone-200/80 rounded-lg text-xs leading-relaxed text-stone-700 font-serif">
          <p>
            By mutual agreement of <strong className="text-stone-900 not-italic">Rashid & Studio VCD</strong> and{' '}
            <strong className="text-stone-900 not-italic">Virtue Classic Dish</strong>, all editions generated on-site or via this engine are permanently dedicated to the{' '}
            <strong className="text-stone-900 not-italic">Public Domain under Creative Commons CC0 1.0 Universal</strong>.
          </p>
          <p className="mt-2 text-stone-600">
            You are free to keep, display, print, adapt, remix, and share this edition for personal or commercial purposes without copyright restriction.
          </p>
        </div>

        {/* Trait breakdown & Canonical fingerprint */}
        <div className="mt-5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-stone-600">
            <span>Canonical Trait Permutation</span>
            <button
              onClick={handleCopyCanonical}
              className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-800 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <code className="block p-2.5 bg-stone-100 rounded-md text-[11px] font-mono text-stone-800 break-all select-all">
            {currentCombination.canonicalId}
          </code>
        </div>

        {/* Actions */}
        <div className="mt-6 pt-5 border-t border-stone-200 flex flex-wrap gap-2.5 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportPng}
              disabled={isExportingPng}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingPng ? 'Rendering...' : 'High-Res PNG'}</span>
            </button>
            <button
              onClick={handleDownloadSvg}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print SVG</span>
            </button>
            <button
              onClick={handleDownloadManifest}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Manifest JSON</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onOpenQrModal();
              }}
              className="flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Table QR</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenRegistry();
              }}
              className="text-xs text-stone-600 hover:text-stone-900 underline transition-colors"
            >
              480 Registry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
