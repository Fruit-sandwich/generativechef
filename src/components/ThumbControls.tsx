import React from 'react';
import { Sparkles, Palette, Stamp } from 'lucide-react';

interface ThumbControlsProps {
  onRoll: () => void;
  onCyclePalette: () => void;
  onStamp: () => void;
  isRolling: boolean;
  isStamping: boolean;
  currentPaletteName: string;
}

export const ThumbControls: React.FC<ThumbControlsProps> = ({
  onRoll,
  onCyclePalette,
  onStamp,
  isRolling,
  isStamping,
  currentPaletteName,
}) => {
  return (
    <aside
      className="fixed bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2 sm:gap-3 select-none"
      aria-label="Thumb Controls"
    >
      {/* 1. Cycle Palette Button */}
      <button
        onClick={onCyclePalette}
        title={`Cycle Approved Palette (${currentPaletteName}) · Press P`}
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 backdrop-blur-md border border-stone-200 text-stone-800 flex items-center justify-center hover:scale-108 active:scale-95 transition-all shadow-md cursor-pointer hover:border-stone-400 group shrink-0"
      >
        <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-stone-700 group-hover:rotate-12 transition-transform duration-200" />
      </button>

      {/* 2. Stamp Edition & Download Button */}
      <button
        onClick={onStamp}
        disabled={isStamping}
        title="Stamp Edition to Arweave & Download Vector SVG + High-Res PNG (D)"
        className={`h-11 sm:h-12 px-3.5 sm:px-4 rounded-full bg-white/95 backdrop-blur-md border text-stone-900 flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-60 shrink-0 ${
          isStamping
            ? 'border-amber-400 bg-amber-50/90 text-amber-900'
            : 'border-stone-200 hover:border-stone-400 hover:scale-105 active:scale-95'
        }`}
      >
        {isStamping ? (
          <>
            <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin shrink-0" />
            <span className="text-xs font-semibold tracking-wide hidden sm:inline whitespace-nowrap">
              Stamping...
            </span>
          </>
        ) : (
          <>
            <Stamp className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700 shrink-0" />
            <span className="text-xs font-semibold tracking-wide hidden xs:inline sm:inline whitespace-nowrap">
              Stamp
            </span>
          </>
        )}
      </button>

      {/* 3. Primary Prominent 'Roll Permutation' Button */}
      <button
        onClick={onRoll}
        disabled={isRolling}
        title="Roll New Permutation · Tap / Spacebar / R"
        className="h-12 sm:h-14 px-4 sm:px-5 rounded-full bg-stone-900 text-white flex items-center gap-2 sm:gap-2.5 hover:scale-105 active:scale-95 transition-all shadow-xl hover:bg-stone-800 cursor-pointer disabled:opacity-50 ring-2 ring-stone-900/10 shrink-0"
      >
        <Sparkles
          className={`w-4 h-4 sm:w-5 sm:h-5 text-amber-300 transition-transform duration-500 ${
            isRolling ? 'rotate-180 scale-75' : 'group-hover:rotate-45'
          }`}
        />
        <span className="text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap">
          Roll Permutation
        </span>
      </button>
    </aside>
  );
};
