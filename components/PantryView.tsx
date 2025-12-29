
import React, { useState, useRef } from 'react';
import { PantryItem, MealPlanSession, GeneratedMealPlan } from '../types';

interface PantryViewProps {
  pantry: PantryItem[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
  onGenerate: () => Promise<void>;
  onDeleteSession: (id: string) => void;
  isGenerating: boolean;
  planHistory: MealPlanSession[];
}

const PantryView: React.FC<PantryViewProps> = ({ pantry, onAdd, onRemove, onGenerate, onDeleteSession, isGenerating, planHistory }) => {
  const [newItem, setNewItem] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(planHistory.length > 0 ? planHistory[0].id : null);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    onAdd(newItem.trim());
    setNewItem('');
  };

  const activeSession = planHistory.find(s => s.id === selectedSessionId) || (planHistory.length > 0 ? planHistory[0] : null);
  const mealPlan = activeSession?.plan || null;

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
      setActiveCategoryIndex(index);
    }
  };

  const categories = mealPlan ? [
    { title: 'Desayunos Intercambiables', icon: '🍳', list: mealPlan.desayunos, color: 'emerald' },
    { title: 'Snacks Balanceados', icon: '🍎', list: mealPlan.snacks, color: 'rose' },
    { title: 'Almuerzos Poderosos', icon: '🥗', list: mealPlan.almuerzos, color: 'blue' },
    { title: 'Cenas Ligeras', icon: '🍛', list: mealPlan.cenas, color: 'indigo' }
  ] : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">👨‍🍳</span> NutriChef
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Añadir ingredientes:</p>
            <form onSubmit={handleAdd} className="flex gap-2 mb-6">
              <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Ej: Pollo, Quinoa..." className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500" />
              <button type="submit" className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-emerald-600 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              </button>
            </form>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 no-scrollbar border-b border-slate-100 pb-4">
              {pantry.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group hover:bg-emerald-50 transition-all">
                  <span className="font-bold text-slate-900">{item.name}</span>
                  <button onClick={() => onRemove(item.id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
            <button onClick={onGenerate} disabled={isGenerating || pantry.length === 0} className="w-full mt-6 bg-emerald-600 text-white py-4 rounded-[30px] font-black hover:bg-emerald-700 disabled:opacity-50 uppercase tracking-widest text-xs">
              {isGenerating ? 'IA Cocinando...' : 'Generar Nuevo Menú'}
            </button>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Historial de Menús</h4>
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 no-scrollbar">
              {planHistory.map(session => (
                <div key={session.id} className="relative group">
                  <button onClick={() => setSelectedSessionId(session.id)} className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedSessionId === session.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-slate-200 bg-slate-50'}`}>
                    <p className={`text-xs font-black ${selectedSessionId === session.id ? 'text-emerald-700' : 'text-slate-600'}`}>{session.date}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 truncate">{session.pantrySnapshot.length} ingredientes</p>
                  </button>
                  <button 
                    onClick={() => onDeleteSession(session.id)}
                    className="absolute top-2 right-2 p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6 flex flex-col min-h-0">
          {!mealPlan ? (
            <div className="h-full min-h-[500px] bg-slate-100/50 rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-sm mb-6 animate-bounce">🥘</div>
              <h4 className="text-xl font-black text-slate-800">NutriChef IA</h4>
              <p className="text-slate-500 font-medium max-w-sm mt-2">Agrega ingredientes a tu despensa para generar menús infinitos personalizados.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 flex flex-col h-full">
              <div className="bg-amber-50 border border-amber-100 p-8 rounded-[40px] shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-amber-800 font-black flex items-center gap-2">🛒 Sugerencias de Compra</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mealPlan.sugerenciasCompra.map((sug, i) => (
                    <span key={i} className="bg-white px-4 py-2 rounded-full text-xs font-black text-amber-700 shadow-sm border border-amber-200">+ {sug}</span>
                  ))}
                </div>
              </div>

              <div className="relative group flex-1">
                <div ref={scrollRef} className="flex overflow-x-hidden snap-x snap-mandatory no-scrollbar scroll-smooth w-full">
                  {categories.map((cat, idx) => (
                    <div key={cat.title} className="min-w-full snap-center">
                      <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                          <h5 className={`text-${cat.color}-600 font-black flex items-center gap-2 uppercase text-[10px] tracking-widest`}>
                            <span className="text-2xl">{cat.icon}</span> {cat.title}
                          </h5>
                          <div className="bg-slate-50 px-4 py-1.5 rounded-full text-[10px] font-black text-slate-400">PÁGINA {idx + 1} DE 4</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 flex-1 overflow-y-auto no-scrollbar">
                          {cat.list.map((meal, mIdx) => (
                            <div key={mIdx} className="p-4 bg-slate-50 rounded-2xl text-[11px] font-bold text-slate-900 leading-relaxed border border-transparent hover:border-slate-200 transition-all flex items-start gap-3">
                              <span className={`text-${cat.color}-500 mt-0.5 bg-white w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-sm text-[9px]`}>{String(mIdx + 1).padStart(2, '0')}</span> 
                              <span>{meal}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center items-center gap-4 mt-6">
                   <button onClick={() => scrollToIndex(Math.max(0, activeCategoryIndex - 1))} disabled={activeCategoryIndex === 0} className="w-12 h-12 bg-white shadow-md rounded-2xl flex items-center justify-center border border-slate-100 text-slate-400 hover:text-emerald-500 disabled:opacity-30 transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <div className="flex gap-2">
                    {categories.map((_, i) => (
                      <button key={i} onClick={() => scrollToIndex(i)} className={`transition-all duration-300 rounded-full ${activeCategoryIndex === i ? 'w-8 h-2 bg-emerald-500' : 'w-2 h-2 bg-slate-200'}`} />
                    ))}
                  </div>
                  <button onClick={() => scrollToIndex(Math.min(3, activeCategoryIndex + 1))} disabled={activeCategoryIndex === 3} className="w-12 h-12 bg-white shadow-md rounded-2xl flex items-center justify-center border border-slate-100 text-slate-400 hover:text-emerald-500 disabled:opacity-30 transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PantryView;
