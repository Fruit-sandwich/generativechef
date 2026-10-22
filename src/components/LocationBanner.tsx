import React from 'react';
import { VCDLocation, CampaignConfig } from '../types/campaign';
import { MapPin, ShieldCheck, Clock } from 'lucide-react';

interface LocationBannerProps {
  location: VCDLocation;
  campaign: CampaignConfig;
  issuedCount: number;
  reservedCount: number;
  availableCount: number;
}

export const LocationBanner: React.FC<LocationBannerProps> = ({
  location,
  campaign,
  issuedCount,
  reservedCount,
  availableCount,
}) => {
  return (
    <section className="border-b border-stone-200 bg-[#f7f5ef] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Curatorial Header Lead */}
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-stone-500 font-sans">
          <span>Campaign {campaign.id}</span>
          <span aria-hidden="true">·</span>
          <span>{location.publicLabel}</span>
          <span aria-hidden="true">·</span>
          <span>2026 Program</span>
        </div>

        {/* Display Title & Artist Attribution */}
        <div className="mt-2 flex flex-col md:flex-row md:items-baseline md:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-editorial font-medium text-stone-900 tracking-tight">
              The Generative Chef
            </h1>
            <p className="mt-1 text-sm text-stone-600 max-w-2xl">
              Original vector artwork by <span className="font-semibold text-stone-800">{campaign.artwork.artist}</span>.
              Presented with permission at {location.name}.
            </p>
          </div>

          {/* Operational Metrics (No Pills - Unboxed text with typographic separators) */}
          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs sm:text-sm text-stone-600 font-sans border-t md:border-t-0 md:border-l border-stone-200 pt-3 md:pt-0 md:pl-6 shrink-0">
            <div>
              <span className="font-mono font-semibold text-stone-900 tabular-nums">{issuedCount}</span>
              <span className="text-stone-500"> / 480 Claimed</span>
            </div>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <div>
              <span className="font-mono font-semibold text-amber-700 tabular-nums">{reservedCount}</span>
              <span className="text-stone-500"> Reserved</span>
            </div>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <div>
              <span className="font-mono font-semibold text-emerald-700 tabular-nums">{availableCount}</span>
              <span className="text-stone-500"> Available</span>
            </div>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <div className="flex items-center gap-1 text-stone-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span>Active</span>
            </div>
          </div>
        </div>

        {/* Curator location note */}
        <div className="mt-3 text-xs text-stone-500 flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span>{location.address}</span>
          <span aria-hidden="true">·</span>
          <span className="italic">{location.curatorNote}</span>
        </div>
      </div>
    </section>
  );
};
