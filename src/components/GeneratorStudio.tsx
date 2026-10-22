import React, { useState, useEffect, useRef } from 'react';
import {
  CombinationRecord,
  TraitSelection,
  ApprovedPalette,
  VCDLocation,
  CampaignConfig
} from '../types/campaign';
import { buildRenderedSvg } from '../utils/svgRenderer';
import { Sparkles, Clock, Shield, RefreshCw, Palette, Check, Info } from 'lucide-react';

interface GeneratorStudioProps {
  currentCombination: CombinationRecord | null;
  traits: TraitSelection;
  palettes: ApprovedPalette[];
  currentPalette: ApprovedPalette;
  customColors: Record<string, string>;
  onSelectPalette: (palette: ApprovedPalette) => void;
  onUpdateColor: (varName: string, color: string) => void;
  onRollNewVariation: () => void;
  onReleaseReservation: () => void;
  onInitiateClaim: () => void;
  location: VCDLocation;
  campaign: CampaignConfig;
  availableCount: number;
}

export const GeneratorStudio: React.FC<GeneratorStudioProps> = ({
  currentCombination,
  traits,
  palettes,
  currentPalette,
  customColors,
  onSelectPalette,
  onUpdateColor,
  onRollNewVariation,
  onReleaseReservation,
  onInitiateClaim,
  location,
  campaign,
  availableCount,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);
  const [isRolling, setIsRolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active rendered SVG string
  const renderedSvg = buildRenderedSvg(
    traits,
    customColors,
    currentCombination ? `VCD ${location.city.toUpperCase()} • EDITION #${currentCombination.index + 1}/480` : undefined
  );

  // 15-minute countdown timer logic for current reservation
  useEffect(() => {
    if (!currentCombination || currentCombination.state !== 'reserved' || !currentCombination.reservedUntil) {
      setSecondsRemaining(15 * 60);
      return;
    }

    const updateTimer = () => {
      const remainingMs = currentCombination.reservedUntil! - Date.now();
      const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));
      setSecondsRemaining(remainingSec);
      if (remainingSec <= 0) {
        onReleaseReservation();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [currentCombination, onReleaseReservation]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRoll = () => {
    setIsRolling(true);
    onRollNewVariation();
    setTimeout(() => setIsRolling(false), 300);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Canvas Artwork Frame */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full bg-white border border-stone-200 rounded-lg p-4 sm:p-8 shadow-xs relative flex flex-col items-center justify-center min-h-[500px] sm:min-h-[580px]">
            {/* Reservation Status Bar */}
            {currentCombination?.state === 'reserved' && (
              <div className="w-full mb-4 flex items-center justify-between px-3 py-2 bg-amber-50/80 border border-amber-200 rounded-md text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>
                    Reserved: Edition <span className="font-semibold font-mono">#{currentCombination.index + 1}</span> of 480
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold tabular-nums text-amber-800">
                    {formatTime(secondsRemaining)} remaining
                  </span>
                  <button
                    onClick={onReleaseReservation}
                    className="text-stone-500 hover:text-stone-800 underline transition-colors"
                  >
                    Release
                  </button>
                </div>
              </div>
            )}

            {currentCombination?.state === 'issued' && (
              <div className="w-full mb-4 flex items-center justify-between px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-700" />
                  <span>
                    Issued & Permanently Anchored · Edition <span className="font-semibold font-mono">#{currentCombination.index + 1}</span>
                  </span>
                </div>
                <span className="font-mono text-emerald-800 font-medium">Claimed</span>
              </div>
            )}

            {/* Artwork Display Wrapper */}
            <div
              ref={containerRef}
              className={`w-full max-w-[420px] aspect-[210/297] flex items-center justify-center transition-all duration-300 ${
                isRolling ? 'opacity-40 scale-[0.98]' : 'opacity-100 scale-100'
              }`}
              dangerouslySetInnerHTML={{ __html: renderedSvg }}
            />

            {/* Bottom Caption / Accession Plate */}
            <div className="mt-6 pt-4 border-t border-stone-200 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-stone-500 gap-2">
              <div>
                <span className="font-semibold text-stone-800">The Generative Chef</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span>Rashid & Studio VCD</span>
              </div>
              <div className="font-mono text-stone-600">
                {currentCombination ? `Edition #${currentCombination.index + 1} / 480` : 'Preview'}
              </div>
            </div>
          </div>

          {/* Legal Rights Notice Box */}
          <div className="mt-4 w-full p-4 bg-stone-100/70 border border-stone-200 rounded-lg text-xs text-stone-600 leading-relaxed">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-800">Rights & Provenance Principle:</span>{' '}
                {campaign.rights.noticeText}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Generation Controls & Palette Tuning */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Main Action Block: Generate Variation */}
          <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-stone-900 font-editorial">
                  Algorithmic Variation
                </h2>
                <p className="text-xs text-stone-500">
                  Selects uniformly from {availableCount} remaining available combinations.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRoll}
                disabled={availableCount === 0 || isRolling}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-md transition-colors shadow-xs disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Available Variation</span>
              </button>

              <button
                onClick={onInitiateClaim}
                disabled={!currentCombination || currentCombination.state === 'issued'}
                className="py-3 px-5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-md transition-colors shadow-xs disabled:opacity-40 whitespace-nowrap"
              >
                Claim & Anchor
              </button>
            </div>

            {/* Trait breakdown display */}
            <div className="mt-6 pt-4 border-t border-stone-200">
              <div className="text-xs uppercase tracking-wider text-stone-500 font-semibold mb-3">
                Selected Traits (Combination #{currentCombination ? currentCombination.index + 1 : '—'})
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-stone-50 rounded-md border border-stone-200">
                  <span className="text-stone-500 block">Left Hand</span>
                  <span className="font-medium text-stone-800 capitalize">
                    {traits['left-hand'] === 'none' ? 'Empty' : traits['left-hand']}
                  </span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-md border border-stone-200">
                  <span className="text-stone-500 block">Head Style</span>
                  <span className="font-medium text-stone-800 capitalize">
                    {traits['head'] === 'head1' ? 'Turban / Wrap' : 'Traditional Cap'}
                  </span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-md border border-stone-200">
                  <span className="text-stone-500 block">Apron</span>
                  <span className="font-medium text-stone-800 capitalize">
                    {traits['apron'] === 'none' ? 'None' : traits['apron'] === 'apron1' ? 'Classic Full Bib' : 'Waist Half Apron'}
                  </span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-md border border-stone-200">
                  <span className="text-stone-500 block">Right Hand</span>
                  <span className="font-medium text-stone-800 capitalize">
                    {traits['right-hand'] === 'none' ? 'Empty' : traits['right-hand']}
                  </span>
                </div>
                <div className="col-span-2 p-2.5 bg-stone-50 rounded-md border border-stone-200">
                  <span className="text-stone-500 block">Adornment</span>
                  <span className="font-medium text-stone-800 capitalize">
                    {traits['adornments'] === 'none' ? 'None' : traits['adornments'].replace('-', ' ')}
                  </span>
                </div>
              </div>

              {/* Canonical ID display */}
              <div className="mt-3 p-2 bg-stone-100 rounded text-[11px] font-mono text-stone-600 break-all">
                <span className="text-stone-400 select-none">canonical_id: </span>
                {currentCombination?.canonicalId}
              </div>
            </div>
          </div>

          {/* Approved Brand Palette Selection */}
          <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-semibold text-stone-900 font-editorial">
                  Approved VCD Brand Palettes
                </h3>
                <p className="text-xs text-stone-500">
                  Curated restaurant harmonies. Palette changes do not alter trait uniqueness.
                </p>
              </div>
              <Palette className="w-4 h-4 text-stone-400" />
            </div>

            <div className="space-y-2 mt-4">
              {palettes.map((palette) => {
                const isSelected = currentPalette.id === palette.id;
                return (
                  <button
                    key={palette.id}
                    onClick={() => onSelectPalette(palette)}
                    className={`w-full flex items-center justify-between p-3 rounded-md border text-left transition-all ${
                      isSelected
                        ? 'border-stone-900 bg-stone-50/80 ring-1 ring-stone-900'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-stone-900">
                        {palette.name}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {palette.subtitle}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center -space-x-1">
                        {palette.brandColors.map((hex, i) => (
                          <span
                            key={i}
                            className="w-4 h-4 rounded-full border border-black/10 inline-block shadow-2xs"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                        {palette.accentColors.slice(0, 2).map((hex, i) => (
                          <span
                            key={i}
                            className="w-4 h-4 rounded-full border border-black/10 inline-block shadow-2xs"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-stone-900 ml-1.5" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Swatch Fine-Tuning */}
            <div className="mt-5 pt-4 border-t border-stone-200">
              <div className="text-xs font-medium text-stone-700 mb-2">
                Fine-tune Active Color Slots
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Coat', varName: '--color-coat' },
                  { label: 'Apron', varName: '--color-apron1' },
                  { label: 'Plates', varName: '--color-samosas-plate' },
                  { label: 'Adornment', varName: '--color-hibiscus' },
                  { label: 'Foliage / Accent', varName: '--color-hummingbird-body' },
                ].map(({ label, varName }) => {
                  const currentColor = customColors[varName] || '#ffcd00';
                  return (
                    <label
                      key={varName}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-md text-xs text-stone-700 cursor-pointer hover:bg-stone-100 transition-colors"
                    >
                      <input
                        type="color"
                        value={currentColor}
                        onChange={(e) => onUpdateColor(varName, e.target.value)}
                        className="w-4 h-4 rounded border-0 p-0 cursor-pointer appearance-none bg-transparent"
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
