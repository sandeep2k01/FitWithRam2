import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { initiatePayment, PLANS } from '../../lib/razorpay'

const PLAN_COLORS = { monthly: '#3b82f6', yearly: '#10b981', lifetime: '#8b5cf6' }

export default function Payments() {
  const { profile, setProfile } = useAuthStore()
  const [selected, setSelected] = useState('yearly')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handlePayment = () => {
    setLoading(true)
    initiatePayment({
      plan: selected,
      user: profile,
      onSuccess: () => { setProfile({ ...profile, plan: selected, is_premium: true }); setSuccess(true); setLoading(false) },
      onError: (msg) => { if (msg !== 'Payment cancelled') alert('Payment failed: ' + msg); setLoading(false) }
    })
  }

  if (success) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1.5rem' }}>🎉</div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111', marginBottom: '0.5rem' }}>You're Premium!</h1>
      <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '2rem' }}>Welcome to the {selected} plan. All features are now unlocked.</p>
      <a href="/dashboard" style={{ padding: '0.75rem 2rem', background: '#111', color: '#fff', borderRadius: 12, fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}>Go to Dashboard</a>
    </div>
  )

  if (profile?.is_premium) return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', marginBottom: '0.4rem' }}>Your Plan</h1>
      <p style={{ color: '#aaa', fontSize: '0.83rem', marginBottom: '2rem' }}>Active subscription details</p>
      <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 16, padding: '2.5rem', textAlign: 'center', maxWidth: 400 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 1rem' }}>⭐</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', padding: '0.3rem 0.75rem', background: '#ecfdf5', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>Active</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111', textTransform: 'capitalize', marginBottom: '0.4rem' }}>{profile.plan} Plan</h2>
        <p style={{ color: '#aaa', fontSize: '0.82rem' }}>{profile.plan_expires_at ? `Renews on ${new Date(profile.plan_expires_at).toLocaleDateString('en-IN')}` : 'Lifetime access — never expires'}</p>
      </div>
    </div>
  )

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', marginBottom: '0.2rem' }}>Upgrade to Premium</h1>
      <p style={{ color: '#aaa', fontSize: '0.83rem', marginBottom: '2rem' }}>Unlock full access to all features</p>

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {Object.values(PLANS).map(plan => {
          const color = PLAN_COLORS[plan.id]
          const isSelected = selected === plan.id
          const isFeatured = plan.id === 'yearly'
          return (
            <div key={plan.id} onClick={() => setSelected(plan.id)} style={{
              background: '#fff', border: `2px solid ${isSelected ? color : '#ebebeb'}`,
              borderRadius: 16, padding: '1.5rem', cursor: 'pointer', position: 'relative',
              transition: 'all 0.2s', transform: isFeatured ? 'scale(1.02)' : 'none',
              boxShadow: isSelected ? `0 4px 20px ${color}30` : 'none',
            }}>
              {isFeatured && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: color, color: '#fff', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', padding: '0.25rem 0.75rem', borderRadius: 999 }}>
                  Best Value
                </div>
              )}
              {isSelected && (
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', width: 20, height: 20, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#fff' }}>✓</div>
              )}
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color, marginBottom: '0.5rem' }}>{plan.name}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111', lineHeight: 1, marginBottom: '0.2rem' }}>{plan.display}</div>
              <div style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '1rem' }}>{plan.period}</div>
              <div style={{ fontSize: '0.78rem', color: '#777', lineHeight: 1.6 }}>{plan.description}</div>
            </div>
          )
        })}
      </div>

      {/* Features comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#aaa', marginBottom: '1rem' }}>Free Includes</div>
          {['Workout Tracking', 'Exercise Library (200+)', 'Workout Plans', 'Basic Progress Charts'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0', fontSize: '0.83rem', color: '#888', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ color: '#bbb' }}>—</span>{f}
            </div>
          ))}
        </div>
        <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#aaa', marginBottom: '1rem' }}>Premium Adds</div>
          {['Diet & Meal Plans', 'Body Measurements Tracker', 'In-Depth Analytics', 'Monthly Insights', 'Strength Benchmarking', 'Unlimited History'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0', fontSize: '0.83rem', color: '#111', fontWeight: 500, borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ color: '#10b981', fontSize: '0.9rem' }}>✓</span>{f}
            </div>
          ))}
        </div>
      </div>

      <button onClick={handlePayment} disabled={loading} style={{ padding: '0.85rem 3rem', background: '#111', color: '#fff', border: 'none', borderRadius: 12, fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}
        onMouseEnter={e => e.target.style.background = '#333'}
        onMouseLeave={e => e.target.style.background = '#111'}>
        {loading ? 'Opening payment...' : `Pay ${PLANS[selected]?.display} — ${PLANS[selected]?.name}`}
      </button>
      <div style={{ fontSize: '0.72rem', color: '#bbb', marginTop: '0.75rem' }}>Secure payment via Razorpay · Indian cards, UPI, wallets supported</div>
    </div>
  )
}
