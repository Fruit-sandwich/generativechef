import React, { useState, useEffect } from 'react';
import { VCDLocation, CampaignConfig } from '../types/campaign';
import QRCode from 'qrcode';
import { QrCode, Printer, X, MapPin, Sparkles } from 'lucide-react';

interface OnSiteQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: VCDLocation[];
  currentLocation: VCDLocation;
  onSelectLocation: (loc: VCDLocation) => void;
  campaign: CampaignConfig;
}

export const OnSiteQRModal: React.FC<OnSiteQRModalProps> = ({
  isOpen,
  onClose,
  locations,
  currentLocation,
  onSelectLocation,
  campaign,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [qrImage, setQrImage] = useState<string>('');

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vcd.art';
    const targetUrl = `${origin}?loc=${currentLocation.id}`;
    setQrUrl(targetUrl);

    QRCode.toDataURL(targetUrl, {
      width: 240,
      margin: 1,
      color: { dark: '#1c1917', light: '#ffffff' },
    })
      .then(setQrImage)
      .catch((err) => console.error('Failed to generate table QR:', err));
  }, [currentLocation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-white border border-stone-200 rounded-lg max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:max-w-none">
        {/* Controls Bar (Hidden in print) */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200 print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600">
            <QrCode className="w-4 h-4 text-stone-800" />
            <span>On-Site Location Table Card</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Table Card</span>
            </button>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Location Display (Hidden in print) */}
        {locations.length > 1 ? (
          <div className="mb-4 print:hidden">
            <label className="text-xs text-stone-500 block mb-1">Select Active Restaurant Venue</label>
            <select
              value={currentLocation.id}
              onChange={(e) => {
                const loc = locations.find((l) => l.id === e.target.value);
                if (loc) onSelectLocation(loc);
              }}
              className="w-full text-xs bg-stone-50 border border-stone-300 rounded-md p-2 text-stone-800"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} — {loc.address}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="mb-3 print:hidden text-xs text-stone-600 bg-stone-50 border border-stone-200 rounded p-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-stone-500" />
            <span className="font-medium text-stone-800">{currentLocation.name}</span>
            <span className="text-stone-400">·</span>
            <span>{currentLocation.city}, {currentLocation.country}</span>
          </div>
        )}

        {/* Printable Table Card Frame */}
        <div className="bg-[#faf8f2] border-2 border-stone-300 rounded-md p-6 sm:p-8 text-center flex flex-col items-center">
          <div className="text-[10px] uppercase tracking-widest text-stone-500 font-sans">
            Virtue Classic Dish · On-Site Encounter
          </div>

          <h3 className="text-2xl font-editorial font-medium text-stone-900 mt-2">
            The Generative Chef
          </h3>

          <p className="text-xs text-stone-600 mt-1 max-w-xs font-serif italic">
            Scan with your mobile camera at your table to generate an approved personal edition.
          </p>

          <div className="my-6 p-3 bg-white border border-stone-300 rounded-lg shadow-2xs">
            {qrImage ? (
              <img src={qrImage} alt="Table QR Code" className="w-48 h-48 block" />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-xs text-stone-400">
                Generating QR...
              </div>
            )}
          </div>

          <div className="text-xs font-semibold text-stone-800 flex items-center justify-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-stone-500" />
            <span>{currentLocation.publicLabel}</span>
          </div>

          <div className="text-[11px] text-stone-500 mt-0.5">
            {currentLocation.address}
          </div>

          <div className="mt-4 pt-4 border-t border-stone-200 text-[10px] text-stone-400 max-w-xs font-sans leading-tight">
            Original artwork by Rashid & Studio VCD. Limited to 480 unique trait combinations. Commercial reproduction rights remain with the rights-holder.
          </div>
        </div>
      </div>
    </div>
  );
};
