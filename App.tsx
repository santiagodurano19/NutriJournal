import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, MealEntry, Measurement, PantryItem, MealPlanSession, CoachHistoryEntry } from './types';
import ProfileForm from './components/ProfileForm';
import Dashboard from './components/Dashboard';
import HistoryView from './components/HistoryView';
import MeasurementsView from './components/MeasurementsView';
import PantryView from './components/PantryView';
import { analyzeMeal, getCoachAdvice, getDailyAnalysis, generatePantryMenu } from './services/geminiService';

// --- NUEVAS IMPORTACIONES PARA EL ECOSISTEMA JOURNAL ---
import { supabase } from './services/supabaseClient';
import { Auth } from './components/Auth';

// Componente para formatear el texto de la IA
const FormattedResponse: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-4">
      {lines.map((line, i) => {
        if (line.startsWith('#')) return <h3 key={i} className="text-xl font-black text-slate-900 mt-6 mb-2">{line.replace(/#/g, '').trim()}</h3>;
        if (line.startsWith('* ') || line.startsWith('- ')) return <li key={i} className="ml-4 text-slate-700 list-disc font-medium">{line.substring(2)}</li>;
        
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={i} className="text-slate-700 leading-relaxed font-medium">
            {parts.map((part, j) => 
              part.startsWith('**') && part.endsWith('**') 
                ? <strong key={j} className="text-slate-900 font-black">{part.slice(2, -2)}</strong> 
                : part
            )}
          </p>
        );
      })}
    </div>
  );
};

// Sistema de Notificaciones Toast
const ToastContainer: React.FC<{ toasts: { id: string, message: string }[] }> = ({ toasts }) => (
  <div className="fixed top-24 right-6 z-[100] space-y-3 pointer-events-none">
    {toasts.map(toast => (
      <div key={toast.id} className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full duration-300 font-black text-xs uppercase tracking-widest border border-slate-700">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        {toast.message}
      </div>
    ))}
  </div>
);

const App: React.FC = () => {
  // --- ESTADO DE SESIÓN (NUEVO) ---
  const [session, setSession] = useState<any>(null);

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('nutri_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [meals, setMeals] = useState<MealEntry[]>(() => {
    const saved = localStorage.getItem('nutri_meals');
    return saved ? JSON.parse(saved) : [];
  });

  const [measurements, setMeasurements] = useState<Measurement[]>(() => {
    const saved = localStorage.getItem('nutri_measurements');
    return saved ? JSON.parse(saved) : [];
  });

  const [pantry, setPantry] = useState<PantryItem[]>(() => {
    const saved = localStorage.getItem('nutri_pantry');
    return saved ? JSON.parse(saved) : [];
  });

  const [planHistory, setPlanHistory] = useState<MealPlanSession[]>(() => {
    const saved = localStorage.getItem('nutri_plan_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [coachHistory, setCoachHistory] = useState<CoachHistoryEntry[]>(() => {
    const saved = localStorage.getItem('nutri_coach_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [dailyNotes, setDailyNotes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('nutri_daily_notes');
    return saved ? JSON.parse(saved) : {};
  });

  const [toasts, setToasts] = useState<{ id: string, message: string }[]>([]);
  const [isExerciseDay, setIsExerciseDay] = useState(false);
  const [activeTab, setActiveTab] = useState<'journal' | 'progress' | 'coach' | 'profile' | 'history' | 'nutrichef'>('journal');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isCoaching, setIsCoaching] = useState(false);
  const [selectedCoachEntryId, setSelectedCoachEntryId] = useState<string | null>(null);

  // --- EFECTO DE AUTENTICACIÓN (NUEVO) ---
  useEffect(() => {
    // 1. Obtener sesión actual al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Escuchar cambios (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (profile) localStorage.setItem('nutri_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('nutri_meals', JSON.stringify(meals));
    localStorage.setItem('nutri_measurements', JSON.stringify(measurements));
    localStorage.setItem('nutri_pantry', JSON.stringify(pantry));
    localStorage.setItem('nutri_plan_history', JSON.stringify(planHistory));
    localStorage.setItem('nutri_coach_history', JSON.stringify(coachHistory));
    localStorage.setItem('nutri_daily_notes', JSON.stringify(dailyNotes));
  }, [meals, measurements, pantry, planHistory, coachHistory, dailyNotes]);

  const addToast = (message: string) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const stats = useMemo(() => {
    if (!profile) return null;
    let bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age);
    bmr = profile.gender === 'masculino' ? bmr + 5 : bmr - 161;
    const activityMultipliers = { sedentario: 1.2, ligero: 1.375, moderado: 1.55, intenso: 1.725, atleta: 1.9 };
    let tdee = bmr * activityMultipliers[profile.activityLevel];
    if (isExerciseDay) tdee *= 1.15;
    let targetCalories = tdee;
    if (profile.goal === 'perder_peso') targetCalories = tdee - ((profile.weightLossTarget || 2) * 7700 / 30);
    else if (profile.goal === 'ganar_musculo') targetCalories = tdee + ((profile.weightGainTarget || 1) * 7700 / 30);
    const targetProtein = profile.weight * 2.2; 
    const targetFat = profile.weight * 0.8;
    const targetCarbs = Math.max(0, (targetCalories - (targetProtein * 4) - (targetFat * 9)) / 4);
    return { bmr, tdee, targetCalories, targetProtein, targetFat, targetCarbs, isExerciseDay };
  }, [profile, isExerciseDay]);

  const handleAddMeal = async (type: MealEntry['type'], description: string, time: string) => {
    const nutrition = await analyzeMeal(description);
    setMeals(prev => [{id: crypto.randomUUID(), date: selectedDate, time, type, description, nutrition}, ...prev]);
    addToast("Comida registrada");
  };

  const handleEditMeal = async (id: string, updates: Partial<MealEntry>) => {
    let newNutrition = undefined;
    if (updates.description) newNutrition = await analyzeMeal(updates.description);
    setMeals(prev => prev.map(m => m.id === id ? { ...m, ...updates, nutrition: newNutrition || m.nutrition } : m));
    addToast("Registro actualizado");
  };

  const handleGenerateMenu = async () => {
    if (!profile || pantry.length === 0) return;
    setIsCoaching(true);
    try {
      const plan = await generatePantryMenu(profile, pantry, stats);
      const newSession: MealPlanSession = { id: crypto.randomUUID(), date: new Date().toLocaleString(), pantrySnapshot: pantry.map(i => i.name), plan };
      setPlanHistory(prev => [newSession, ...prev]);
      addToast("Menú NutriChef listo");
    } finally { setIsCoaching(false); }
  };

  const handleGetCoachAdvice = async () => {
    setIsCoaching(true);
    try {
      const advice = await getCoachAdvice(profile!, meals);
      const newEntry: CoachHistoryEntry = { id: crypto.randomUUID(), date: new Date().toLocaleString(), queryType: 'advice', content: advice };
      setCoachHistory(prev => [newEntry, ...prev]);
      setSelectedCoachEntryId(newEntry.id);
      addToast("Consejo estratégico generado");
    } finally { setIsCoaching(false); }
  };

  const handleGetDailyAnalysis = async () => {
    setIsCoaching(true);
    try {
      const analysis = await getDailyAnalysis(selectedDate, meals.filter(m => m.date === selectedDate), stats, profile!);
      const newEntry: CoachHistoryEntry = { id: crypto.randomUUID(), date: new Date().toLocaleString(), queryType: 'analysis', content: analysis };
      setCoachHistory(prev => [newEntry, ...prev]);
      setSelectedCoachEntryId(newEntry.id);
      addToast("Análisis diario completo");
      setActiveTab('coach');
    } finally { setIsCoaching(false); }
  };

  const activeCoachEntry = coachHistory.find(e => e.id === selectedCoachEntryId) || coachHistory[0] || null;

  const navItemClass = (tab: string) => `px-4 py-2 rounded-xl text-sm font-bold transition-all ${
    activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
  }`;

  // --- LÓGICA DE RENDERIZADO CONDICIONAL (EL FILTRO DE SEGURIDAD) ---
  
  // 1. Si no hay sesión, obligamos a registrarse/loguearse
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Auth />
      </div>
    );
  }

  // 2. Si el usuario está logueado pero no tiene perfil de NutriJournal creado aún (en localStorage)
  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
        <ProfileForm onSave={(p) => { setProfile(p); addToast("Perfil guardado"); }} initialData={null} />
      </div>
    );
  }

  // 3. Si todo está en orden (Sesión + Perfil), mostramos la app completa
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <ToastContainer toasts={toasts} />
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4">
        <div className="max-w-6xl mx-auto h-20 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-3 shrink-0 mr-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-emerald-100">N</div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">NUTRIJOURNAL</span>
          </div>
          <nav className="flex items-center gap-1">
            <button onClick={() => setActiveTab('journal')} className={navItemClass('journal')}>Diario</button>
            <button onClick={() => setActiveTab('history')} className={navItemClass('history')}>Calendario</button>
            <button onClick={() => setActiveTab('nutrichef')} className={navItemClass('nutrichef')}>NutriChef</button>
            <button onClick={() => setActiveTab('progress')} className={navItemClass('progress')}>Progreso</button>
            <button onClick={() => setActiveTab('profile')} className={navItemClass('profile')}>Perfil</button>
            <button onClick={() => setActiveTab('coach')} className={navItemClass('coach')}>Coach IA</button>
            {/* Botón de Cerrar Sesión */}
            <button 
              onClick={() => supabase.auth.signOut()} 
              className="ml-4 px-4 py-2 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all"
            >
              Salir
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {activeTab === 'journal' && (
          <Dashboard 
            meals={meals} profile={profile} selectedDate={selectedDate} stats={stats}
            onAddMeal={handleAddMeal} onEditMeal={handleEditMeal}
            onDeleteMeal={(id) => { setMeals(m => m.filter(x => x.id !== id)); addToast("Registro eliminado"); }}
            onToggleExercise={() => { setIsExerciseDay(!isExerciseDay); addToast(isExerciseDay ? "Día de descanso" : "Día de entrenamiento"); }}
            onUpdateNote={(date, content) => { setDailyNotes(prev => ({ ...prev, [date]: content })); addToast("Notas guardadas"); }}
            notes={dailyNotes[selectedDate] || ''}
            onAnalyzeDay={handleGetDailyAnalysis} isAnalyzing={isCoaching}
          />
        )}
        {activeTab === 'history' && <HistoryView meals={meals} selectedDate={selectedDate} onSelectDate={(date) => { setSelectedDate(date); setActiveTab('journal'); }} />}
        {activeTab === 'nutrichef' && (
          <PantryView 
            pantry={pantry} onAdd={(item) => { setPantry(prev => [...prev, {id: crypto.randomUUID(), name: item, category: 'General'}]); addToast("Ingrediente añadido"); }}
            onRemove={(id) => { setPantry(prev => prev.filter(i => i.id !== id)); addToast("Ingrediente eliminado"); }}
            onGenerate={handleGenerateMenu} onDeleteSession={(id) => { setPlanHistory(prev => prev.filter(s => s.id !== id)); addToast("Sesión eliminada"); }}
            isGenerating={isCoaching} planHistory={planHistory}
          />
        )}
        {activeTab === 'progress' && <MeasurementsView history={measurements} onAdd={(m) => { setMeasurements(prev => [...prev, {...m, id: crypto.randomUUID()}]); addToast("Métricas guardadas"); }} onDelete={(id) => { setMeasurements(prev => prev.filter(x => x.id !== id)); addToast("Métricas eliminadas"); }} gender={profile.gender} />}
        {activeTab === 'profile' && <ProfileForm onSave={(p) => { setProfile(p); addToast("Perfil actualizado"); }} initialData={profile} />}
        {activeTab === 'coach' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">✨ Consultorio</h3>
                <button 
                  onClick={handleGetCoachAdvice} 
                  disabled={isCoaching}
                  className="w-full bg-emerald-600 text-white py-4 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 disabled:opacity-50 shadow-xl shadow-emerald-100"
                >
                  {isCoaching ? 'Procesando...' : 'Nueva Consulta'}
                </button>
              </div>

              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Consultas Previas</h4>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                  {coachHistory.map(entry => (
                    <div key={entry.id} className="relative group">
                      <button 
                        onClick={() => setSelectedCoachEntryId(entry.id)} 
                        className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedCoachEntryId === entry.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-slate-200 bg-slate-50'}`}
                      >
                        <p className={`text-[10px] font-black uppercase tracking-widest ${selectedCoachEntryId === entry.id ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {entry.queryType === 'advice' ? 'Estrategia' : 'Análisis'}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold mt-1">{entry.date}</p>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6">
              {isCoaching ? (
                 <div className="bg-white p-10 rounded-[40px] flex flex-col items-center justify-center space-y-4 animate-pulse">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-2xl">⚡</div>
                    <p className="font-black text-slate-400 uppercase tracking-widest text-xs">El Coach está redactando tu respuesta...</p>
                 </div>
              ) : activeCoachEntry && (
                <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm animate-in slide-in-from-right-4 duration-500 min-h-[600px]">
                  <FormattedResponse text={activeCoachEntry.content} />
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
