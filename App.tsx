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
      if (!session) {
        setActiveJournal(null); // Si sale, reseteamos el Hub
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Función para manejar la selección (Asegura que el nombre coincida con la Prop del Portal)
  const handleJournalSelect = (id: string) => {
    console.log("Journal seleccionado en App.tsx:", id); // Para depuración
    setActiveJournal(id);
  };

  // VISTA A: No hay sesión (Registro/Login)
  if (!session) {
    return <JournalPortal onJournalSelect={handleJournalSelect} />;
  }

  // VISTA B: Hay sesión pero NO ha elegido aplicación (Mostrar el HUB)
  if (!activeJournal) {
    return <JournalPortal onJournalSelect={handleJournalSelect} />;
  }

  // VISTA C: Nutri Journal Activo
  if (activeJournal === 'nutri') {
    return (
      <div className="animate-in fade-in duration-700" style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
        <Dashboard />
        
        {/* Botón flotante para volver al Hub central de JOURNAL */}
        <button 
          onClick={() => setActiveJournal(null)}
          style={{
            position: 'fixed', 
            bottom: '24px', 
            right: '24px',
            backgroundColor: 'rgba(30, 41, 59, 0.9)', 
            color: '#f8fafc', 
            padding: '12px 24px',
            borderRadius: '40px', // Línea gráfica coherente
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer', 
            zIndex: 1000,
            fontWeight: '600',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          ← Volver al Hub
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0f172a', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      <p>Cargando ecosistema JOURNAL...</p>
    </div>
  );
};

export default App;
