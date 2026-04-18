import { supabase } from './supabase'

export const PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Monthly',
    amount: 99900, // in paise (₹999)
    display: '₹999',
    period: 'per month',
    description: 'Flexible monthly access'
  },
  yearly: {
    id: 'yearly',
    name: 'Yearly',
    amount: 499900, // ₹4,999
    display: '₹4,999',
    period: 'per year',
    description: 'Best value — save 58%'
  },
  lifetime: {
    id: 'lifetime',
    name: 'Lifetime',
    amount: 1499900, // ₹14,999
    display: '₹14,999',
    period: 'one time',
    description: 'Never pay again'
  }
}

export const initiatePayment = ({ plan, user, onSuccess, onError }) => {
  const planDetails = PLANS[plan]
  if (!planDetails) { onError('Invalid plan'); return }

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY,
    amount: planDetails.amount,
    currency: 'INR',
    name: 'FitWithRam',
    description: `${planDetails.name} Plan — ${planDetails.description}`,
    prefill: {
      name: user.full_name || '',
      email: user.email || ''
    },
    theme: { color: '#f5f5f0' },
    handler: async (response) => {
      try {
        // Save payment record to Supabase
        await supabase.from('payments').insert({
          user_id: user.id,
          plan,
          amount: planDetails.amount / 100,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id || null,
          status: 'success',
          created_at: new Date().toISOString()
        })

        // Update user plan
        const expiresAt = plan === 'lifetime' ? null :
          plan === 'yearly'
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

        await supabase.from('profiles').update({
          plan,
          plan_expires_at: expiresAt,
          is_premium: true
        }).eq('id', user.id)

        onSuccess(response)
      } catch (err) {
        onError(err.message)
      }
    },
    modal: {
      ondismiss: () => onError('Payment cancelled')
    }
  }

  const rzp = new window.Razorpay(options)
  rzp.open()
}
