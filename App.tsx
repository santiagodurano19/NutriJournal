import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { JournalPortal } from './components/JournalPortal';
import Dashboard from './components/Dashboard'; 

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [activeJournal, setActiveJournal] = useState<string | null>(null);

  useEffect(() => {
    // Escuchamos la sesión de Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 1. Si NO hay sesión, mostramos el Portal (Registro/Login)
  if (!session) {
    return <JournalPortal onJournalSelect={(id) => setActiveJournal(id)} />;
  }

  // 2. Si hay sesión pero aún NO elige un Journal, mostramos el Portal en vista HUB
  if (!activeJournal) {
    return <JournalPortal onJournalSelect={(id) => setActiveJournal(id)} />;
  }

  // 3. Si eligió NutriJournal, mostramos el Dashboard
  if (activeJournal === 'nutri') {
    return <Dashboard />;
  }

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: 'white', padding: '40px', textAlign: 'center' }}>
      <h1>Cargando Ecosistema JOURNAL...</h1>
    </div>
  );
};

export default App;
