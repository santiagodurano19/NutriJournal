import { useState } from 'react'
import { supabase } from '../services/supabaseClient'

export const Auth = () => {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Esto crea el usuario en Supabase
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) alert(error.message)
    else alert('¡Bienvenido a JOURNAL! Revisa tu correo para confirmar.')
    
    setLoading(false)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h1>Únete a JOURNAL</h1>
      <form onSubmit={handleSignUp}>
        <input 
          type="email" 
          placeholder="Tu correo" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        <button disabled={loading} type="submit" style={{ width: '100%', padding: '10px', cursor: 'pointer' }}>
          {loading ? 'Cargando...' : 'Crear mi cuenta'}
        </button>
      </form>
    </div>
  )
}
