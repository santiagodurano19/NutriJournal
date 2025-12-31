import React, { useState, useEffect } from 'react';
import { 
  Lock, Sparkles, Wallet, Dumbbell, ArrowRight, ShieldCheck, AlertCircle, Loader2 
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const theme = {
  colors: {
    bg: '#0f172a', 
    surface: 'rgba(30, 41, 59, 0.7)', 
    border: 'rgba(255, 255, 255, 0.08)',
    text: '#f8fafc', 
    textMuted: '#94a3b8', 
    accent: '#10b981', 
    primary: '#6366f1', 
    error: '#fb7185', 
  },
  radius: '40px',
  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
};

interface JournalPortalProps {
  onJournalSelect: (journal: string) => void;
}

export const JournalPortal: React.FC<JournalPortalProps> = ({ onJournalSelect }) => {
  const [view, setView] = useState<'auth' | 'hub'>('auth');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) setView('hub');
    };
    checkSession();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (authMode === 'register') {
        const { data, error } = await supabase.auth.signUp({ email: formData.email, password: formData.password });
        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').insert([{ id: data.user.id, full_name: formData.name }]);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
        if (error) throw error;
      }
      setView('hub');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (view === 'auth') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: theme.colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '40px', backgroundColor: theme.colors.surface, borderRadius: theme.radius, border: `1px solid ${theme.colors.border}` }}>
          <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>JOURNAL</h1>
          <form onSubmit={handleAuth}>
            {authMode === 'register' && (
              <input style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: 'white' }} placeholder="Nombre" onChange={e => setFormData({...formData, name: e.target.value})} />
            )}
            <input style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: 'white' }} type="email" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} />
            <input style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: 'white' }} type="password" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} />
            <button style={{ width: '100%', padding: '14px', borderRadius: '40px', backgroundColor: theme.colors.primary, color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? 'Cargando...' : authMode === 'register' ? 'Registrarse' : 'Entrar'}
            </button>
          </form>
          <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} style={{ width: '100%', background: 'none', border: 'none', color: theme.colors.textMuted, marginTop: '20px', cursor: 'pointer' }}>
            {authMode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Logueate'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.colors.bg, color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <h1 style={{ fontSize: '40px', marginBottom: '40px' }}>JOURNAL HUB</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', maxWidth: '1000px', width: '100%' }}>
        
        {/* Nutri Journal Card */}
        <div 
          onClick={() => {
            console.log("Clic en Nutri detectado");
            onJournalSelect('nutri');
          }}
          style={{ padding: '40px', backgroundColor: theme.colors.surface, borderRadius: theme.radius, border: `2px solid ${theme.colors.accent}`, cursor: 'pointer', transition: 'transform 0.2s' }}
        >
          <Sparkles color={theme.colors.accent} size={40} style={{ marginBottom: '20px' }} />
          <h2>Nutri Journal</h2>
          <p style={{ color: theme.colors.textMuted }}>Optimización biológica con IA.</p>
          <div style={{ marginTop: '20px', color: theme.colors.accent, fontWeight: 'bold' }}>Entrar ahora →</div>
        </div>

        {/* Locked Cards */}
        <div style={{ padding: '40px', backgroundColor: theme.colors.surface, borderRadius: theme.radius, border: `1px solid ${theme.colors.border}`, opacity: 0.5 }}>
          <Lock size={40} style={{ marginBottom: '20px' }} />
          <h2>Money Journal</h2>
          <p>Próximamente</p>
        </div>
      </div>
    </div>
  );
};
