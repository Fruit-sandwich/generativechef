import React, { useState, useEffect } from 'react';
import { ClaimReceipt, CampaignConfig } from '../types/campaign';
import { buildRenderedSvg, exportHighResPng, downloadSvgFile, downloadJsonFile } from '../utils/svgRenderer';
import QRCode from 'qrcode';
import {
  Download,
  ExternalLink,
  ShieldCheck,
  FileCode,
  FileImage,
  Award,
  X,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';

interface ClaimedSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: ClaimReceipt;
  campaign: CampaignConfig;
  onOpenCertificate: () => void;
}

export const ClaimedSuccessModal: React.FC<ClaimedSuccessModalProps> = ({
  isOpen,
  onClose,
  receipt,
  campaign,
  onOpenCertificate,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);

  const renderedSvg = buildRenderedSvg(
    receipt.combinationRecord.traits,
    receipt.customColors,
    `VCD ${receipt.location.city.toUpperCase()} • EDITION #${receipt.editionNumber}/480`
  );

  const explorerUrl = `https://viewblock.io/arweave/tx/${receipt.arweaveTxId}`;

  useEffect(() => {
    if (receipt.arweaveTxId) {
      QRCode.toDataURL(explorerUrl, { width: 140, margin: 1, color: { dark: '#1c1917', light: '#ffffff' } })
        .then(setQrCodeDataUrl)
        .catch((e) => console.error('QR code generation failed:', e));
    }
  }, [receipt.arweaveTxId, explorerUrl]);

  if (!isOpen) return null;

  const handleCopyTx = () => {
    navigator.clipboard.writeText(receipt.arweaveTxId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    downloadSvgFile(
      renderedSvg,
      `VCD_TheGenerativeChef_Edition_${receipt.editionNumber}_${receipt.location.city}.svg`
    );
  };

  const handleExportPng = async () => {
    setIsExportingPng(true);
    try {
      await exportHighResPng(
        renderedSvg,
        `VCD_TheGenerativeChef_Edition_${receipt.editionNumber}_HighRes_2100x2970.png`
      );
    } catch (err) {
      console.error('PNG export failed:', err);
      alert('PNG rendering encountered an issue: ' + (err as Error).message);
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleDownloadManifest = () => {
    downloadJsonFile(
      {
        campaign: {
          id: campaign.id,
          title: campaign.title,
          location: receipt.location,
        },
        collectible: {
          editionNumber: receipt.editionNumber,
          totalCap: receipt.totalEditions,
          canonicalCombinationId: receipt.combinationRecord.canonicalId,
          traits: receipt.combinationRecord.traits,
          palette: receipt.palette.name,
          colorAssignments: receipt.customColors,
        },
        provenance: {
          arweaveTxId: receipt.arweaveTxId,
          contentHash: receipt.contentHash,
          sourceSvgTxId: campaign.artwork.sourceSvg.arweaveTxId,
          sourceSvgHash: campaign.artwork.sourceSvg.contentHash,
          artist: campaign.artwork.artist,
          rightsHolder: campaign.artwork.rightsHolder,
          certificateId: receipt.certificateId,
          timestamp: receipt.timestamp,
        },
        rights: {
          statement: campaign.rights.noticeText,
          licence: campaign.rights.licenceMetadataFormat,
        },
      },
      `VCD_Provenance_Manifest_Edition_${receipt.editionNumber}.json`
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white border border-stone-200 rounded-lg max-w-2xl w-full p-6 sm:p-8 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Badge */}
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-emerald-800 font-sans font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Permanent Digital Encounter Anchored</span>
        </div>

        <div className="mt-2 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <h2 className="text-2xl sm:text-3xl font-editorial font-medium text-stone-900">
            Edition #{receipt.editionNumber} of {receipt.totalEditions}
          </h2>
          <span className="text-xs text-stone-500 font-sans">
            {receipt.location.publicLabel}
          </span>
        </div>

        {/* Main Content Grid: Artwork Preview + Provenance Details */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
          {/* Artwork Thumbnail */}
          <div className="sm:col-span-5 bg-stone-50 border border-stone-200 rounded-md p-4 flex flex-col items-center justify-center">
            <div
              className="w-full max-w-[190px] aspect-[210/297] flex items-center justify-center shadow-xs"
              dangerouslySetInnerHTML={{ __html: renderedSvg }}
            />
            <div className="mt-3 text-[11px] text-stone-500 font-mono text-center">
              Trait #{receipt.editionNumber} · {receipt.palette.name}
            </div>
          </div>

          {/* Provenance Record Meta */}
          <div className="sm:col-span-7 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-stone-500 block">Arweave Transaction ID</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <code className="font-mono text-[11px] text-stone-800 bg-stone-100 p-1.5 rounded flex-1 truncate">
                    {receipt.arweaveTxId}
                  </code>
                  <button
                    onClick={handleCopyTx}
                    className="p-1.5 text-stone-500 hover:text-stone-800 rounded border border-stone-200 transition-colors shrink-0"
                    title="Copy Transaction ID"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-stone-500 block">Master Source SVG Anchor</span>
                <code className="font-mono text-[11px] text-stone-700 bg-stone-50 p-1 rounded block truncate">
                  ar://{campaign.artwork.sourceSvg.arweaveTxId}
                </code>
              </div>

              <div>
                <span className="text-stone-500 block">Canonical Trait ID</span>
                <code className="font-mono text-[10px] text-stone-600 bg-stone-50 p-1 rounded block truncate">
                  {receipt.combinationRecord.canonicalId}
                </code>
              </div>

              <div className="pt-2 flex items-center gap-3">
                {qrCodeDataUrl && (
                  <img
                    src={qrCodeDataUrl}
                    alt="Encounter Verification QR"
                    className="w-16 h-16 border border-stone-200 rounded p-1 bg-white shrink-0"
                  />
                )}
                <div className="text-[11px] text-stone-500 leading-tight">
                  <span className="font-semibold text-stone-800 block">Scan to View Record</span>
                  Scan on mobile or share to inspect permanent ANS-105 provenance bundle.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Downloads & Certificate Button */}
        <div className="mt-8 pt-5 border-t border-stone-200 flex flex-wrap gap-2.5 justify-between items-center">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportPng}
              disabled={isExportingPng}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 transition-colors shadow-2xs"
            >
              <FileImage className="w-3.5 h-3.5 text-stone-600" />
              <span>{isExportingPng ? 'Rendering PNG...' : 'High-Res PNG (2100×2970)'}</span>
            </button>

            <button
              onClick={handleDownloadSvg}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span>Print SVG</span>
            </button>

            <button
              onClick={handleDownloadManifest}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 transition-colors shadow-2xs"
            >
              <FileCode className="w-3.5 h-3.5 text-stone-600" />
              <span>JSON Manifest</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCertificate}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-stone-900 rounded-md hover:bg-stone-800 transition-colors shadow-xs"
            >
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>View Certificate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
