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
      if (!session) setActiveJournal(null); 
    });

    return () => subscription.unsubscribe();
  }, []);

  // VISTA A: Login/Registro (Si no hay sesión)
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
      <div className="animate-in fade-in duration-700" style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
        <Dashboard />
        {/* Botón flotante premium para volver al Hub */}
        <button 
          onClick={() => setActiveJournal(null)}
          style={{
            position: 'fixed', bottom: '32px', right: '32px',
            backgroundColor: 'rgba(30, 41, 59, 0.8)', color: 'white', 
            padding: '12px 24px', borderRadius: '40px', 
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer', zIndex: 1000, backdropFilter: 'blur(10px)',
            fontWeight: '600', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}
        >
          ← Volver al Hub
        </button>
      </div>
    );
  }

  return <div style={{ color: 'white', textAlign: 'center', padding: '100px' }}>Cargando ecosistema...</div>;
};

export default App;
