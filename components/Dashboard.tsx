
import React, { useState, useEffect } from 'react';
import { MealEntry, UserProfile } from '../types';
import { ResponsiveContainer, Cell, PieChart, Pie, Tooltip as ChartTooltip } from 'recharts';

interface DashboardProps {
  meals: MealEntry[];
  profile: UserProfile;
  onAddMeal: (type: MealEntry['type'], description: string, time: string) => Promise<void>;
  onEditMeal: (id: string, updates: Partial<MealEntry>) => Promise<void>;
  onDeleteMeal: (id: string) => void;
  selectedDate: string;
  notes: string;
  onUpdateNote: (date: string, content: string) => void;
  onToggleExercise: () => void;
  onAnalyzeDay: () => Promise<void>;
  isAnalyzing: boolean;
  stats: any;
}

const MacroCard = ({ label, current, target, colorClass, unit = 'g', subtitle }: { label: string, current: number, target: number, colorClass: string, unit?: string, subtitle: string }) => {
  const percent = Math.min(100, (current / target) * 100);
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${colorClass} bg-opacity-10`}>{percent.toFixed(0)}%</span>
      </div>
      <div className="flex items-baseline gap-1 mb-3">
        <p className={`text-2xl font-black ${colorClass.replace('bg-', 'text-')}`}>{current.toFixed(1)}</p>
        <p className="text-slate-400 text-xs font-bold">/ {target.toFixed(0)}{unit}</p>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
        <div className={`h-full ${colorClass} transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
      </div>
      <p className="text-[10px] font-medium text-slate-500 mt-auto">{subtitle}</p>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ meals, onAddMeal, onEditMeal, onDeleteMeal, profile, selectedDate, notes, onUpdateNote, stats, onToggleExercise, onAnalyzeDay, isAnalyzing }) => {
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [mealTime, setMealTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
  const [mealType, setMealType] = useState<MealEntry['type']>('almuerzo');
  const [loading, setLoading] = useState(false);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [localNotes, setLocalNotes] = useState(notes);

  // Sincronizar notas locales cuando cambia el día o las notas desde el padre
  useEffect(() => {
    setLocalNotes(notes);
  }, [selectedDate, notes]);

  const selectedMeals = meals.filter(m => m.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));

  const totals = selectedMeals.reduce((acc, m) => ({
    calories: acc.calories + m.nutrition.calories,
    protein: acc.protein + m.nutrition.protein,
    fat: acc.fat + m.nutrition.fat,
    carbs: acc.carbs + m.nutrition.carbs,
    sugar: acc.sugar + m.nutrition.sugar,
  }), { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0 });

  const target = stats?.targetCalories || 0;
  const remainingCalories = target - totals.calories;
  const percentConsumed = Math.min(100, (totals.calories / (target || 1)) * 100);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);
    const fullPrompt = quantity ? `${quantity} de ${description}` : description;
    await onAddMeal(mealType, fullPrompt, mealTime);
    setDescription('');
    setQuantity('');
    setLoading(false);
  };

  const handleStartEdit = (meal: MealEntry) => {
    setEditingMealId(meal.id);
    setDescription(meal.description);
    setMealTime(meal.time);
    setMealType(meal.type);
  };

  const handleSaveEdit = async () => {
    if (!editingMealId) return;
    setLoading(true);
    await onEditMeal(editingMealId, { description, time: mealTime, type: mealType });
    setEditingMealId(null);
    setDescription('');
    setLoading(false);
  };

  const macroData = [
    { name: 'Proteínas', value: totals.protein, color: '#10b981' },
    { name: 'Grasas', value: totals.fat, color: '#f59e0b' },
    { name: 'Carbohidratos', value: totals.carbs, color: '#3b82f6' },
  ];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const inputClasses = "w-full px-4 py-3 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition text-slate-900 font-bold placeholder:text-slate-400";

  const circleRadius = 30;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (percentConsumed / 100) * circumference;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Header con Círculo de Calorías Compacto */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
        <div className="space-y-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 capitalize tracking-tighter">{formatDate(selectedDate)}</h2>
            <p className="text-slate-500 font-bold mt-1">Tu diario de nutrición inteligente</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={onToggleExercise}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                stats?.isExerciseDay ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'
              }`}
            >
              <span>{stats?.isExerciseDay ? '💪' : '😴'}</span> {stats?.isExerciseDay ? 'Día de entrenamiento' : 'Día de descanso'}
            </button>
            <button 
              onClick={onAnalyzeDay}
              disabled={isAnalyzing || selectedMeals.length === 0}
              className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-30"
            >
              ✨ {isAnalyzing ? 'Analizando...' : 'Analizar Jornada'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6 lg:gap-8">
          <div className="flex items-center gap-3 hidden sm:flex">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r={circleRadius}
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-slate-100"
                />
                <circle
                  cx="40"
                  cy="40"
                  r={circleRadius}
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  style={{ strokeDashoffset }}
                  strokeLinecap="round"
                  fill="transparent"
                  className={`${remainingCalories < 0 ? 'text-rose-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-lg font-black ${remainingCalories < 0 ? 'text-rose-600' : 'text-slate-900'}`}>{percentConsumed.toFixed(0)}%</span>
                <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Meta</span>
              </div>
            </div>
            <div className="text-left">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Queda pendiente</p>
              <p className={`text-xl font-black leading-tight ${remainingCalories < 0 ? 'text-rose-500' : 'text-slate-900'}`}>
                {Math.abs(remainingCalories).toFixed(0)}
                <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-tighter">
                  {remainingCalories < 0 ? 'Kcal Excedidas' : 'Kcal por consumir'}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-[35px] shadow-2xl flex flex-col justify-center min-w-[220px] lg:min-w-[240px] border border-slate-800">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Consumo Actual</p>
            <div className="flex items-baseline gap-1">
              <p className="text-4xl font-black text-emerald-400">{totals.calories.toFixed(0)}</p>
              <p className="text-slate-500 text-xs font-bold uppercase">/ {stats?.targetCalories.toFixed(0)}</p>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full mt-4 overflow-hidden">
               <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${Math.min(100, (totals.calories / (stats?.targetCalories || 1)) * 100)}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tu TDEE Base</p>
          <p className="text-2xl font-black text-slate-900">{stats?.tdee.toFixed(0)} <span className="text-[10px] text-slate-400">kcal</span></p>
        </div>
        <MacroCard label="Proteína" current={totals.protein} target={stats?.targetProtein} colorClass="bg-emerald-500" subtitle="Construcción" />
        <MacroCard label="Carbohidratos" current={totals.carbs} target={stats?.targetCarbs} colorClass="bg-blue-500" subtitle="Energía" />
        <MacroCard label="Grasas" current={totals.fat} target={stats?.targetFat} colorClass="bg-amber-500" subtitle="Hormonal" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm relative">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              {editingMealId ? '✏️ Editar Alimento' : '🥗 Registrar Ingesta'}
            </h3>
            <form onSubmit={editingMealId ? (e) => { e.preventDefault(); handleSaveEdit(); } : handleAdd} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <input type="time" value={mealTime} onChange={(e) => setMealTime(e.target.value)} className={inputClasses} />
                <select value={mealType} onChange={(e) => setMealType(e.target.value as MealEntry['type'])} className={inputClasses}>
                  <option value="desayuno">☕ Desayuno</option>
                  <option value="almuerzo">🍱 Almuerzo</option>
                  <option value="cena">🌙 Cena</option>
                  <option value="snack">🍎 Snack</option>
                </select>
              </div>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: 200g de pollo a la plancha" className={inputClasses} required />
              {!editingMealId && <input type="text" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Peso o cantidad (opcional)" className={inputClasses} />}
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-600 disabled:opacity-50 text-xs">
                  {loading ? 'Consultando IA...' : editingMealId ? 'Guardar Cambios' : 'Registrar'}
                </button>
                {editingMealId && (
                  <button type="button" onClick={() => { setEditingMealId(null); setDescription(''); }} className="px-6 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px]">Cancelar</button>
                )}
              </div>
            </form>
          </section>

          <section className="space-y-4">
            {selectedMeals.map(meal => (
              <div key={meal.id} className="bg-white p-6 rounded-[30px] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${meal.type === 'desayuno' ? 'bg-amber-50' : meal.type === 'almuerzo' ? 'bg-emerald-50' : meal.type === 'cena' ? 'bg-indigo-50' : 'bg-rose-50'}`}>
                    {meal.type === 'desayuno' ? '🍳' : meal.type === 'almuerzo' ? '🥗' : meal.type === 'cena' ? '🍛' : '🍎'}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg capitalize tracking-tight">{meal.description}</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-black uppercase mt-1 tracking-widest">
                      <span className="text-slate-900">{meal.nutrition.calories.toFixed(0)} kcal</span>
                      <span className="text-emerald-500">P: {meal.nutrition.protein.toFixed(1)}g</span>
                      <span className="text-blue-500">C: {meal.nutrition.carbs.toFixed(1)}g</span>
                      <span className="text-amber-500">G: {meal.nutrition.fat.toFixed(1)}g</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => handleStartEdit(meal)} className="p-3 text-slate-400 hover:text-emerald-600 bg-slate-50 rounded-xl">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => onDeleteMeal(meal.id)} className="p-3 text-rose-400 hover:text-rose-600 bg-rose-50 rounded-xl">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
            {selectedMeals.length === 0 && <div className="py-20 text-center bg-slate-100/30 rounded-[40px] border-2 border-dashed border-slate-200 text-slate-400 font-bold">Sin ingestas registradas hoy</div>}
          </section>
        </div>

        <div className="space-y-8">
          {/* Gráfico circular de macros */}
          <section className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col items-center">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2 self-start">📊 Distribución de Macros</h3>
            <div className="h-48 w-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={macroData} 
                    innerRadius={50} 
                    outerRadius={70} 
                    paddingAngle={8} 
                    dataKey="value"
                    animationDuration={1000}
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black text-slate-400 uppercase leading-none">Día Actual</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 w-full mt-6">
              {macroData.map(m => (
                <div key={m.name} className="text-center">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{m.name.slice(0, 4)}</div>
                  <div className="w-full h-1 rounded-full mb-1" style={{ backgroundColor: `${m.color}20` }}>
                    <div className="h-full rounded-full" style={{ width: '100%', backgroundColor: m.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Notas Personales */}
          <section className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">📝 Notas</h3>
            <textarea
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              placeholder="Escribe sobre tu energía, sueño, digestión..."
              className="w-full h-48 p-5 bg-slate-50 border border-slate-200 rounded-3xl text-slate-800 font-medium outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none text-sm leading-relaxed"
            />
            <button 
              onClick={() => onUpdateNote(selectedDate, localNotes)}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all"
            >
              Guardar Notas
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
