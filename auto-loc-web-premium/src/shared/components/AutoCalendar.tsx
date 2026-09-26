import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchApi } from '@/lib/config';

export interface BlockedRange {
  from: string;
  to: string;
  type?: string;
}

export interface AutoCalendarProps {
  vehicleId?: string;
  blockedRanges?: BlockedRange[];
  startDate?: string; // Format ISO YYYY-MM-DD
  endDate?: string;   // Format ISO YYYY-MM-DD
  onSelectDates: (startDate: string, endDate?: string) => void;
  minDate?: Date;
}

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const AutoCalendar: React.FC<AutoCalendarProps> = ({
  vehicleId,
  blockedRanges: blockedRangesProp,
  startDate,
  endDate,
  onSelectDates,
  minDate = new Date(),
}) => {
  const initialDate = startDate ? new Date(startDate) : new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [fetchedBlockedRanges, setFetchedBlockedRanges] = useState<BlockedRange[]>([]);

  useEffect(() => {
    if (vehicleId && !blockedRangesProp) {
      fetchApi<{ blockedRanges: BlockedRange[] }>(`/vehicles/${vehicleId}/blocked-dates`)
        .then((res) => {
          if (res?.blockedRanges) {
            setFetchedBlockedRanges(res.blockedRanges);
          }
        })
        .catch((err) => {
          console.warn('[AutoCalendar] Erreur chargement dates bloquées:', err);
        });
    }
  }, [vehicleId, blockedRangesProp]);

  const activeBlockedRanges = blockedRangesProp ?? fetchedBlockedRanges;

  const normalizedMinDate = new Date(minDate);
  normalizedMinDate.setHours(0, 0, 0, 0);

  const parseIsoDate = (s: string): Date => {
    const parts = s.split('T')[0].split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  };

  const blockedSet = useMemo(() => {
    const set = new Set<string>();
    if (!activeBlockedRanges || activeBlockedRanges.length === 0) return set;

    for (const range of activeBlockedRanges) {
      if (!range.from || !range.to) continue;
      const start = parseIsoDate(range.from);
      const end = parseIsoDate(range.to);

      const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000);
      if (diffDays > 365 || diffDays < 0) continue;

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const y = d.getFullYear();
        const m = (d.getMonth() + 1).toString().padStart(2, '0');
        const dayStr = d.getDate().toString().padStart(2, '0');
        set.add(`${y}-${m}-${dayStr}`);
      }
    }

    return set;
  }, [activeBlockedRanges]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOffset = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const offset = getFirstDayOffset(currentYear, currentMonth);

  const formatDateString = (year: number, month: number, day: number): string => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const handleDayPress = (day: number) => {
    const dateStr = formatDateString(currentYear, currentMonth, day);
    if (blockedSet.has(dateStr)) return;

    const selectedTime = new Date(`${dateStr}T00:00:00`).getTime();

    if (!startDate || (startDate && endDate)) {
      onSelectDates(dateStr, undefined);
    } else if (startDate && !endDate) {
      const startTime = new Date(`${startDate}T00:00:00`).getTime();
      if (selectedTime < startTime) {
        onSelectDates(dateStr, undefined);
      } else {
        const start = parseIsoDate(startDate);
        const end = parseIsoDate(dateStr);
        let hasBlockedInRange = false;

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const y = d.getFullYear();
          const m = (d.getMonth() + 1).toString().padStart(2, '0');
          const dayStr = d.getDate().toString().padStart(2, '0');
          if (blockedSet.has(`${y}-${m}-${dayStr}`)) {
            hasBlockedInRange = true;
            break;
          }
        }

        if (hasBlockedInRange) {
          onSelectDates(dateStr, undefined);
        } else {
          onSelectDates(startDate, dateStr);
        }
      }
    }
  };

  const renderCalendarDays = () => {
    const cells = [];

    for (let i = 0; i < offset; i++) {
      cells.push(<div key={`empty-${i}`} className="w-[14.28%] h-10" />);
    }

    const startTimestamp = startDate ? new Date(`${startDate}T00:00:00`).getTime() : null;
    const endTimestamp = endDate ? new Date(`${endDate}T00:00:00`).getTime() : null;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDateString(currentYear, currentMonth, day);
      const cellDate = new Date(`${dateStr}T00:00:00`);
      const cellTimestamp = cellDate.getTime();

      const isBlocked = blockedSet.has(dateStr);
      const isDisabled = cellDate < normalizedMinDate || isBlocked;
      const isStart = startTimestamp !== null && cellTimestamp === startTimestamp;
      const isEnd = endTimestamp !== null && cellTimestamp === endTimestamp;
      const isInRange =
        startTimestamp !== null &&
        endTimestamp !== null &&
        cellTimestamp > startTimestamp &&
        cellTimestamp < endTimestamp;

      cells.push(
        <button
          key={`day-${day}`}
          type="button"
          disabled={isDisabled}
          onClick={() => handleDayPress(day)}
          className={`w-[14.28%] h-10 flex items-center justify-center relative transition-all my-0.5 ${
            isInRange ? 'bg-emerald-500/15' : ''
          } ${isStart ? 'bg-emerald-500/15 rounded-l-2xl' : ''} ${
            isEnd ? 'bg-emerald-500/15 rounded-r-2xl' : ''
          } ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100'}`}
        >
          <div
            className={`w-8.5 h-8.5 rounded-full flex items-center justify-center font-semibold text-xs transition-all ${
              isStart || isEnd
                ? 'bg-brand-dark text-emerald-400 font-black shadow-md'
                : isBlocked
                ? 'bg-rose-100 text-rose-600 line-through'
                : isInRange
                ? 'text-brand-dark font-bold'
                : 'text-slate-800'
            }`}
          >
            {day}
          </div>
        </button>
      );
    }

    return cells;
  };

  return (
    <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm w-full">
      {/* Month Header Navigation */}
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="w-8.5 h-8.5 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-slate-900">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="w-8.5 h-8.5 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Week Day Labels */}
      <div className="flex items-center justify-between mb-2 text-[11px] font-bold text-slate-400">
        {DAY_NAMES.map((d, index) => (
          <span key={index} className="w-[14.28%] text-center">
            {d}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="flex flex-wrap">{renderCalendarDays()}</div>

      {/* Legend */}
      <div className="flex items-center justify-around text-[10px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-dark" />
          <span>Sélectionné</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-100 border border-rose-400" />
          <span>Occupé / Réservé</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
          <span>Passé</span>
        </div>
      </div>
    </div>
  );
};
