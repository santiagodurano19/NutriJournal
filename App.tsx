
import React from 'react';
import JournalPortal from './JournalPortal';

/**
 * App Component - Punto de entrada simplificado.
 * El flujo de la aplicación ahora termina en el Hub Central del Portal.
 */
const App: React.FC = () => {
  const handleJournalSelect = (journalId: string) => {
    // Aquí podrías añadir lógica futura para navegar a sub-apps,
    // pero por ahora, el flujo termina satisfactoriamente en el Hub.
    console.log(`Módulo seleccionado: ${journalId}`);
  };

  return (
    <main style={{ backgroundColor: '#0f172a', minHeight: '100vh' }}>
      <JournalPortal onJournalSelect={handleJournalSelect} />
    </main>
  );
};

export default App;
