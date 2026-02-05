
import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type DateRange = {
  startDate: Date | null;
  endDate: Date | null;
  label: string;
};

type Props = {
  onFilterChange: (range: DateRange) => void;
  className?: string;
};

export const PRESET_RANGES = [
  { label: 'Hoje', getValue: () => ({ start: new Date(), end: new Date() }) },
  { label: 'Ontem', getValue: () => ({ start: subDays(new Date(), 1), end: subDays(new Date(), 1) }) },
  { label: 'Esta Semana', getValue: () => ({ start: startOfWeek(new Date(), { locale: ptBR }), end: endOfWeek(new Date(), { locale: ptBR }) }) },
  { label: 'Este Mês', getValue: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
  { label: 'Este Ano', getValue: () => ({ start: startOfYear(new Date()), end: endOfYear(new Date()) }) },
  { label: 'Personalizado', getValue: () => ({ start: null, end: null }) },
];

export default function DateRangeFilter({ onFilterChange, className = '' }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    label: 'Este Mês'
  });
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Notify parent on mount with default (This Month)
    onFilterChange(selectedRange);

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePresetClick = (preset: typeof PRESET_RANGES[0]) => {
    if (preset.label === 'Personalizado') {
      setSelectedRange({ startDate: null, endDate: null, label: 'Personalizado' });
      return; // Keep open for input
    }

    const { start, end } = preset.getValue();
    const newRange = { startDate: start, endDate: end, label: preset.label };
    setSelectedRange(newRange);
    onFilterChange(newRange);
    setIsOpen(false);
  };

  const applyCustomRange = () => {
    if (customStart && customEnd) {
      const start = parseISO(customStart);
      const end = parseISO(customEnd);
      const newRange = { startDate: start, endDate: end, label: 'Personalizado' };
      setSelectedRange(newRange);
      onFilterChange(newRange);
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50 text-sm font-medium text-gray-700"
      >
        <Calendar size={18} />
        <span>{selectedRange.label}</span>
        {selectedRange.label === 'Personalizado' && selectedRange.startDate && (
           <span className="text-xs text-gray-500">
             ({format(selectedRange.startDate, 'dd/MM')} - {format(selectedRange.endDate!, 'dd/MM')})
           </span>
        )}
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border z-50 p-2">
          <div className="grid grid-cols-1 gap-1 mb-2">
            {PRESET_RANGES.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset)}
                className={`text-left px-3 py-2 rounded-md text-sm ${
                  selectedRange.label === preset.label
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {selectedRange.label === 'Personalizado' && (
            <div className="border-t pt-3 mt-1">
              <div className="flex gap-2 mb-2">
                <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Início</label>
                    <input 
                        type="date" 
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full text-xs border rounded p-1"
                    />
                </div>
                <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Fim</label>
                    <input 
                        type="date" 
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full text-xs border rounded p-1"
                    />
                </div>
              </div>
              <button
                onClick={applyCustomRange}
                disabled={!customStart || !customEnd}
                className="w-full bg-blue-600 text-white text-sm py-1 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Aplicar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
