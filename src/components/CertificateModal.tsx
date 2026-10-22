import React, { useRef } from 'react';
import { ClaimReceipt, CampaignConfig } from '../types/campaign';
import { buildRenderedSvg } from '../utils/svgRenderer';
import { Printer, X, Shield, Award } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: ClaimReceipt;
  campaign: CampaignConfig;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  receipt,
  campaign,
}) => {
  const certRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const renderedSvg = buildRenderedSvg(
    receipt.combinationRecord.traits,
    receipt.customColors,
    `VCD • EDITION #${receipt.editionNumber}/480`
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-white border border-stone-200 rounded-lg max-w-2xl w-full p-4 sm:p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:max-w-none">
        {/* Action Header (Hidden in Print) */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200 print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600">
            <Award className="w-4 h-4 text-amber-700" />
            <span>Certificate of Encounter & Digital Provenance</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </button>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 p-1 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Archival Certificate Paper Surface */}
        <div
          ref={certRef}
          className="bg-[#faf8f2] border-2 border-stone-300 p-6 sm:p-10 relative flex flex-col justify-between min-h-[580px]"
        >
          {/* Subtle Outer Frame Inset */}
          <div className="absolute inset-2 border border-stone-300 pointer-events-none" />

          {/* Certificate Header */}
          <div className="text-center relative z-10 pt-2">
            <div className="text-[11px] uppercase tracking-widest text-stone-500 font-sans">
              Virtue Classic Dish · Curatorial Provenance Registry
            </div>
            <h2 className="text-3xl sm:text-4xl font-editorial font-medium text-stone-900 mt-2 tracking-tight">
              Certificate of Encounter
            </h2>
            <div className="text-xs text-stone-600 font-serif italic mt-1">
              Location Edition Digital Collectible
            </div>
          </div>

          {/* Certificate Body */}
          <div className="my-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center relative z-10">
            <div className="sm:col-span-4 flex justify-center">
              <div
                className="w-32 aspect-[210/297] border border-stone-300 bg-white p-2 shadow-2xs"
                dangerouslySetInnerHTML={{ __html: renderedSvg }}
              />
            </div>

            <div className="sm:col-span-8 text-xs text-stone-700 leading-relaxed space-y-3 font-serif">
              <p>
                This certifies that a visitor has generated and anchored an approved variation of{' '}
                <span className="font-semibold text-stone-900 not-italic">The Generative Chef</span>{' '}
                (Original artwork by Rashid & Studio VCD) at the physical premises of{' '}
                <span className="font-semibold text-stone-900 not-italic">{receipt.location.name}</span>.
              </p>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-sans pt-2 border-t border-stone-200">
                <div>
                  <span className="text-stone-500 block">Edition Number</span>
                  <span className="font-mono font-bold text-stone-900">
                    #{receipt.editionNumber} of {receipt.totalEditions}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">Date of Encounter</span>
                  <span className="font-mono text-stone-800">
                    {new Date(receipt.timestamp).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="col-span-2 mt-1">
                  <span className="text-stone-500 block">Permanent Record (Arweave)</span>
                  <span className="font-mono text-[10px] text-stone-700 truncate block">
                    {receipt.arweaveTxId}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Legal Endorsement & Stamp */}
          <div className="pt-4 border-t border-stone-300 flex flex-col sm:flex-row justify-between items-end gap-4 text-[11px] relative z-10">
            <div className="max-w-xs text-stone-500 font-sans text-[10px] leading-tight">
              {campaign.rights.noticeText}
            </div>

            <div className="text-right font-sans">
              <div className="text-xs font-semibold text-stone-900 font-editorial">
                Virtue Classic Dish
              </div>
              <div className="text-[10px] text-stone-500">
                Studio VCD Provenance Registry · Utawala, Nairobi
              </div>
              <div className="font-mono text-[9px] text-stone-400 mt-1">
                {receipt.certificateId}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
