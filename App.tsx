
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UserProfile, MealEntry, Measurement, PantryItem, GeneratedMealPlan, MealPlanSession } from './types';
import ProfileForm from './components/ProfileForm';
import Dashboard from './components/Dashboard';
import HistoryView from './components/HistoryView';
import MeasurementsView from './components/MeasurementsView';
import PantryView from './components/PantryView';
import { analyzeMeal, getCoachAdvice, getDailyAnalysis, generatePantryMenu } from './services/geminiService';

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

  const [pantry, setPantry] = useState<PantryItem[]>(() => {
    const saved = localStorage.getItem('nutri_pantry');
    return saved ? JSON.parse(saved) : [];
  });

  const [planHistory, setPlanHistory] = useState<MealPlanSession[]>(() => {
    const saved = localStorage.getItem('nutri_plan_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<'journal' | 'progress' | 'coach' | 'profile' | 'history' | 'nutrichef'>('journal');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [coachFeedback, setCoachFeedback] = useState<string>('');
  const [isCoaching, setIsCoaching] = useState(false);

  useEffect(() => {
    if (profile) localStorage.setItem('nutri_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('nutri_meals', JSON.stringify(meals));
    localStorage.setItem('nutri_measurements', JSON.stringify(measurements));
    localStorage.setItem('nutri_pantry', JSON.stringify(pantry));
    localStorage.setItem('nutri_plan_history', JSON.stringify(planHistory));
  }, [meals, measurements, pantry, planHistory]);

  const stats = useMemo(() => {
    if (!profile) return null;
    let bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age);
    bmr = profile.gender === 'masculino' ? bmr + 5 : bmr - 161;
    const activityMultipliers = { sedentario: 1.2, ligero: 1.375, moderado: 1.55, intenso: 1.725, atleta: 1.9 };
    const tdee = bmr * activityMultipliers[profile.activityLevel];
    let targetCalories = tdee;
    if (profile.goal === 'perder_peso') {
      targetCalories = tdee - ((profile.weightLossTarget || 2) * 7700 / 30);
    } else if (profile.goal === 'ganar_musculo') {
      targetCalories = tdee + ((profile.weightGainTarget || 1) * 7700 / 30);
    }
    const safetyFloor = Math.max(bmr * 0.95, tdee * 0.75);
    targetCalories = Math.max(targetCalories, safetyFloor);
    return { 
      bmr, tdee, targetCalories, 
      targetProtein: profile.weight * 2.2, 
      targetFat: profile.weight * 0.8,
      targetCarbs: Math.max(0, (targetCalories - (profile.weight * 2.2 * 4) - (profile.weight * 0.8 * 9)) / 4)
    };
  }, [profile]);

  const handleGenerateMenu = async () => {
    if (!profile || pantry.length === 0) return;
    setIsCoaching(true);
    try {
      const plan = await generatePantryMenu(profile, pantry, stats);
      const newSession: MealPlanSession = {
        id: crypto.randomUUID(),
        date: new Date().toLocaleString(),
        pantrySnapshot: pantry.map(i => i.name),
        plan
      };
      setPlanHistory(prev => [newSession, ...prev]);
    } catch (err) {
      alert("Error al generar el menú con NutriChef.");
    } finally {
      setIsCoaching(false);
    }
  };

  const navItemClass = (tab: string) => `px-4 py-2 rounded-xl text-sm font-bold transition-all ${
    activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
  }`;

  if (!profile) return <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center"><ProfileForm onSave={setProfile} initialData={null} /></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4">
        <div className="max-w-6xl mx-auto h-20 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-3 shrink-0 mr-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-emerald-100">N</div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">NUTRIJOURNAL</span>
          </div>
          <nav className="flex items-center gap-1">
            <button onClick={() => setActiveTab('journal')} className={navItemClass('journal')}>Diario</button>
            <button onClick={() => setActiveTab('nutrichef')} className={navItemClass('nutrichef')}>NutriChef</button>
            <button onClick={() => setActiveTab('progress')} className={navItemClass('progress')}>Progreso</button>
            <button onClick={() => setActiveTab('profile')} className={navItemClass('profile')}>Perfil</button>
            <button onClick={() => { setIsCoaching(true); setActiveTab('coach'); getCoachAdvice(profile, meals, measurements).then(setCoachFeedback).finally(() => setIsCoaching(false)); }} className={navItemClass('coach')}>Coach IA</button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {activeTab === 'journal' && (
          <Dashboard 
            meals={meals} 
            profile={profile}
            selectedDate={selectedDate}
            stats={stats}
            onAddMeal={async (type, desc, time) => { const nutrition = await analyzeMeal(desc); setMeals(prev => [{id: crypto.randomUUID(), date: selectedDate, time, type, description: desc, nutrition}, ...prev]) }}
            onDeleteMeal={(id) => setMeals(m => m.filter(x => x.id !== id))}
            onToggleExercise={() => {}}
            onUpdateNote={() => {}}
            notes=""
            onAnalyzeDay={async () => { setIsCoaching(true); setActiveTab('coach'); getDailyAnalysis(selectedDate, meals.filter(m => m.date === selectedDate), stats).then(setCoachFeedback).finally(() => setIsCoaching(false)); }}
            isAnalyzing={isCoaching}
          />
        )}
        {activeTab === 'nutrichef' && (
          <PantryView 
            pantry={pantry} 
            onAdd={(item) => setPantry(prev => [...prev, {id: crypto.randomUUID(), name: item, category: 'General'}])}
            onRemove={(id) => setPantry(prev => prev.filter(i => i.id !== id))}
            onGenerate={handleGenerateMenu}
            isGenerating={isCoaching}
            planHistory={planHistory}
          />
        )}
        {activeTab === 'progress' && <MeasurementsView history={measurements} onAdd={(m) => setMeasurements(prev => [...prev, {...m, id: crypto.randomUUID()}])} onDelete={(id) => setMeasurements(prev => prev.filter(x => x.id !== id))} gender={profile.gender} />}
        {activeTab === 'profile' && <ProfileForm onSave={setProfile} initialData={profile} />}
        {activeTab === 'coach' && (
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-sm min-h-[400px] border border-slate-200">
            {isCoaching ? <div className="animate-pulse text-center py-20 font-bold text-slate-400">El Coach está pensando...</div> : <div className="whitespace-pre-wrap font-medium text-slate-800 leading-relaxed">{coachFeedback}</div>}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
