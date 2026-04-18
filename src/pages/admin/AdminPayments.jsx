import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => { fetchPayments() }, [])
  const fetchPayments = async () => {
    const { data } = await supabase.from('payments').select('*, profile:profiles(full_name,email)').order('created_at', { ascending: false })
    setPayments(data || [])
    setTotal(data?.filter(p => p.status === 'success').reduce((a, p) => a + (p.amount || 0), 0) || 0)
    setLoading(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div><div className="tag" style={{ marginBottom: '0.5rem' }}>Admin</div><h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '2.5rem', letterSpacing: '2px' }}>PAYMENTS</h1></div>
        <div style={{ textAlign: 'right' }}><div style={{ fontSize: '0.68rem', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total Revenue</div><div style={{ fontFamily: 'var(--ff-display)', fontSize: '2rem', color: 'var(--success)' }}>₹{total.toLocaleString()}</div></div>
      </div>

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 100px 1fr', gap: '1rem', fontSize: '0.68rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--muted)', padding: '0 0 0.75rem', borderBottom: '0.5px solid var(--border)' }}>
          <span>Member</span><span>Razorpay ID</span><span>Plan</span><span>Amount</span><span>Date</span>
        </div>
        {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>Loading...</div> : payments.map(p => (
          <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 100px 1fr', gap: '1rem', padding: '0.7rem 0', borderBottom: '0.5px solid var(--border)', alignItems: 'center', fontSize: '0.82rem' }}>
            <div><div style={{ fontWeight: 500 }}>{p.profile?.full_name || '—'}</div><div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{p.profile?.email}</div></div>
            <span style={{ color: 'var(--muted)', fontSize: '0.72rem', fontFamily: 'monospace' }}>{p.razorpay_payment_id || '—'}</span>
            <span className="badge badge-neutral">{p.plan}</span>
            <span style={{ color: 'var(--success)', fontWeight: 500 }}>₹{p.amount?.toLocaleString()}</span>
            <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{new Date(p.created_at).toLocaleDateString('en-IN')}</span>
          </div>
        ))}
        {payments.length === 0 && !loading && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', fontSize: '0.85rem' }}>No payments yet.</div>}
      </div>
    </div>
  )
}
