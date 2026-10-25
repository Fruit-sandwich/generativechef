import React, { useState } from 'react';
import { CombinationRecord, VCDLocation, ApprovedPalette, CampaignConfig } from '../types/campaign';
import { downloadSvgFile, downloadJsonFile, exportHighResPng } from '../utils/svgRenderer';
import { X, Copy, Check, Download, ExternalLink, Globe, Stamp, ShieldCheck } from 'lucide-react';

interface CuratorialDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentCombination: CombinationRecord;
  renderedSvg: string;
  location: VCDLocation;
  palette: ApprovedPalette;
  customColors: Record<string, string>;
  campaign: CampaignConfig;
  onOpenRegistry: () => void;
  onStamp?: () => void;
  isStamping?: boolean;
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
  onOpenRegistry,
  onStamp,
  isStamping = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);

  if (!isOpen) return null;

  const handleCopyCanonical = () => {
    navigator.clipboard.writeText(currentCombination.canonicalId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyTx = () => {
    if (currentCombination.txId) {
      navigator.clipboard.writeText(currentCombination.txId);
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    }
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
        arweaveTxId: currentCombination.txId || null,
        storageFormat: currentCombination.storageFormat || 'standalone-svg',
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

        {/* Provenance & Stamped Arweave Permaweb Badge */}
        {currentCombination.txId ? (
          <div className="mt-4 p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg text-xs">
            <div className="flex items-center justify-between text-amber-900 font-medium mb-1.5">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Stamped to Arweave Permaweb</span>
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 bg-amber-100/80 rounded text-amber-800">
                {currentCombination.storageFormat === 'trait-json'
                  ? 'Trait JSON (~1.2 KiB)'
                  : currentCombination.storageFormat === 'offline-sha256'
                  ? 'Offline SHA-256 Anchor'
                  : 'Standalone SVG'}
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] text-stone-700 bg-white/80 p-2 rounded border border-amber-200/60 break-all select-all">
              <span className="truncate pr-2">{currentCombination.txId}</span>
              <button
                onClick={handleCopyTx}
                className="shrink-0 flex items-center gap-1 text-stone-500 hover:text-stone-900 cursor-pointer"
              >
                {copiedTx ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span className="text-[10px]">{copiedTx ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="flex items-center gap-4 mt-2 text-[11px]">
              <a
                href={`https://arweave.net/${currentCombination.txId}`}
                target="_blank"
                rel="noreferrer"
                className="text-amber-800 hover:text-amber-950 font-medium underline flex items-center gap-1"
              >
                <span>Open Gateway (arweave.net)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={`https://viewblock.io/arweave/tx/${currentCombination.txId}`}
                target="_blank"
                rel="noreferrer"
                className="text-stone-600 hover:text-stone-900 underline flex items-center gap-1"
              >
                <span>ViewBlock Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ) : (
          onStamp && (
            <div className="mt-4 p-3 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-between text-xs">
              <div>
                <span className="font-medium text-stone-900 block">Not Yet Stamped</span>
                <span className="text-[11px] text-stone-500">
                  Stamp to Arweave permaweb under Turbo free tier (&lt;100 KiB)
                </span>
              </div>
              <button
                onClick={onStamp}
                disabled={isStamping}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white rounded-md text-xs font-medium hover:bg-stone-800 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isStamping ? (
                  <>
                    <span className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    <span>Stamping...</span>
                  </>
                ) : (
                  <>
                    <Stamp className="w-3.5 h-3.5 text-amber-300" />
                    <span>Stamp Edition</span>
                  </>
                )}
              </button>
            </div>
          )
        )}

        {/* Public Domain Dedication Statement */}
        <div className="mt-4 p-4 bg-[#fbf9f5] border border-stone-200/80 rounded-lg text-xs leading-relaxed text-stone-700 font-serif">
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
        <div className="mt-4 space-y-2 text-xs">
          <div className="flex items-center justify-between text-stone-600">
            <span>Canonical Trait Permutation</span>
            <button
              onClick={handleCopyCanonical}
              className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
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
                onOpenRegistry();
              }}
              className="text-xs text-stone-600 hover:text-stone-900 underline transition-colors cursor-pointer font-medium"
            >
              480 Registry Matrix
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
