import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signIn } from '../../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await signIn(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', fontFamily: 'var(--ff-display)', fontSize: '25vw', color: 'rgba(0,0,0,0.02)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', whiteSpace: 'nowrap', pointerEvents: 'none' }}>LOGIN</div>

      <Link to="/" style={{ fontFamily: 'var(--ff-display)', fontSize: '1.5rem', letterSpacing: '3px', marginBottom: '3rem', color: 'var(--white)', position: 'relative' }}>
        FIT<span style={{ color: 'var(--muted)' }}>WITH</span>RAM
      </Link>

      <div className="card" style={{ width: '100%', maxWidth: 400, position: 'relative' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div className="tag" style={{ marginBottom: '0.75rem' }}>Welcome Back</div>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '2.5rem', letterSpacing: '2px' }}>SIGN IN</h1>
        </div>

        {error && (
          <div style={{ background: 'rgba(201,24,11,0.1)', border: '0.5px solid rgba(201,24,11,0.3)', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: 'var(--danger)', borderRadius: 'var(--radius-sm)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Email</label>
            <input type="email" required placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Password</label>
            <input type="password" required placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: 'var(--muted)', textDecoration: 'underline' }}>Forgot password?</Link>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <hr className="divider" />

        <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--muted)' }}>
          No account?{' '}
          <Link to="/signup" style={{ color: 'var(--white)', textDecoration: 'underline' }}>Create one free</Link>
        </p>
      </div>
    </div>
  )
}
