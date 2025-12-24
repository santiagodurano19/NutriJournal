
import React, { useState } from 'react';
import { MealEntry } from '../types';

interface HistoryViewProps {
  meals: MealEntry[];
  onSelectDate: (date: string) => void;
  selectedDate: string;
}

const HistoryView: React.FC<HistoryViewProps> = ({ meals, onSelectDate, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const days = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const firstDay = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getDailyTotals = (dayStr: string) => {
    const dayMeals = meals.filter(m => m.date === dayStr);
    return dayMeals.reduce((acc, m) => ({
      calories: acc.calories + m.nutrition.calories,
      count: acc.count + 1
    }), { calories: 0, count: 0 });
  };

  const renderCells = () => {
    const cells = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Empty cells for first week
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-24 sm:h-32 bg-slate-50 border border-slate-100"></div>);
    }

    // Day cells
    for (let d = 1; d <= days; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const { calories, count } = getDailyTotals(dateStr);
      const isSelected = dateStr === selectedDate;
      const isToday = dateStr === new Date().toISOString().split('T')[0];

      cells.push(
        <button
          key={d}
          onClick={() => onSelectDate(dateStr)}
          className={`h-24 sm:h-32 p-2 border border-slate-100 flex flex-col items-start gap-1 transition-all
            ${isSelected ? 'bg-emerald-50 ring-2 ring-emerald-500 ring-inset z-10' : 'bg-white hover:bg-slate-50'}
            ${isToday ? 'border-emerald-300' : ''}`}
        >
          <span className={`text-sm font-bold ${isToday ? 'bg-emerald-600 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-500'}`}>
            {d}
          </span>
          
          {count > 0 && (
            <div className="mt-auto w-full text-left">
              <div className="text-[10px] font-bold text-emerald-600 truncate">
                {calories.toFixed(0)} kcal
              </div>
              <div className="flex gap-0.5 mt-1">
                {[...Array(Math.min(count, 3))].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                ))}
                {count > 3 && <span className="text-[8px] text-slate-400">+{count - 3}</span>}
              </div>
            </div>
          )}
        </button>
      );
    }

    return cells;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 capitalize">
          {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-100">
        {dayNames.map(day => (
          <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 bg-slate-100">
        {renderCells()}
      </div>

      <div className="p-6 bg-slate-50 text-slate-500 text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            <span>Días con registros</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white border border-emerald-500 ring-2 ring-emerald-500 ring-inset"></div>
            <span>Día seleccionado</span>
          </div>
        </div>
        <p className="mt-4 italic text-xs">
          * Haz clic en cualquier día para ver el detalle y editar sus comidas.
        </p>
      </div>
    </div>
  );
};

export default HistoryView;
