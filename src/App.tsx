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
import { archiveToPermaweb } from './services/arweaveArchive';
import { TopLeftGlyph } from './components/TopLeftGlyph';
import { FloatingInstrument } from './components/FloatingInstrument';
import { ThumbControls } from './components/ThumbControls';
import { CuratorialDrawer } from './components/CuratorialDrawer';
import { OnSiteQRModal } from './components/OnSiteQRModal';
import { RegistryMatrix } from './components/RegistryMatrix';
import { QrCode, CheckCircle2, ExternalLink, MapPin } from 'lucide-react';

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
  const [isExporting, setIsExporting] = useState(false);
  const [toastData, setToastData] = useState<{ message: string; txId?: string } | null>(null);

  // Modals
  const [isCuratorialOpen, setIsCuratorialOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
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

  // Live viewport rendered SVG
  const liveSvg = useMemo(() => {
    if (!currentCombination) return '';
    return buildRenderedSvg(
      currentCombination.traits,
      customColors,
      `VCD UTAWALA • #${currentCombination.index + 1}/480 • CC0 PUBLIC DOMAIN`
    );
  }, [currentCombination, customColors]);

  // Active color slots for the quiet left swatch rail
  const activeSlots = useMemo(() => {
    if (!currentCombination) return [];
    return getActiveColorSlots(currentCombination.traits);
  }, [currentCombination]);

  // Streamlined Export & Direct SVG Permaweb Archival via TurboSDK
  const handleExportWorkflow = useCallback(async () => {
    if (!currentCombination || isExporting) return;
    setIsExporting(true);

    try {
      // 1. Build an isolated individual chef SVG containing ONLY the traits that involve it!
      const individualCleanSvg = buildCleanIndividualChefSvg(
        currentCombination.traits,
        customColors,
        `VCD UTAWALA, NAIROBI • EDITION #${currentCombination.index + 1}/480 • CC0 PUBLIC DOMAIN`
      );

      // 2. Export High-Res PNG (2100×2970)
      const pngFilename = `Chef_Edition_${currentCombination.index + 1}_Utawala.png`;
      await exportHighResPng(individualCleanSvg, pngFilename);

      // 3. Download standalone clean individual SVG file
      const svgFilename = `Chef_Edition_${currentCombination.index + 1}_Utawala.svg`;
      downloadSvgFile(individualCleanSvg, svgFilename);

      // 4. Anchor individual clean SVG directly to Arweave via TurboSDK
      const archiveResult = await archiveToPermaweb({
        individualSvg: individualCleanSvg,
        combination: currentCombination,
        traits: currentCombination.traits,
        location: currentLocation,
        palette: currentPalette,
        customColors,
        campaignId: CAMPAIGN_CONFIG.id,
      });

      // Update registry record as issued
      setRegistry((prev) => {
        const updated = prev.map((r) =>
          r.index === currentCombination.index
            ? {
                ...r,
                state: 'issued' as const,
                claimedAt: Date.now(),
                locationId: currentLocation.id,
                txId: archiveResult.txId,
              }
            : r
        );
        saveRegistry(updated);
        return updated;
      });

      setToastData({
        message: `Anchored Edition #${currentCombination.index + 1} SVG to Arweave (CC0 Public Domain)`,
        txId: archiveResult.txId,
      });
      setTimeout(() => setToastData(null), 6000);
    } catch (err) {
      console.error('Export notice:', err);
      setToastData({
        message: 'Chef SVG & High-Res PNG exported locally',
      });
      setTimeout(() => setToastData(null), 4000);
    } finally {
      setIsExporting(false);
    }
  }, [currentCombination, currentLocation, currentPalette, customColors, isExporting]);

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
        handleExportWorkflow();
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setIsCuratorialOpen((prev) => !prev);
      } else if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        setIsQrModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRollNewVariation, handleCyclePalette, handleExportWorkflow]);

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

      {/* 4. Prominent Bottom-Right Thumb Controls (Roll, Cycle Palette, Export) */}
      <ThumbControls
        onRoll={handleRollNewVariation}
        onCyclePalette={handleCyclePalette}
        onExport={handleExportWorkflow}
        isRolling={isRolling}
        isExporting={isExporting}
        currentPaletteName={currentPalette.name}
      />

      {/* 5. Top-Right Discreet Venue & Legal Header */}
      <header className="fixed top-6 right-6 z-40 flex items-center gap-3 text-xs font-sans text-stone-600">
        {/* Location Display */}
        <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xs border border-stone-200 rounded-full py-1.5 px-3.5 text-xs font-medium text-stone-800 shadow-2xs">
          <MapPin className="w-3.5 h-3.5 text-stone-500" />
          <span>Virtue Classic Dish · Utawala</span>
        </div>

        {/* Table QR Button */}
        <button
          onClick={() => setIsQrModalOpen(true)}
          title="On-Site Table QR Code (Q)"
          className="p-1.5 bg-white/80 hover:bg-white backdrop-blur-xs border border-stone-200 rounded-full shadow-2xs text-stone-700 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <QrCode className="w-4 h-4" />
        </button>

        {/* Public Domain Badge */}
        <button
          onClick={() => setIsCuratorialOpen(true)}
          title="Public Domain CC0 Dedication (I)"
          className="hidden sm:inline-block text-[11px] font-medium tracking-wide text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
        >
          Public Domain (CC0)
        </button>
      </header>

      {/* 6. Minimal Bottom Curatorial Caption (Positioned unobtrusively on bottom-left) */}
      {currentCombination && (
        <div className="fixed bottom-6 left-6 z-40 text-left select-none">
          <button
            onClick={() => setIsCuratorialOpen(true)}
            className="text-xs sm:text-sm font-editorial text-stone-600 hover:text-stone-900 transition-colors cursor-pointer bg-white/70 hover:bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-stone-200/70 shadow-2xs flex items-center gap-2"
          >
            <span>The Generative Chef</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="font-mono text-stone-800 tabular-nums font-semibold">
              #{currentCombination.index + 1}
            </span>
            <span className="text-stone-400 text-xs">of 480</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="text-xs text-stone-500">Utawala, Nairobi</span>
          </button>
        </div>
      )}

      {/* 7. Action Toast Notification with direct Arweave SVG link */}
      {toastData && (
        <div className="fixed bottom-24 right-6 z-50 bg-stone-900/95 backdrop-blur-md text-white text-xs py-2.5 px-4 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex-1 truncate">
            <div>{toastData.message}</div>
            {toastData.txId && (
              <a
                href={`https://arweave.net/${toastData.txId}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-300 hover:underline flex items-center gap-1 mt-0.5"
              >
                <span>View SVG on Arweave</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
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
          onOpenQrModal={() => setIsQrModalOpen(true)}
          onOpenRegistry={() => setIsRegistryOpen(true)}
        />
      )}

      {/* 9. On-Site Table QR Modal */}
      <OnSiteQRModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        locations={VCD_LOCATIONS}
        currentLocation={currentLocation}
        onSelectLocation={() => {}}
        campaign={CAMPAIGN_CONFIG}
      />

      {/* 10. 480 Registry Matrix Modal */}
      {isRegistryOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setIsRegistryOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 text-xs cursor-pointer"
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
