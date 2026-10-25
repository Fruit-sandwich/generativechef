import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CAMPAIGN_CONFIG,
  VCD_LOCATIONS,
  APPROVED_PALETTES,
  loadSavedRegistry,
  saveRegistry,
} from './data/campaignData';
import {
  CombinationRecord,
  VCDLocation,
  ApprovedPalette,
} from './types/campaign';
import {
  buildRenderedSvg,
  buildCleanIndividualChefSvg,
  getActiveColorSlots,
  exportHighResPng,
  downloadSvgFile,
} from './utils/svgRenderer';
import { stampToArweave, StampFormat } from './services/arweaveService';
import { TopLeftGlyph } from './components/TopLeftGlyph';
import { FloatingInstrument } from './components/FloatingInstrument';
import { ThumbControls } from './components/ThumbControls';
import { CuratorialDrawer } from './components/CuratorialDrawer';
import { RegistryMatrix } from './components/RegistryMatrix';
import { CheckCircle2, ShieldCheck, ExternalLink, MapPin, X } from 'lucide-react';

interface ToastData {
  message: string;
  txId?: string;
  format?: StampFormat;
  sizeBytes?: number;
  status?: 'confirmed_permaweb' | 'local_cryptographic_anchor';
}

export default function App() {
  const [registry, setRegistry] = useState<CombinationRecord[]>([]);
  // Single location: Utawala, Nairobi Kenya
  const currentLocation: VCDLocation = VCD_LOCATIONS[0];
  const [currentCombination, setCurrentCombination] = useState<CombinationRecord | null>(null);
  const [paletteIndex, setPaletteIndex] = useState<number>(0);
  const [customColors, setCustomColors] = useState<Record<string, string>>({
    ...APPROVED_PALETTES[0].mappings,
  });

  const [isRolling, setIsRolling] = useState(false);
  const [isStamping, setIsStamping] = useState(false);
  const [toastData, setToastData] = useState<ToastData | null>(null);

  // Modals
  const [isCuratorialOpen, setIsCuratorialOpen] = useState(false);
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);

  const currentPalette = APPROVED_PALETTES[paletteIndex % APPROVED_PALETTES.length];

  // Initialize registry
  useEffect(() => {
    const loaded = loadSavedRegistry();
    setRegistry(loaded);
  }, []);

  // Set initial combination
  useEffect(() => {
    if (registry.length > 0 && !currentCombination) {
      const randomIndex = Math.floor(Math.random() * registry.length);
      setCurrentCombination(registry[randomIndex]);
    }
  }, [registry, currentCombination]);

  // Roll a new variation
  const handleRollNewVariation = useCallback(() => {
    if (registry.length === 0) return;
    setIsRolling(true);

    const randomIndex = Math.floor(Math.random() * registry.length);
    const chosen = registry[randomIndex];
    setCurrentCombination(chosen);

    setTimeout(() => {
      setIsRolling(false);
    }, 280);
  }, [registry]);

  // Cycle palette
  const handleCyclePalette = useCallback(() => {
    setPaletteIndex((prev) => {
      const next = (prev + 1) % APPROVED_PALETTES.length;
      setCustomColors({ ...APPROVED_PALETTES[next].mappings });
      return next;
    });
  }, []);

  // Update specific color slot
  const handleColorChange = useCallback((varName: string, color: string) => {
    setCustomColors((prev) => ({
      ...prev,
      [varName]: color,
    }));
  }, []);

  // Live viewport rendered SVG (clean edition caption only, no repeated VCD/CC0 in footer)
  const liveSvg = useMemo(() => {
    if (!currentCombination) return '';
    return buildRenderedSvg(
      currentCombination.traits,
      customColors,
      `EDITION #${currentCombination.index + 1} / 480`
    );
  }, [currentCombination, customColors]);

  // Active color slots for the quiet left swatch rail
  const activeSlots = useMemo(() => {
    if (!currentCombination) return [];
    return getActiveColorSlots(currentCombination.traits);
  }, [currentCombination]);

  // Streamlined Stamping & Permaweb Archival via TurboSDK (<100 KiB Free Tier)
  const handleStampWorkflow = useCallback(async () => {
    if (!currentCombination || isStamping) return;
    setIsStamping(true);

    try {
      // 1. Build an isolated clean individual chef SVG containing ONLY traits that involve it
      const individualCleanSvg = buildCleanIndividualChefSvg(
        currentCombination.traits,
        customColors,
        `EDITION #${currentCombination.index + 1} / 480`
      );

      // 2. Export High-Res PNG (2100×2970)
      const pngFilename = `Chef_Edition_${currentCombination.index + 1}_Utawala.png`;
      await exportHighResPng(individualCleanSvg, pngFilename);

      // 3. Download standalone clean individual SVG file
      const svgFilename = `Chef_Edition_${currentCombination.index + 1}_Utawala.svg`;
      downloadSvgFile(individualCleanSvg, svgFilename);

      // 4. Stamp directly to Arweave via Turbo SDK (<100 KiB Free Tier with Trait JSON efficiency fallback)
      const stampResult = await stampToArweave({
        individualSvg: individualCleanSvg,
        combination: currentCombination,
        traits: currentCombination.traits,
        location: currentLocation,
        palette: currentPalette,
        customColors,
        campaignId: CAMPAIGN_CONFIG.id,
      });

      // 5. Update local state & registry as issued with confirmed txId and storage format
      const updatedRecord: CombinationRecord = {
        ...currentCombination,
        state: 'issued',
        claimedAt: Date.now(),
        locationId: currentLocation.id,
        txId: stampResult.txId,
        storageFormat: stampResult.format,
      };

      setCurrentCombination(updatedRecord);

      setRegistry((prev) => {
        const updated = prev.map((r) =>
          r.index === currentCombination.index ? updatedRecord : r
        );
        saveRegistry(updated);
        return updated;
      });

      setToastData({
        message:
          stampResult.status === 'confirmed_permaweb'
            ? `Stamped Edition #${currentCombination.index + 1} to Arweave`
            : `Edition #${currentCombination.index + 1} Anchored Locally`,
        txId: stampResult.txId,
        format: stampResult.format,
        sizeBytes: stampResult.sizeBytes,
        status: stampResult.status,
      });
      setTimeout(() => setToastData(null), 9000);
    } catch (err) {
      console.error('Stamping notice:', err);
      setToastData({
        message: 'Chef SVG & High-Res PNG downloaded locally',
      });
      setTimeout(() => setToastData(null), 4000);
    } finally {
      setIsStamping(false);
    }
  }, [currentCombination, currentLocation, currentPalette, customColors, isStamping]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space' || e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRollNewVariation();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        handleCyclePalette();
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleStampWorkflow();
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setIsCuratorialOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRollNewVariation, handleCyclePalette, handleStampWorkflow]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white select-none">
      {/* 1. Fullscreen Art Canvas */}
      <div
        id="art-canvas"
        className={`w-full h-full flex items-center justify-center transition-opacity duration-200 ${
          isRolling ? 'opacity-30' : 'opacity-100'
        }`}
        dangerouslySetInnerHTML={{ __html: liveSvg }}
      />

      {/* 2. Top-Left Talisman Glyph */}
      <TopLeftGlyph onClick={handleRollNewVariation} isRolling={isRolling} />

      {/* 3. Quiet Left Swatch Rail (Fine-tuning color slots) */}
      <FloatingInstrument
        activeSlots={activeSlots}
        customColors={customColors}
        onColorChange={handleColorChange}
      />

      {/* 4. Prominent Bottom-Right Thumb Controls (Roll, Cycle Palette, Stamp) */}
      <ThumbControls
        onRoll={handleRollNewVariation}
        onCyclePalette={handleCyclePalette}
        onStamp={handleStampWorkflow}
        isRolling={isRolling}
        isStamping={isStamping}
        currentPaletteName={currentPalette.name}
      />

      {/* 5. Top-Right Discreet Venue & Legal Header (Primary location of VCD x CC0) */}
      <header className="fixed top-6 right-6 z-40 flex items-center gap-3 text-xs font-sans text-stone-600">
        {/* Location Display */}
        <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xs border border-stone-200 rounded-full py-1.5 px-3.5 text-xs font-medium text-stone-800 shadow-2xs">
          <MapPin className="w-3.5 h-3.5 text-stone-500" />
          <span>Virtue Classic Dish · Utawala</span>
        </div>

        {/* Public Domain Badge */}
        <button
          onClick={() => setIsCuratorialOpen(true)}
          title="Public Domain CC0 Dedication (I)"
          className="hidden sm:inline-block text-[11px] font-medium tracking-wide text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
        >
          Public Domain (CC0)
        </button>
      </header>

      {/* 6. Minimal Bottom-Left Image Number Badge (Only shows the image number) */}
      {currentCombination && (
        <div className="fixed bottom-6 left-6 z-40 text-left select-none">
          <button
            onClick={() => setIsCuratorialOpen(true)}
            title="View Curatorial Details & Provenance (I)"
            className="font-mono text-xs font-semibold text-stone-800 bg-white/85 hover:bg-white backdrop-blur-xs px-2.5 py-1.5 rounded-full border border-stone-200/80 shadow-2xs cursor-pointer hover:border-stone-400 transition-colors tabular-nums flex items-center gap-1.5"
          >
            {currentCombination.state === 'issued' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Stamped Edition" />
            )}
            <span>#{currentCombination.index + 1}</span>
          </button>
        </div>
      )}

      {/* 7. Action Toast Notification with direct Arweave & Explorer links */}
      {toastData && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-24 right-4 sm:right-6 z-50 bg-stone-900/95 backdrop-blur-md text-white text-xs p-3.5 rounded-xl shadow-2xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-sm border border-stone-800"
        >
          {toastData.status === 'confirmed_permaweb' ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}

          <div className="flex-1 space-y-1">
            <div className="font-medium text-stone-100 flex items-center justify-between">
              <span>{toastData.message}</span>
              {toastData.format && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-stone-800 text-stone-300 rounded ml-2">
                  {toastData.format === 'trait-json'
                    ? 'Trait JSON'
                    : toastData.format === 'offline-sha256'
                    ? 'SHA-256'
                    : 'SVG'}
                  {toastData.sizeBytes ? ` · ${(toastData.sizeBytes / 1024).toFixed(1)}k` : ''}
                </span>
              )}
            </div>

            {toastData.txId && (
              <div className="flex items-center gap-3 pt-1 text-[11px]">
                <a
                  href={`https://arweave.net/${toastData.txId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-300 hover:text-amber-200 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Arweave Gateway</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-stone-600">·</span>
                <a
                  href={`https://viewblock.io/arweave/tx/${toastData.txId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-stone-300 hover:text-white hover:underline flex items-center gap-1"
                >
                  <span>ViewBlock</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          <button
            onClick={() => setToastData(null)}
            className="text-stone-400 hover:text-stone-200 cursor-pointer p-0.5"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      {/* 8. Curatorial & Public Domain Drawer */}
      {currentCombination && (
        <CuratorialDrawer
          isOpen={isCuratorialOpen}
          onClose={() => setIsCuratorialOpen(false)}
          currentCombination={currentCombination}
          renderedSvg={liveSvg}
          location={currentLocation}
          palette={currentPalette}
          customColors={customColors}
          campaign={CAMPAIGN_CONFIG}
          onOpenRegistry={() => setIsRegistryOpen(true)}
          onStamp={handleStampWorkflow}
          isStamping={isStamping}
        />
      )}

      {/* 9. 480 Registry Matrix Modal */}
      {isRegistryOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setIsRegistryOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 text-xs cursor-pointer font-medium"
            >
              Close
            </button>
            <RegistryMatrix
              registry={registry}
              onSelectCombination={(rec) => {
                setCurrentCombination(rec);
                setIsRegistryOpen(false);
              }}
              locations={VCD_LOCATIONS}
            />
          </div>
        </div>
      )}
    </div>
  );
}
