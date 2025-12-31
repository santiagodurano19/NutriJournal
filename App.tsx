import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { JournalPortal } from './components/JournalPortal';
import Dashboard from './components/Dashboard'; // Aquí está tu código original

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [activeJournal, setActiveJournal] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Esta es la función que activa el botón "Entrar ahora"
  const handleSelect = (id: string) => {
    setActiveJournal(id);
  };

  // 1. Si no hay login, mostramos Portal
  if (!session) {
    return <JournalPortal onJournalSelect={handleSelect} />;
  }

  // 2. Si hay login pero está en el HUB, mostramos el Portal en modo Hub
  if (!activeJournal) {
    return <JournalPortal onJournalSelect={handleSelect} />;
  }

  // 3. SI ELIGIÓ NUTRI, CARGAMOS TU APP ORIGINAL (DASHBOARD)
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

  return <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>Cargando ecosistema...</div>;
};

export default App;
