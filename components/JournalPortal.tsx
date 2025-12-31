
import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Key, 
  ChevronRight, 
  Sparkles, 
  Wallet, 
  Home, 
  Dumbbell,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const theme = {
  colors: {
    bg: '#0f172a', // Slate-900
    surface: 'rgba(30, 41, 59, 0.7)', 
    border: 'rgba(255, 255, 255, 0.08)',
    text: '#f8fafc', 
    textMuted: '#94a3b8', 
    accent: '#10b981', // Emerald-500
    primary: '#6366f1', // Indigo-500
    error: '#fb7185', // Rose-400 para errores elegantes
  },
  radius: '40px',
  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
};

const s: { [key: string]: React.CSSProperties } = {
  portal: {
    minHeight: '100vh',
    backgroundColor: theme.colors.bg,
    color: theme.colors.text,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    backgroundColor: theme.colors.surface,
    backdropFilter: 'blur(24px)',
    borderRadius: theme.radius,
    padding: '56px',
    border: `1px solid ${theme.colors.border}`,
    boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.6)',
    zIndex: 10,
  },
  label: {
    fontSize: '10px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: theme.colors.textMuted,
    marginBottom: '10px',
    display: 'block',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '24px',
    padding: '16px 20px',
    color: theme.colors.text,
    outline: 'none',
    transition: theme.transition,
    fontSize: '16px',
    marginBottom: '20px',
  },
  buttonPrimary: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: '32px',
    padding: '18px',
    fontWeight: '700',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: theme.transition,
    marginTop: '12px',
  },
  hubGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '32px',
    width: '100%',
    maxWidth: '1100px',
    zIndex: 10,
  },
  hubCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius,
    padding: '40px',
    border: `1px solid ${theme.colors.border}`,
    transition: theme.transition,
    position: 'relative',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '320px',
  },
  errorBox: {
    backgroundColor: 'rgba(251, 113, 133, 0.1)',
    border: `1px solid rgba(251, 113, 133, 0.2)`,
    borderRadius: '16px',
    padding: '12px 16px',
    color: theme.colors.error,
    fontSize: '13px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
  }
};

interface JournalPortalProps {
  onJournalSelect: (journal: string) => void;
}

export const JournalPortal: React.FC<JournalPortalProps> = ({ onJournalSelect }) => {
  const [view, setView] = useState<'auth' | 'hub'>('auth');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Validaciones en tiempo real
  const passwordsMatch = formData.password === formData.confirmPassword;
  const canSubmit = authMode === 'login' 
    ? (formData.email && formData.password)
    : (formData.name && formData.email && formData.password && passwordsMatch);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (authMode === 'register' && !passwordsMatch) {
      setErrorMessage("Las contraseñas deben ser idénticas.");
      return;
    }

    setLoading(true);

    try {
      if (authMode === 'register') {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (signUpError) throw signUpError;

        if (authData?.user) {
          // Guardar en tabla profiles
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ id: authData.user.id, full_name: formData.name }]);
          
          if (profileError) console.error("Error en perfil:", profileError);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (signInError) throw signInError;
      }
      
      setView('hub');
    } catch (err: any) {
      setErrorMessage(err.message || "Error al procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  const renderAuth = () => (
    <div style={s.card} className="animate-in fade-in zoom-in duration-500">
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ 
          width: '72px', height: '72px', backgroundColor: theme.colors.primary, 
          borderRadius: '24px', margin: '0 auto 24px', display: 'flex', 
          alignItems: 'center', justifyContent: 'center', boxShadow: `0 20px 40px ${theme.colors.primary}33`
        }}>
          <ShieldCheck color="white" size={36} />
        </div>
        <h1 style={{ fontSize: '30px', fontWeight: '900', letterSpacing: '-0.03em', margin: '0 0 10px' }}>
          JOURNAL
        </h1>
        <p style={{ color: theme.colors.textMuted, fontSize: '15px' }}>
          {authMode === 'register' ? 'Crea tu acceso unificado' : 'Bienvenido de nuevo'}
        </p>
      </div>

      {errorMessage && (
        <div style={s.errorBox} className="animate-in slide-in-from-top-2">
          <AlertCircle size={16} />
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleAuth}>
        {authMode === 'register' && (
          <div>
            <label style={s.label}>Nombre Completo</label>
            <input 
              style={s.input} 
              placeholder="Ej. Juan Pérez" 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
        )}

        <label style={s.label}>Email Corporativo / Personal</label>
        <input 
          style={s.input} 
          type="email" 
          placeholder="nombre@ejemplo.com"
          required
          value={formData.email}
          onChange={e => setFormData({...formData, email: e.target.value})}
        />

        <label style={s.label}>Contraseña</label>
        <input 
          style={{ ...s.input, marginBottom: authMode === 'register' ? '20px' : '32px' }} 
          type="password" 
          placeholder="••••••••"
          required
          value={formData.password}
          onChange={e => setFormData({...formData, password: e.target.value})}
        />

        {authMode === 'register' && (
          <div>
            <label style={s.label}>Confirmar Contraseña</label>
            <input 
              style={{ 
                ...s.input, 
                borderColor: formData.confirmPassword && !passwordsMatch ? theme.colors.error : theme.colors.border,
                marginBottom: '32px'
              }} 
              type="password" 
              placeholder="Repite tu contraseña"
              required
              value={formData.confirmPassword}
              onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </div>
        )}

        <button 
          style={{ 
            ...s.buttonPrimary, 
            opacity: canSubmit && !loading ? 1 : 0.5,
            cursor: canSubmit && !loading ? 'pointer' : 'not-allowed'
          }} 
          disabled={!canSubmit || loading}
          type="submit"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              {authMode === 'register' ? 'Crear Cuenta' : 'Acceder al Hub'}
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px' }}>
        <span style={{ color: theme.colors.textMuted }}>
          {authMode === 'register' ? '¿Ya eres miembro?' : '¿Nuevo en el ecosistema?'}
        </span>
        <button 
          onClick={() => {
            setAuthMode(authMode === 'register' ? 'login' : 'register');
            setErrorMessage(null);
          }}
          style={{ backgroundColor: 'transparent', border: 'none', color: theme.colors.primary, fontWeight: '700', marginLeft: '8px', cursor: 'pointer' }}
        >
          {authMode === 'register' ? 'Inicia Sesión' : 'Regístrate'}
        </button>
      </div>
    </div>
  );

  const renderHub = () => (
    <div className="animate-in fade-in slide-in-from-bottom duration-1000" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <h2 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-0.05em', marginBottom: '16px' }}>
          JOURNAL HUB
        </h2>
        <p style={{ color: theme.colors.textMuted, fontSize: '18px', maxWidth: '500px', margin: '0 auto' }}>
          Selecciona un módulo para comenzar tu optimización de vida.
        </p>
      </div>

      <div style={s.hubGrid}>
        {/* Nutri Journal */}
        <div 
          onClick={() => onJournalSelect('nutri')}
          style={{ ...s.hubCard, borderColor: `${theme.colors.accent}44` }}
          className="hover:scale-[1.02] active:scale-98 group"
        >
          <div style={{ 
            width: '64px', height: '64px', backgroundColor: `${theme.colors.accent}15`, 
            borderRadius: '20px', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', marginBottom: '32px', border: `1px solid ${theme.colors.accent}33`
          }}>
            <Sparkles color={theme.colors.accent} size={30} />
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>Nutri Journal</h3>
          <p style={{ color: theme.colors.textMuted, fontSize: '16px', lineHeight: '1.6', flex: 1 }}>
            Optimización biológica y seguimiento nutricional asistido por IA.
          </p>
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '8px', 
            color: theme.colors.accent, fontWeight: '700', fontSize: '14px', marginTop: '32px'
          }}>
            Entrar ahora <ArrowRight size={16} />
          </div>
        </div>

        {/* Money Journal - Locked */}
        <div style={{ ...s.hubCard, opacity: 0.5, cursor: 'not-allowed' }}>
          <div style={{ position: 'absolute', top: '32px', right: '32px' }}>
            <Lock size={20} color={theme.colors.textMuted} />
          </div>
          <div style={{ 
            width: '64px', height: '64px', backgroundColor: 'rgba(255,255,255,0.05)', 
            borderRadius: '20px', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', marginBottom: '32px' 
          }}>
            <Wallet color={theme.colors.textMuted} size={30} />
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px', color: '#64748b' }}>Money Journal</h3>
          <p style={{ color: '#475569', fontSize: '16px', lineHeight: '1.6' }}>
            Próximamente: Arquitectura financiera y control de activos.
          </p>
        </div>

        {/* Training Journal - Locked */}
        <div style={{ ...s.hubCard, opacity: 0.5, cursor: 'not-allowed' }}>
          <div style={{ position: 'absolute', top: '32px', right: '32px' }}>
            <Lock size={20} color={theme.colors.textMuted} />
          </div>
          <div style={{ 
            width: '64px', height: '64px', backgroundColor: 'rgba(255,255,255,0.05)', 
            borderRadius: '20px', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', marginBottom: '32px' 
          }}>
            <Dumbbell color={theme.colors.textMuted} size={30} />
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px', color: '#64748b' }}>Training Journal</h3>
          <p style={{ color: '#475569', fontSize: '16px', lineHeight: '1.6' }}>
            Próximamente: Sistemas de entrenamiento de alta intensidad.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={s.portal}>
      <div style={{ position: 'fixed', top: '-15%', left: '-10%', width: '50vw', height: '50vw', background: `radial-gradient(circle, ${theme.colors.primary}08 0%, transparent 70%)`, borderRadius: '50%', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-15%', right: '-10%', width: '50vw', height: '50vw', background: `radial-gradient(circle, ${theme.colors.accent}08 0%, transparent 70%)`, borderRadius: '50%', zIndex: 0 }} />
      
      {view === 'auth' ? renderAuth() : renderHub()}
      
      <style>{`
        .animate-in { animation: animateIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes animateIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        input:focus {
          border-color: ${theme.colors.primary}aa !important;
          background-color: rgba(15, 23, 42, 0.8) !important;
          box-shadow: 0 0 0 4px ${theme.colors.primary}11;
        }
        .group:hover {
          border-color: ${theme.colors.accent}88 !important;
          box-shadow: 0 30px 60px -12px rgba(16, 185, 129, 0.15) !important;
        }
      `}</style>
    </div>
  );
};


