import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/dashboard/profile`
      })
      if (error) throw error
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <Link to="/" style={{ fontFamily: 'var(--ff-display)', fontSize: '1.5rem', letterSpacing: '3px', marginBottom: '3rem', color: 'var(--white)' }}>
        FIT<span style={{ color: 'var(--muted)' }}>WITH</span>RAM
      </Link>

      <div className="card" style={{ width: '100%', maxWidth: 400 }}>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📧</div>
            <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '1.8rem', letterSpacing: '2px', marginBottom: '0.75rem' }}>CHECK YOUR EMAIL</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>We sent a password reset link to <strong style={{ color: 'var(--white)' }}>{email}</strong></p>
            <Link to="/login" className="btn btn-secondary" style={{ display: 'inline-flex' }}>Back to Login</Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '2rem' }}>
              <div className="tag" style={{ marginBottom: '0.75rem' }}>Account Recovery</div>
              <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '2.2rem', letterSpacing: '2px' }}>RESET PASSWORD</h1>
            </div>

            {error && <div style={{ background: 'rgba(201,24,11,0.1)', border: '0.5px solid rgba(201,24,11,0.3)', padding: '0.75rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: 'var(--danger)' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Email Address</label>
                <input type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--muted)', marginTop: '1.25rem' }}>
              <Link to="/login" style={{ color: 'var(--white)', textDecoration: 'underline' }}>Back to login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
