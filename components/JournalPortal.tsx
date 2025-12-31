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
  radius: '40px', // Tu sello de marca
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
        if (data.user) await supabase.from('profiles').insert([{ id: data.user.id, full_name: formData.name }]);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
        if (error) throw error;
      }
      setView('hub');
    } catch (err: any) { setErrorMessage(err.message); } finally { setLoading(false); }
  };

  if (view === 'auth') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: theme.colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '460px', backgroundColor: theme.colors.surface, backdropFilter: 'blur(24px)', borderRadius: theme.radius, padding: '56px', border: `1px solid ${theme.colors.border}`, boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.6)' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ width: '72px', height: '72px', backgroundColor: theme.colors.primary, borderRadius: '24px', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShieldCheck color="white" size={36} /></div>
            <h1 style={{ fontSize: '30px', fontWeight: '900', color: 'white', margin: 0 }}>JOURNAL</h1>
            <p style={{ color: theme.colors.textMuted, marginTop: '8px' }}>{authMode === 'register' ? 'Crea tu acceso unificado' : 'Bienvenido de nuevo'}</p>
          </div>
          <form onSubmit={handleAuth}>
            {authMode === 'register' && <input style={{ width: '100%', backgroundColor: 'rgba(15, 23, 42, 0.5)', border: `1px solid ${theme.colors.border}`, borderRadius: '24px', padding: '16px 20px', color: 'white', marginBottom: '16px', outline: 'none' }} placeholder="Nombre Completo" onChange={e => setFormData({...formData, name: e.target.value})} />}
            <input style={{ width: '100%', backgroundColor: 'rgba(15, 23, 42, 0.5)', border: `1px solid ${theme.colors.border}`, borderRadius: '24px', padding: '16px 20px', color: 'white', marginBottom: '16px', outline: 'none' }} type="email" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} />
            <input style={{ width: '100%', backgroundColor: 'rgba(15, 23, 42, 0.5)', border: `1px solid ${theme.colors.border}`, borderRadius: '24px', padding: '16px 20px', color: 'white', marginBottom: '24px', outline: 'none' }} type="password" placeholder="Contraseña" onChange={e => setFormData({...formData, password: e.target.value})} />
            <button style={{ width: '100%', backgroundColor: theme.colors.primary, color: 'white', border: 'none', borderRadius: '32px', padding: '18px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }} type="submit">{loading ? <Loader2 className="animate-spin" /> : 'Entrar ahora'} <ArrowRight size={18} /></button>
          </form>
          <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} style={{ width: '100%', background: 'none', border: 'none', color: theme.colors.primary, marginTop: '24px', cursor: 'pointer', fontWeight: '700' }}>{authMode === 'login' ? '¿Nuevo en el ecosistema? Regístrate' : '¿Ya eres miembro? Inicia Sesión'}</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.colors.bg, color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <h2 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '64px', letterSpacing: '-0.05em' }}>JOURNAL HUB</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', width: '100%', maxWidth: '1100px' }}>
        <div onClick={() => onJournalSelect('nutri')} style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radius, padding: '40px', border: `1px solid ${theme.colors.accent}44`, cursor: 'pointer', position: 'relative' }}>
          <div style={{ width: '64px', height: '64px', backgroundColor: `${theme.colors.accent}15`, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}><Sparkles color={theme.colors.accent} size={30} /></div>
          <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>Nutri Journal</h3>
          <p style={{ color: theme.colors.textMuted, lineHeight: '1.6' }}>Optimización biológica y seguimiento nutricional asistido por IA.</p>
          <div style={{ marginTop: '32px', color: theme.colors.accent, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>Entrar ahora <ArrowRight size={16} /></div>
        </div>
        {/* Tarjetas bloqueadas */}
        <div style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radius, padding: '40px', border: `1px solid ${theme.colors.border}`, opacity: 0.5, cursor: 'not-allowed' }}>
          <Lock size={30} color={theme.colors.textMuted} style={{ marginBottom: '32px' }} />
          <h3>Money Journal</h3>
          <p>Próximamente: Arquitectura financiera.</p>
        </div>
      </div>
    </div>
  );
};
