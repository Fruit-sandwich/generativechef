import React from 'react';
import { Sparkles, Palette, Download } from 'lucide-react';

interface ThumbControlsProps {
  onRoll: () => void;
  onCyclePalette: () => void;
  onExport: () => void;
  isRolling: boolean;
  isExporting: boolean;
  currentPaletteName: string;
}

export const ThumbControls: React.FC<ThumbControlsProps> = ({
  onRoll,
  onCyclePalette,
  onExport,
  isRolling,
  isExporting,
  currentPaletteName,
}) => {
  return (
    <aside
      className="fixed bottom-6 right-6 z-40 flex items-center gap-3 select-none"
      aria-label="Thumb Controls"
    >
      {/* 1. Cycle Palette Button */}
      <button
        onClick={onCyclePalette}
        title={`Cycle Approved Palette (${currentPaletteName}) · Press P`}
        className="w-12 h-12 rounded-full bg-white/95 backdrop-blur-md border border-stone-200 text-stone-800 flex items-center justify-center hover:scale-108 active:scale-95 transition-all shadow-md cursor-pointer hover:border-stone-400 group"
      >
        <Palette className="w-5 h-5 text-stone-700 group-hover:rotate-12 transition-transform duration-200" />
      </button>

      {/* 2. Export & Anchor Button */}
      <button
        onClick={onExport}
        disabled={isExporting}
        title="Export SVG, High-Res PNG & Anchor to Arweave (D)"
        className="w-12 h-12 rounded-full bg-white/95 backdrop-blur-md border border-stone-200 text-stone-900 flex items-center justify-center hover:scale-108 active:scale-95 transition-all shadow-md cursor-pointer hover:border-stone-400 disabled:opacity-50"
      >
        {isExporting ? (
          <span className="w-4 h-4 border-2 border-stone-400 border-t-stone-900 rounded-full animate-spin" />
        ) : (
          <Download className="w-5 h-5 text-stone-800" />
        )}
      </button>

      {/* 3. Primary Prominent 'Roll New Permutation' Button */}
      <button
        onClick={onRoll}
        disabled={isRolling}
        title="Roll New Permutation · Tap / Spacebar / R"
        className="h-14 px-5 rounded-full bg-stone-900 text-white flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-all shadow-xl hover:bg-stone-800 cursor-pointer disabled:opacity-50 ring-2 ring-stone-900/10"
      >
        <Sparkles
          className={`w-5 h-5 text-amber-300 transition-transform duration-500 ${
            isRolling ? 'rotate-180 scale-75' : 'group-hover:rotate-45'
          }`}
        />
        <span className="text-sm font-semibold tracking-wide whitespace-nowrap">
          Roll Permutation
        </span>
      </button>
    </aside>
  );
};
