import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { JournalPortal } from './components/JournalPortal';
import Dashboard from './components/Dashboard'; 
const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [activeJournal, setActiveJournal] = useState<string | null>(null);
  useEffect(() => {
    // 1. Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    // 2. Escuchar cambios de sesión (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) setActiveJournal(null); // Si sale, reseteamos el Hub
    });
    return () => subscription.unsubscribe();
  }, []);
  // VISTA A: Login/Registro
  if (!session) {
    return <JournalPortal onJournalSelect={(id) => setActiveJournal(id)} />;
  }
  // VISTA B: El HUB (Si está logueado pero no ha elegido app)
  if (!activeJournal) {
    return <JournalPortal onJournalSelect={(id) => setActiveJournal(id)} />;
  }
  // VISTA C: Nutri Journal Activo
  if (activeJournal === 'nutri') {
    return (
      <div className="animate-in fade-in duration-700">
        <Dashboard />
        {/* Botón flotante para volver al Hub si quieres */}
        <button 
          onClick={() => setActiveJournal(null)}
          style={{
            position: 'fixed', bottom: '20px', right: '20px',
            backgroundColor: '#1e293b', color: 'white', padding: '10px 20px',
            borderRadius: '40px', border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer', zIndex: 1000
          }}
        >
          Volver al Hub
        </button>
      </div>
    );
  }
  return <div>Cargando ecosistema JOURNAL...</div>;
};
export default App;
