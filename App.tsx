import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { JournalPortal } from './components/JournalPortal';
import Dashboard from './components/Dashboard'; 

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [activeJournal, setActiveJournal] = useState<string | null>(null);

  useEffect(() => {
    // Escuchamos la sesión de Supabase
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 1. Si NO hay sesión, mostramos el Portal (Login/Registro)
  if (!session) {
    return <JournalPortal />;
  }

  // 2. Si hay sesión pero NO ha elegido un Journal, mostramos el HUB
  if (!activeJournal) {
    return <JournalPortal onSelectJournal={(id: string) => setActiveJournal(id)} />;
  }

  // 3. Si eligió NutriJournal, mostramos el Dashboard
  if (activeJournal === 'nutri') {
    return <Dashboard />;
  }

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: 'white', padding: '40px' }}>
      <h1>Cargando Ecosistema JOURNAL...</h1>
    </div>
  );
};

export default App;
