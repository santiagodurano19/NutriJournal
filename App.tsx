import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { JournalPortal } from './components/JournalPortal';
import Dashboard from './components/Dashboard'; 

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [activeJournal, setActiveJournal] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) setActiveJournal(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // VISTA A: No hay sesión
  if (!session) {
    return <JournalPortal onJournalSelect={(id) => setActiveJournal(id)} />;
  }

  // VISTA B: Hay sesión pero está en el HUB
  if (!activeJournal) {
    return <JournalPortal onJournalSelect={(id) => setActiveJournal(id)} />;
  }

  // VISTA C: Nutri Journal cargado
  if (activeJournal === 'nutri') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
        <Dashboard />
        <button 
          onClick={() => setActiveJournal(null)}
          style={{ position: 'fixed', bottom: '24px', right: '24px', padding: '12px 24px', borderRadius: '40px', backgroundColor: '#1e293b', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', zIndex: 1000, fontWeight: '600' }}
        >
          ← Volver al Hub
        </button>
      </div>
    );
  }

  return <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>Cargando ecosistema JOURNAL...</div>;
};

export default App;
