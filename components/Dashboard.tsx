
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
  stats: any;
}

const Dashboard: React.FC<DashboardProps> = ({ meals, onAddMeal, onDeleteMeal, profile, selectedDate, notes, onUpdateNote, stats }) => {
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

  const inputClasses = "w-full px-4 py-3 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition text-slate-900 font-bold placeholder:text-slate-400";

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const target = stats?.targetCalories || 2000;
  const caloriesLeft = Math.max(0, target - totals.calories);
  const progressPercent = Math.min(100, (totals.calories / target) * 100);
  // Reducimos el radio a 22 para que no toque los bordes del contenedor de 64px
  const radius = 22;
  const dashArray = 2 * Math.PI * radius;
  const dashOffset = dashArray - (dashArray * progressPercent / 100);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 capitalize">{formatDate(selectedDate)}</h2>
          <p className="text-slate-500 font-bold">{isToday ? 'Estás en el camino correcto' : 'Revisión histórica'}</p>
        </div>
        {stats && (
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl flex items-center gap-6 min-w-[280px]">
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
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Meta Diaria</p>
              <p className="text-2xl font-black">{stats.targetCalories.toFixed(0)} <span className="text-xs">kcal</span></p>
              <p className="text-xs font-bold text-emerald-400">Faltan {caloriesLeft.toFixed(0)} kcal</p>
            </div>
          </div>
        )}
      </div>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Metabolismo Basal (TMB)</p>
          <p className="text-2xl font-black text-slate-900">{stats.bmr.toFixed(0)} <span className="text-xs">kcal</span></p>
          <p className="text-xs font-medium text-slate-500 mt-1">Gasto en reposo total</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gasto Total (TDEE)</p>
          <p className="text-2xl font-black text-slate-900">{stats.tdee.toFixed(0)} <span className="text-xs">kcal</span></p>
          <p className="text-xs font-medium text-slate-500 mt-1">Incluyendo actividad física</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Proteína Hoy</p>
          <p className="text-2xl font-black text-emerald-600">{totals.protein.toFixed(1)} <span className="text-xs">g</span></p>
          <p className="text-xs font-medium text-slate-500 mt-1">Recuperación muscular</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Carbohidratos</p>
          <p className="text-2xl font-black text-blue-600">{totals.carbs.toFixed(1)} <span className="text-xs">g</span></p>
          <p className="text-xs font-medium text-slate-500 mt-1">Fuente de energía</p>
        </div>
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
              <button type="submit" disabled={loading || !description.trim()} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 disabled:opacity-50">
                {loading ? 'Analizando con IA...' : 'REGISTRAR ALIMENTO'}
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
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Macros del Día</h3>
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
              placeholder="¿Cómo te sentiste? ¿Digestión pesada? ¿Mucha energía?..."
              className="w-full h-40 p-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
