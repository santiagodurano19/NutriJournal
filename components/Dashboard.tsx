
import React, { useState } from 'react';
import { MealEntry, UserProfile } from '../types';
import { ResponsiveContainer, Cell, PieChart, Pie, Tooltip } from 'recharts';

interface DashboardProps {
  meals: MealEntry[];
  profile: UserProfile;
  onAddMeal: (type: MealEntry['type'], description: string, time: string) => Promise<void>;
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
        <div 
          className={`h-full ${colorClass} transition-all duration-1000`} 
          style={{ width: `${percent}%` }}
        ></div>
      </div>
      <p className="text-[10px] font-medium text-slate-500 mt-auto">{subtitle}</p>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ meals, onAddMeal, onDeleteMeal, profile, selectedDate, notes, onUpdateNote, stats, onToggleExercise, onAnalyzeDay, isAnalyzing }) => {
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [mealTime, setMealTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
  const [mealType, setMealType] = useState<MealEntry['type']>('almuerzo');
  const [loading, setLoading] = useState(false);

  const selectedMeals = meals.filter(m => m.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const totals = selectedMeals.reduce((acc, m) => ({
    calories: acc.calories + m.nutrition.calories,
    protein: acc.protein + m.nutrition.protein,
    fat: acc.fat + m.nutrition.fat,
    carbs: acc.carbs + m.nutrition.carbs,
    sugar: acc.sugar + m.nutrition.sugar,
  }), { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0 });

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

  const macroData = [
    { name: 'Proteínas', value: totals.protein, color: '#10b981' },
    { name: 'Grasas', value: totals.fat, color: '#f59e0b' },
    { name: 'Carbohidratos', value: totals.carbs, color: '#3b82f6' },
  ];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const targetCals = stats?.targetCalories || 2000;
  const caloriesLeft = Math.max(0, targetCals - totals.calories);
  const progressPercent = Math.min(100, (totals.calories / targetCals) * 100);
  const radius = 22;
  const dashArray = 2 * Math.PI * radius;
  const dashOffset = dashArray - (dashArray * progressPercent / 100);

  const inputClasses = "w-full px-4 py-3 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition text-slate-900 font-bold placeholder:text-slate-400";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 capitalize">{formatDate(selectedDate)}</h2>
            <p className="text-slate-500 font-bold mt-1">{isToday ? 'Estás en el camino correcto' : 'Revisión histórica'}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={onToggleExercise}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                stats?.isExerciseDay 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                : 'bg-white text-slate-400 border border-slate-200 hover:border-blue-200'
              }`}
            >
              <span className="text-sm">{stats?.isExerciseDay ? '💪' : '😴'}</span>
              {stats?.isExerciseDay ? 'Hoy entrené' : 'Día de descanso'}
            </button>

            <button 
              onClick={onAnalyzeDay}
              disabled={isAnalyzing || selectedMeals.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                isAnalyzing 
                ? 'bg-emerald-50 text-emerald-600 animate-pulse cursor-wait' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-100 active:scale-95'
              } disabled:opacity-30 disabled:grayscale`}
            >
              <span className="text-sm">✨</span>
              {isAnalyzing ? 'Analizando día...' : 'Analizar día con IA'}
            </button>
          </div>
        </div>

        {stats && (
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl flex items-center gap-6 min-w-[340px] relative overflow-hidden border border-slate-800">
            {stats.isSafeLimited && (
              <div className="absolute top-0 right-0 bg-amber-500 text-slate-900 text-[8px] font-black px-3 py-1 uppercase tracking-tighter">
                Límite de Salud Alcanzado
              </div>
            )}
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-16 h-16 -rotate-90 overflow-visible" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r={radius} stroke="currentColor" strokeWidth="5" fill="transparent" className="text-slate-800" />
                <circle 
                  cx="32" 
                  cy="32" 
                  r={radius} 
                  stroke="currentColor" 
                  strokeWidth="5" 
                  fill="transparent" 
                  strokeDasharray={dashArray} 
                  strokeDashoffset={dashOffset} 
                  className="text-emerald-500 transition-all duration-1000 stroke-round" 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black">{progressPercent.toFixed(0)}%</div>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Meta: {profile.goal.replace('_', ' ')}</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-black text-emerald-400">{totals.calories.toFixed(0)}</p>
                <p className="text-slate-400 text-sm font-bold">/ {stats.targetCalories.toFixed(0)} kcal</p>
              </div>
              <p className={`text-[10px] font-black uppercase mt-1 ${caloriesLeft > 0 ? 'text-slate-400' : 'text-rose-400'}`}>
                {caloriesLeft > 0 ? `${caloriesLeft.toFixed(0)} kcal restantes` : 'Límite diario superado'}
              </p>
            </div>
          </div>
        )}
      </div>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            {stats?.isExerciseDay ? 'Gasto con Actividad' : 'Gasto en Reposo'}
          </p>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-black text-slate-900">{stats.tdee.toFixed(0)}</p>
            <span className="text-xs font-bold text-slate-400">kcal/día</span>
          </div>
          <p className="text-[10px] font-medium text-slate-500 mt-auto pt-4">
            {stats?.isExerciseDay 
              ? 'Multiplicador aplicado por entrenamiento' 
              : 'Nivel basal sin actividad extra'}
          </p>
        </div>
        
        <MacroCard 
          label="Proteína" 
          current={totals.protein} 
          target={stats.targetProtein} 
          colorClass="bg-emerald-500" 
          subtitle="Mantenimiento muscular" 
        />
        
        <MacroCard 
          label="Carbohidratos" 
          current={totals.carbs} 
          target={stats.targetCarbs} 
          colorClass="bg-blue-500" 
          subtitle={stats?.isExerciseDay ? "Energía para entrenar" : "Energía base"}
        />
        
        <MacroCard 
          label="Grasas" 
          current={totals.fat} 
          target={stats.targetFat} 
          colorClass="bg-amber-500" 
          subtitle="Salud hormonal" 
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-6">¿Qué comiste?</h3>
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Hora</label>
                  <input type="time" value={mealTime} onChange={(e) => setMealTime(e.target.value)} className={inputClasses} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Momento</label>
                  <select value={mealType} onChange={(e) => setMealType(e.target.value as MealEntry['type'])} className={inputClasses}>
                    <option value="desayuno">Desayuno</option>
                    <option value="almuerzo">Almuerzo</option>
                    <option value="cena">Cena</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Alimento y Descripción</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: 2 huevos revueltos con 1 tostada" className={inputClasses} required />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Cantidad (Opcional)</label>
                <input type="text" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Ej: 150g o 2 piezas" className={inputClasses} />
              </div>
              <button type="submit" disabled={loading || !description.trim()} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-emerald-600 transition-all shadow-xl shadow-slate-100 disabled:opacity-50 uppercase tracking-widest">
                {loading ? 'Analizando con IA...' : 'Registrar Alimento'}
              </button>
            </form>
          </section>

          <section className="space-y-4">
            <h3 className="text-2xl font-black text-slate-900">Registros de Comida</h3>
            {selectedMeals.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 text-slate-400 font-bold italic">
                No hay registros hoy. ¡Añade tu primera comida!
              </div>
            ) : (
              <div className="grid gap-4">
                {selectedMeals.map(meal => (
                  <div key={meal.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-emerald-300 transition-all">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner
                        ${meal.type === 'desayuno' ? 'bg-amber-50 text-amber-600' : 
                          meal.type === 'almuerzo' ? 'bg-blue-50 text-blue-600' :
                          meal.type === 'cena' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
                        {meal.type === 'desayuno' ? '🍳' : meal.type === 'almuerzo' ? '🥗' : meal.type === 'cena' ? '🍛' : '🍎'}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">{meal.time}</span>
                          <h4 className="font-black text-slate-800 text-lg capitalize">{meal.description}</h4>
                        </div>
                        <div className="flex gap-4 text-[10px] font-black uppercase mt-2 tracking-widest">
                          <span className="text-emerald-600">{meal.nutrition.calories} KCAL</span>
                          <span className="text-emerald-500">P: {meal.nutrition.protein}G</span>
                          <span className="text-blue-500">C: {meal.nutrition.carbs}G</span>
                          <span className="text-amber-500">G: {meal.nutrition.fat}G</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => onDeleteMeal(meal.id)} className="p-3 text-rose-400 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100 bg-rose-50 rounded-xl">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Distribución Calórica</h3>
            <div className="w-full h-56 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={macroData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={8} dataKey="value">
                    {macroData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {macroData.map(m => (
                <div key={m.name} className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full mb-1" style={{ backgroundColor: m.color }}></div>
                  <span className="text-[9px] font-black uppercase text-slate-500">{m.name}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-4">Notas Personales</h3>
            <textarea
              value={notes}
              onChange={(e) => onUpdateNote(selectedDate, e.target.value)}
              placeholder="¿Cómo te sentiste hoy? Ej: Dormí bien, digestión ligera..."
              className="w-full h-40 p-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
