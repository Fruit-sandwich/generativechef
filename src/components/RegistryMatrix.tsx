import React, { useState, useMemo } from 'react';
import { CombinationRecord, CombinationState, VCDLocation } from '../types/campaign';
import { Search, Filter, ShieldCheck, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

interface RegistryMatrixProps {
  registry: CombinationRecord[];
  onSelectCombination: (record: CombinationRecord) => void;
  locations: VCDLocation[];
}

export const RegistryMatrix: React.FC<RegistryMatrixProps> = ({
  registry,
  onSelectCombination,
  locations,
}) => {
  const [filterState, setFilterState] = useState<'all' | CombinationState>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<CombinationRecord | null>(null);

  const filteredRecords = useMemo(() => {
    return registry.filter((rec) => {
      if (filterState !== 'all' && rec.state !== filterState) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTraits =
          rec.traits['left-hand'].includes(q) ||
          rec.traits.head.includes(q) ||
          rec.traits.apron.includes(q) ||
          rec.traits['right-hand'].includes(q) ||
          rec.traits.adornments.includes(q) ||
          rec.canonicalId.toLowerCase().includes(q) ||
          (rec.index + 1).toString() === q;
        if (!matchesTraits) return false;
      }
      return true;
    });
  }, [registry, filterState, searchQuery]);

  const issuedCount = registry.filter((r) => r.state === 'issued').length;
  const reservedCount = registry.filter((r) => r.state === 'reserved').length;
  const availableCount = registry.filter((r) => r.state === 'available').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="text-xs uppercase tracking-widest text-stone-500 font-sans">
            Curatorial Registry Authority · Maximum 480 Variations
          </div>
          <h2 className="text-3xl font-editorial font-medium text-stone-900 mt-1">
            Trait Combination Registry
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-xl">
            Each combination represents a unique permutation of 4 left hands × 2 heads × 3 aprons × 4 right hands × 5 adornments.
          </p>
        </div>

        {/* Search & State Filter Segmented Control */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search trait or #edition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-500 w-full sm:w-56"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-md">
            <button
              onClick={() => setFilterState('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                filterState === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All ({registry.length})
            </button>
            <button
              onClick={() => setFilterState('available')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                filterState === 'available' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Available ({availableCount})
            </button>
            <button
              onClick={() => setFilterState('reserved')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                filterState === 'reserved' ? 'bg-white text-amber-800 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Reserved ({reservedCount})
            </button>
            <button
              onClick={() => setFilterState('issued')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                filterState === 'issued' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Issued ({issuedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Records List + Detail Inspector */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Records Table / List */}
        <div className="lg:col-span-8 bg-white border border-stone-200 rounded-lg overflow-hidden shadow-xs">
          <div className="max-h-[640px] overflow-y-auto divide-y divide-stone-100">
            {filteredRecords.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500">
                No combinations match the selected criteria.
              </div>
            ) : (
              filteredRecords.map((rec) => {
                const isSelected = selectedRecord?.index === rec.index;
                return (
                  <div
                    key={rec.index}
                    onClick={() => setSelectedRecord(rec)}
                    className={`p-3.5 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-stone-100/80 font-medium'
                        : 'hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-stone-400 w-10 shrink-0 tabular-nums">
                        #{(rec.index + 1).toString().padStart(3, '0')}
                      </span>
                      <div className="truncate">
                        <span className="font-medium text-stone-800 capitalize">
                          {rec.traits['left-hand'] === 'none' ? 'Empty' : rec.traits['left-hand']}
                        </span>
                        <span className="text-stone-400 mx-1">·</span>
                        <span className="text-stone-600">
                          {rec.traits.head === 'head1' ? 'Turban' : 'Cap'}
                        </span>
                        <span className="text-stone-400 mx-1">·</span>
                        <span className="text-stone-600 capitalize">
                          {rec.traits.apron === 'none' ? 'No Apron' : rec.traits.apron}
                        </span>
                        <span className="text-stone-400 mx-1">·</span>
                        <span className="text-stone-600 capitalize">
                          {rec.traits['right-hand'] === 'none' ? 'Empty' : rec.traits['right-hand']}
                        </span>
                        <span className="text-stone-400 mx-1">·</span>
                        <span className="text-stone-500 capitalize">
                          {rec.traits.adornments === 'none' ? 'No Adornment' : rec.traits.adornments.replace('-', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      {rec.state === 'issued' && (
                        <span className="text-[11px] font-medium text-stone-500">
                          Issued
                        </span>
                      )}
                      {rec.state === 'reserved' && (
                        <span className="text-[11px] font-medium text-amber-700">
                          Reserved (15m)
                        </span>
                      )}
                      {rec.state === 'available' && (
                        <span className="text-[11px] font-medium text-emerald-700">
                          Available
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Selected Combination Inspector */}
        <div className="lg:col-span-4 bg-white border border-stone-200 rounded-lg p-6 shadow-xs sticky top-24">
          <div className="text-xs uppercase tracking-widest text-stone-500 font-sans">
            Combination Inspector
          </div>

          {selectedRecord ? (
            <div className="mt-4 space-y-4">
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-editorial font-medium text-stone-900">
                  Edition #{selectedRecord.index + 1}
                </h3>
                <span
                  className={`text-xs font-semibold ${
                    selectedRecord.state === 'issued'
                      ? 'text-stone-700'
                      : selectedRecord.state === 'reserved'
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                  }`}
                >
                  {selectedRecord.state.toUpperCase()}
                </span>
              </div>

              {/* Trait breakdown definition list */}
              <div className="bg-stone-50 p-3.5 rounded-md border border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Left Hand:</span>
                  <span className="font-semibold text-stone-800 capitalize">
                    {selectedRecord.traits['left-hand']}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Head:</span>
                  <span className="font-semibold text-stone-800 capitalize">
                    {selectedRecord.traits.head}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Apron:</span>
                  <span className="font-semibold text-stone-800 capitalize">
                    {selectedRecord.traits.apron}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Right Hand:</span>
                  <span className="font-semibold text-stone-800 capitalize">
                    {selectedRecord.traits['right-hand']}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Adornment:</span>
                  <span className="font-semibold text-stone-800 capitalize">
                    {selectedRecord.traits.adornments}
                  </span>
                </div>
              </div>

              {/* Canonical ID */}
              <div>
                <span className="text-[11px] text-stone-500 block mb-1">Canonical Trait Identifier</span>
                <code className="text-[11px] font-mono text-stone-700 bg-stone-100 p-2 rounded block break-all">
                  {selectedRecord.canonicalId}
                </code>
              </div>

              {/* Status details */}
              {selectedRecord.state === 'issued' && (
                <div className="text-xs text-stone-600 space-y-1 pt-2 border-t border-stone-200">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Encounter Location:</span>
                    <span className="font-medium text-stone-800">
                      {locations.find((l) => l.id === selectedRecord.locationId)?.name || 'VCD Location'}
                    </span>
                  </div>
                  {selectedRecord.claimedAt && (
                    <div className="flex justify-between">
                      <span className="text-stone-500">Claimed At:</span>
                      <span className="font-medium text-stone-800">
                        {new Date(selectedRecord.claimedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {selectedRecord.txId && (
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-stone-500">Permanent Record:</span>
                      <span className="font-mono text-[10px] text-stone-700 truncate max-w-[140px]">
                        {selectedRecord.txId}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              {selectedRecord.state === 'available' && (
                <button
                  onClick={() => onSelectCombination(selectedRecord)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-md transition-colors shadow-xs mt-4"
                >
                  <span>Load Into Studio & Reserve</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="mt-8 text-center text-xs text-stone-400 py-12">
              Select any combination from the matrix to inspect traits and archival state.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
