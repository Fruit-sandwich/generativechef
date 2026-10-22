import React from 'react';
import { ActiveColorSlot } from '../utils/svgRenderer';

interface FloatingInstrumentProps {
  activeSlots: ActiveColorSlot[];
  customColors: Record<string, string>;
  onColorChange: (varName: string, color: string) => void;
}

export const FloatingInstrument: React.FC<FloatingInstrumentProps> = ({
  activeSlots,
  customColors,
  onColorChange,
}) => {
  return (
    <nav
      id="ui-instrument"
      className="fixed left-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-40 select-none opacity-80 hover:opacity-100 transition-opacity duration-200"
      aria-label="Color Palette Fine-tuning"
    >
      {activeSlots.map((slot) => {
        const currentColor = customColors[slot.varName] || '#ffcd00';
        return (
          <div
            key={slot.id}
            className="swatch-wrapper w-[24px] h-[24px] rounded-full flex items-center justify-center shadow-2xs hover:scale-115 transition-transform"
            title={`${slot.label} color`}
          >
            <input
              type="color"
              aria-label={slot.label}
              value={currentColor}
              onChange={(e) => onColorChange(slot.varName, e.target.value)}
              className="color-picker"
            />
          </div>
        );
      })}
    </nav>
  );
};
