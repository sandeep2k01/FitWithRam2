import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../../lib/supabase'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await signUp(form.email, form.password, form.fullName)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', fontFamily: 'var(--ff-display)', fontSize: '20vw', color: 'rgba(0,0,0,0.02)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', whiteSpace: 'nowrap', pointerEvents: 'none' }}>JOIN</div>

      <Link to="/" style={{ fontFamily: 'var(--ff-display)', fontSize: '1.5rem', letterSpacing: '3px', marginBottom: '3rem', color: 'var(--white)', position: 'relative' }}>
        FIT<span style={{ color: 'var(--muted)' }}>WITH</span>RAM
      </Link>

      <div className="card" style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div className="tag" style={{ marginBottom: '0.75rem' }}>Get Started Free</div>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '2.5rem', letterSpacing: '2px' }}>CREATE ACCOUNT</h1>
        </div>

        {error && (
          <div style={{ background: 'rgba(201,24,11,0.1)', border: '0.5px solid rgba(201,24,11,0.3)', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: 'var(--danger)', borderRadius: 'var(--radius-sm)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { key: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Sandeep Sandy' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
            { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
            { key: 'confirm', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label style={{ fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>{label}</label>
              <input type={type} required placeholder={placeholder} value={form[key]} onChange={set(key)} />
            </div>
          ))}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--muted)', marginTop: '1.25rem' }}>
          By signing up, you agree to our Terms of Service.
        </p>

        <hr className="divider" />

        <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--white)', textDecoration: 'underline' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
