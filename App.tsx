
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UserProfile, MealEntry, Measurement } from './types';
import ProfileForm from './components/ProfileForm';
import Dashboard from './components/Dashboard';
import HistoryView from './components/HistoryView';
import MeasurementsView from './components/MeasurementsView';
import { analyzeMeal, getCoachAdvice } from './services/geminiService';

const App: React.FC = () => {
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

  const [dailyNotes, setDailyNotes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('nutri_notes');
    return saved ? JSON.parse(saved) : {};
  });

  const [activeTab, setActiveTab] = useState<'journal' | 'progress' | 'coach' | 'profile' | 'history'>('journal');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [coachFeedback, setCoachFeedback] = useState<string>('');
  const [isCoaching, setIsCoaching] = useState(false);

  useEffect(() => {
    if (profile) localStorage.setItem('nutri_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('nutri_meals', JSON.stringify(meals));
    localStorage.setItem('nutri_measurements', JSON.stringify(measurements));
    localStorage.setItem('nutri_notes', JSON.stringify(dailyNotes));
  }, [meals, measurements, dailyNotes]);

  // Cálculos de Metabolismo (Mifflin-St Jeor)
  const stats = useMemo(() => {
    if (!profile) return null;
    let bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age);
    bmr = profile.gender === 'masculino' ? bmr + 5 : bmr - 161;

    const activityMultipliers = {
      sedentario: 1.2,
      ligero: 1.375,
      moderado: 1.55,
      intenso: 1.725,
      atleta: 1.9
    };
    const tdee = bmr * activityMultipliers[profile.activityLevel];
    
    let targetCalories = tdee;
    if (profile.goal === 'perder_peso') {
      const kgTarget = profile.weightLossTarget || 2; 
      const dailyDeficit = (kgTarget * 7700) / 30;
      targetCalories = tdee - dailyDeficit;
    } else if (profile.goal === 'ganar_musculo') {
      const kgTarget = profile.weightGainTarget || 1;
      const dailySurplus = (kgTarget * 7700) / 30;
      targetCalories = tdee + dailySurplus;
    }

    return { bmr, tdee, targetCalories: Math.max(targetCalories, 1200) };
  }, [profile]);

  const handleAddMeal = async (type: MealEntry['type'], description: string, time: string) => {
    try {
      const nutrition = await analyzeMeal(description);
      const newMeal: MealEntry = {
        id: crypto.randomUUID(),
        date: selectedDate,
        time,
        type,
        description,
        nutrition,
      };
      setMeals(prev => [newMeal, ...prev]);
    } catch (err) {
      alert("Error analizando la comida.");
    }
  };

  const handleAddMeasurement = (m: Omit<Measurement, 'id'>) => {
    const newM = { ...m, id: crypto.randomUUID() };
    setMeasurements(prev => [...prev, newM]);
    if (m.date === new Date().toISOString().split('T')[0] && profile) {
      setProfile({ ...profile, weight: m.weight, bodyFat: m.bodyFat });
    }
  };

  const handleUpdateNote = (date: string, content: string) => {
    setDailyNotes(prev => ({ ...prev, [date]: content }));
  };

  const generateAdvice = useCallback(async () => {
    if (!profile) return;
    setIsCoaching(true);
    setActiveTab('coach');
    try {
      const advice = await getCoachAdvice(profile, meals, measurements);
      setCoachFeedback(advice);
    } catch (err) {
      alert("No se pudo obtener el consejo.");
    } finally {
      setIsCoaching(false);
    }
  }, [profile, meals, measurements]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-2">NUTRI JOURNAL AI</h1>
            <p className="text-slate-500 font-medium">Configura tu perfil para comenzar</p>
          </div>
          <ProfileForm onSave={setProfile} initialData={null} />
        </div>
      </div>
    );
  }

  const navItemClass = (tab: string) => `px-4 py-2 rounded-xl text-sm font-bold transition-all ${
    activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
  }`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4">
        <div className="max-w-6xl mx-auto h-20 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-3 shrink-0 mr-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-emerald-200">N</div>
            <span className="text-xl font-black text-slate-900 tracking-tighter hidden sm:block">NUTRIJOURNAL</span>
          </div>
          
          <nav className="flex items-center gap-1">
            <button onClick={() => setActiveTab('journal')} className={navItemClass('journal')}>Diario</button>
            <button onClick={() => setActiveTab('history')} className={navItemClass('history')}>Calendario</button>
            <button onClick={() => setActiveTab('progress')} className={navItemClass('progress')}>Progreso</button>
            <button onClick={() => setActiveTab('profile')} className={navItemClass('profile')}>Perfil</button>
            <button 
              onClick={generateAdvice} 
              disabled={isCoaching}
              className={`ml-2 px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'coach' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              } disabled:opacity-50`}
            >
              {isCoaching ? '...' : 'Coach IA'}
              {!isCoaching && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {activeTab === 'journal' && (
          <Dashboard 
            meals={meals} 
            onAddMeal={handleAddMeal} 
            onDeleteMeal={(id) => setMeals(m => m.filter(x => x.id !== id))}
            profile={profile}
            selectedDate={selectedDate}
            notes={dailyNotes[selectedDate] || ''}
            onUpdateNote={handleUpdateNote}
            stats={stats}
          />
        )}
        {activeTab === 'history' && (
          <HistoryView meals={meals} onSelectDate={(d) => { setSelectedDate(d); setActiveTab('journal'); }} selectedDate={selectedDate} />
        )}
        {activeTab === 'progress' && (
          <MeasurementsView 
            history={measurements} 
            onAdd={handleAddMeasurement} 
            onDelete={(id) => setMeasurements(m => m.filter(x => x.id !== id))}
            gender={profile.gender}
          />
        )}
        {activeTab === 'profile' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Mi Perfil Nutricional</h2>
            <ProfileForm onSave={setProfile} initialData={profile} />
          </div>
        )}
        {activeTab === 'coach' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Asesoría de tu Coach IA</h2>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[400px]">
              {isCoaching ? (
                <div className="flex flex-col items-center justify-center h-full py-20 space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
                  <p className="text-slate-500 font-bold">Analizando tus datos y preparando consejos...</p>
                </div>
              ) : (
                <div className="prose prose-slate max-w-none text-slate-900">
                  {coachFeedback ? coachFeedback.split('\n').map((line, i) => (
                    <p key={i} className={`mb-4 ${line.startsWith('#') || line.toUpperCase().includes('ANALISIS') ? 'font-black text-xl text-emerald-600 mt-8 first:mt-0' : 'font-medium'}`}>{line}</p>
                  )) : (
                    <div className="text-center py-20">
                      <p className="text-slate-400 italic mb-6">Aún no hay un análisis generado.</p>
                      <button onClick={generateAdvice} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold">Generar Reporte Ahora</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      <footer className="py-12 border-t border-slate-200 text-center text-slate-400 text-sm font-medium">
        NutriJournal AI &copy; {new Date().getFullYear()} • Tu diario inteligente de salud
      </footer>
    </div>
  );
};

export default App;
