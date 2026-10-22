import React from 'react';
import { VCDLocation } from '../types/campaign';
import { MapPin, QrCode } from 'lucide-react';

interface NavbarProps {
  currentTab: 'studio' | 'registry' | 'licence';
  setCurrentTab: (tab: 'studio' | 'registry' | 'licence') => void;
  currentLocation: VCDLocation;
  locations: VCDLocation[];
  onSelectLocation: (loc: VCDLocation) => void;
  onOpenQrModal: () => void;
  claimedReceiptCount: number;
  onOpenLatestClaim?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentLocation,
  locations,
  onSelectLocation,
  onOpenQrModal,
  claimedReceiptCount,
  onOpenLatestClaim,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#faf9f5]/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentTab('studio')}
            className="text-xl font-editorial font-medium tracking-tight text-stone-900 hover:text-stone-700 transition-colors text-left"
          >
            Virtue Classic Dish
          </button>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
          <button
            onClick={() => setCurrentTab('studio')}
            className={`transition-colors hover:text-stone-900 py-1 ${
              currentTab === 'studio'
                ? 'text-stone-900 border-b-2 border-stone-900 font-semibold'
                : 'text-stone-600'
            }`}
          >
            Art Generator
          </button>
          <button
            onClick={() => setCurrentTab('registry')}
            className={`transition-colors hover:text-stone-900 py-1 ${
              currentTab === 'registry'
                ? 'text-stone-900 border-b-2 border-stone-900 font-semibold'
                : 'text-stone-600'
            }`}
          >
            Registry (480)
          </button>
          <button
            onClick={() => setCurrentTab('licence')}
            className={`transition-colors hover:text-stone-900 py-1 ${
              currentTab === 'licence'
                ? 'text-stone-900 border-b-2 border-stone-900 font-semibold'
                : 'text-stone-600'
            }`}
          >
            Rights & Licence
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          {/* Location Picker */}
          <div className="relative group">
            <select
              aria-label="Select location"
              value={currentLocation.id}
              onChange={(e) => {
                const found = locations.find((l) => l.id === e.target.value);
                if (found) onSelectLocation(found);
              }}
              className="text-xs font-medium bg-white text-stone-800 border border-stone-300 rounded-md py-1.5 pl-3 pr-8 shadow-xs cursor-pointer hover:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-500"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.city} ({loc.name.replace('Virtue Classic Dish • ', '')})
                </option>
              ))}
            </select>
          </div>

          {/* Table QR Button */}
          <button
            onClick={onOpenQrModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-200 rounded-md hover:bg-stone-50 transition-colors shadow-xs"
            title="Display table QR code for on-site visitors"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">On-Site QR</span>
          </button>

          {/* Latest Claim trigger if available */}
          {claimedReceiptCount > 0 && onOpenLatestClaim && (
            <button
              onClick={onOpenLatestClaim}
              className="px-3 py-1.5 text-xs font-medium text-white bg-stone-900 rounded-md hover:bg-stone-800 transition-colors shadow-xs"
            >
              My Edition
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
