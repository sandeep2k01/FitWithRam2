import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// ── Inline styles as JS objects ────────────────────────────────────────────
const S = {
  // NAV
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 2.5rem', height: 64,
    borderBottom: '0.5px solid #e1e1e1',
    background: 'rgba(245,245,245,0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    position: 'sticky', top: 0, zIndex: 100,
  },
  logo: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '1.5rem', letterSpacing: '3px', color: '#0f0f0a',
    textDecoration: 'none',
  },
  navLinks: {
    display: 'flex', gap: '2rem', listStyle: 'none',
  },
  navLink: {
    color: '#888888', textDecoration: 'none',
    fontSize: '0.78rem', letterSpacing: '1.5px', textTransform: 'uppercase',
    transition: 'color 0.2s',
  },
  navRight: { display: 'flex', gap: '0.75rem', alignItems: 'center' },

  // HERO
  hero: {
    minHeight: 'calc(100vh - 64px)',
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    alignItems: 'center', gap: '4rem',
    padding: '4rem 2.5rem',
    position: 'relative', overflow: 'hidden',
    maxWidth: 1280, margin: '0 auto',
  },
  heroBg: {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%,-50%)',
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '22vw', color: 'rgba(0,0,0,0.018)',
    whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none',
    letterSpacing: '4px',
  },
  heroTag: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    fontSize: '0.72rem', letterSpacing: '3px', textTransform: 'uppercase',
    color: '#999999', marginBottom: '1.25rem',
  },
  heroTagLine: { width: '2rem', height: '0.5px', background: '#aaaaaa' },
  heroTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 'clamp(3.5rem, 7vw, 6.5rem)',
    lineHeight: 0.9, letterSpacing: '2px',
    marginBottom: '1.5rem', color: '#0f0f0a',
  },
  heroTitleMuted: { color: '#c5c5c5' },
  heroDesc: {
    color: '#999999', fontSize: '1rem', lineHeight: 1.75,
    maxWidth: 420, marginBottom: '2.5rem', fontWeight: 300,
  },
  heroActions: { display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' },
  heroStats: {
    display: 'flex', gap: '2.5rem',
    marginTop: '3rem', paddingTop: '2rem',
    borderTop: '0.5px solid #e5e5e5',
  },
  statNum: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '2.2rem', letterSpacing: '1px', lineHeight: 1,
  },
  statLabel: {
    fontSize: '0.68rem', color: '#999999',
    letterSpacing: '1px', textTransform: 'uppercase', marginTop: '0.2rem',
  },

  // MOCK DASHBOARD CARD
  mockCard: {
    background: '#eeeeee', border: '0.5px solid #dddddd',
    borderRadius: 4, padding: '1.5rem', position: 'relative',
    zIndex: 1,
  },
  mockHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '1.25rem',
  },
  mockTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '1rem', letterSpacing: '2px', color: '#555555',
  },
  mockBadge: {
    fontSize: '0.62rem', letterSpacing: '1px', textTransform: 'uppercase',
    background: 'rgba(0,0,0,0.06)', color: '#888888',
    padding: '0.2rem 0.6rem', borderRadius: 2,
  },
  exerciseRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.65rem 0', borderBottom: '0.5px solid #e5e5e5',
  },
  setChip: {
    display: 'inline-block',
    padding: '0.18rem 0.55rem',
    fontSize: '0.65rem', border: '0.5px solid #cccccc', color: '#888888',
    borderRadius: 2, marginRight: '0.3rem',
  },
  setChipDone: {
    display: 'inline-block',
    padding: '0.18rem 0.55rem',
    fontSize: '0.65rem', border: '0.5px solid #aaaaaa',
    background: 'rgba(0,0,0,0.05)', color: '#0f0f0a',
    borderRadius: 2, marginRight: '0.3rem',
  },
  progressBar: {
    marginTop: '1.25rem',
    display: 'flex', flexDirection: 'column', gap: '0.4rem',
  },
  pbRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#aaaaaa', letterSpacing: '1px', textTransform: 'uppercase' },
  pbTrack: { height: 2, background: '#e1e1e1', borderRadius: 1 },

  // SECTION
  section: { padding: '6rem 2.5rem', maxWidth: 1280, margin: '0 auto' },
  sectionFull: { padding: '6rem 2.5rem', borderTop: '0.5px solid #eeeeee' },
  sectionTag: {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    fontSize: '0.68rem', letterSpacing: '3px', textTransform: 'uppercase',
    color: '#aaaaaa', marginBottom: '1rem',
  },
  sectionTagLine: { width: '1.5rem', height: '0.5px', background: '#bbbbbb' },
  sectionTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
    letterSpacing: '2px', marginBottom: '1rem', color: '#0f0f0a',
  },
  sectionSub: {
    color: '#aaaaaa', fontSize: '0.92rem', lineHeight: 1.75,
    maxWidth: 480, fontWeight: 300,
  },

  // FEATURES GRID
  featuresGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    border: '0.5px solid #e5e5e5', marginTop: '3.5rem',
  },
  featureItem: {
    padding: '2rem', borderRight: '0.5px solid #e5e5e5',
    borderBottom: '0.5px solid #e5e5e5', transition: 'background 0.2s',
    cursor: 'default',
  },
  featureNum: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '0.8rem', letterSpacing: '2px', color: '#cccccc',
    marginBottom: '0.75rem',
  },
  featureTitle: { fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0f0f0a' },
  featureDesc: { fontSize: '0.8rem', color: '#aaaaaa', lineHeight: 1.65, fontWeight: 300 },

  // PRICING
  pricingGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1px', background: '#e5e5e5',
    border: '0.5px solid #e5e5e5', marginTop: '3.5rem',
  },
  priceCard: { background: '#f5f5f5', padding: '2.5rem 2rem', position: 'relative' },
  priceCardFeatured: {
    background: '#0f0f0a', padding: '2.5rem 2rem', position: 'relative',
  },
  pricePlan: { fontSize: '0.68rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#999999', marginBottom: '0.75rem' },
  pricePlanFeatured: { fontSize: '0.68rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#777777', marginBottom: '0.75rem' },
  priceAmt: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '3.2rem', letterSpacing: '1px', lineHeight: 1, color: '#0f0f0a' },
  priceAmtFeatured: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '3.2rem', letterSpacing: '1px', lineHeight: 1, color: '#f5f5f5' },
  pricePeriod: { fontSize: '0.75rem', color: '#999999', marginTop: '0.25rem', marginBottom: '1.5rem' },
  pricePeriodFeatured: { fontSize: '0.75rem', color: '#777777', marginTop: '0.25rem', marginBottom: '1.5rem' },
  priceFeatureList: { listStyle: 'none', fontSize: '0.8rem', color: '#aaaaaa' },
  priceFeatureListFeatured: { listStyle: 'none', fontSize: '0.8rem', color: '#888888' },
  priceFeatureItem: { padding: '0.35rem 0', borderBottom: '0.5px solid #eaeaea', display: 'flex', gap: '0.5rem' },
  priceFeatureItemFeatured: { padding: '0.35rem 0', borderBottom: '0.5px solid #1f1f1f', display: 'flex', gap: '0.5rem' },
  bestTag: {
    position: 'absolute', top: '1rem', right: '1rem',
    fontSize: '0.58rem', letterSpacing: '1.5px', textTransform: 'uppercase',
    background: '#f5f5f5', color: '#0f0f0a',
    padding: '0.22rem 0.6rem', borderRadius: 2,
  },

  // TESTIMONIALS
  testiGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1px', background: '#ebebeb',
    border: '0.5px solid #ebebeb', marginTop: '3.5rem',
  },
  testiCard: { background: '#f5f5f5', padding: '2rem' },
  testiQuote: { fontSize: '0.88rem', lineHeight: 1.75, color: '#aaaaaa', fontWeight: 300, marginBottom: '1.5rem' },
  testiAuthor: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  testiAvatar: {
    width: 36, height: 36, borderRadius: '50%',
    background: '#e5e5e5', border: '0.5px solid #d5d5d5',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.72rem', fontWeight: 500, color: '#777777', flexShrink: 0,
  },
  testiName: { fontSize: '0.82rem', fontWeight: 500, color: '#0f0f0a' },
  testiRole: { fontSize: '0.7rem', color: '#aaaaaa', marginTop: '0.1rem' },

  // CTA
  ctaSection: {
    padding: '7rem 2.5rem', textAlign: 'center',
    borderTop: '0.5px solid #eeeeee', position: 'relative', overflow: 'hidden',
  },
  ctaBg: {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%,-50%)',
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '18vw', color: 'rgba(0,0,0,0.018)',
    whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none',
  },
  ctaTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 'clamp(3rem, 6vw, 5.5rem)',
    letterSpacing: '2px', marginBottom: '1.25rem',
    color: '#0f0f0a', position: 'relative',
  },
  ctaSub: { color: '#aaaaaa', fontSize: '0.92rem', marginBottom: '2.5rem', fontWeight: 300, position: 'relative' },

  // FOOTER
  footer: {
    padding: '2rem 2.5rem', borderTop: '0.5px solid #eeeeee',
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
  },
  footerLogo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '2px', color: '#cccccc' },
  footerLinks: { display: 'flex', gap: '1.5rem' },
  footerLink: { color: '#cccccc', textDecoration: 'none', fontSize: '0.72rem', letterSpacing: '1px', textTransform: 'uppercase' },
  footerCopy: { fontSize: '0.7rem', color: '#d5d5d5', letterSpacing: '0.5px' },
}

// ── Small reusable components ───────────────────────────────────────────────

function BtnPrimary({ children, to, onClick, style = {} }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '0.8rem 2.2rem',
    background: '#0f0f0a', color: '#f5f5f5',
    border: 'none', fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.82rem', fontWeight: 500,
    letterSpacing: '1.5px', textTransform: 'uppercase',
    cursor: 'pointer', textDecoration: 'none', transition: 'background 0.2s',
    ...style,
  }
  if (to) return <Link to={to} style={base}>{children}</Link>
  return <button style={base} onClick={onClick}>{children}</button>
}

function BtnGhost({ children, to, onClick, style = {} }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '0.8rem 1.8rem',
    background: 'transparent', color: '#888888',
    border: '0.5px solid #d5d5d5',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.82rem', letterSpacing: '1.5px', textTransform: 'uppercase',
    cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s',
    ...style,
  }
  if (to) return <Link to={to} style={base}>{children}</Link>
  return <button style={base} onClick={onClick}>{children}</button>
}

// ── Removed MockDashboard ─────────────────────────────────────────────
// ── FEATURES data ────────────────────────────────────────────────────────────

const FEATURES = [
  { num: '01', title: 'Workout Tracking', desc: 'Log every set, rep and weight. Live session timer with real-time volume tracking and exercise search.' },
  { num: '02', title: 'Diet & Nutrition', desc: "Ram's personalized meal plans with daily calorie targets, macro breakdown, and meal-by-meal guidance." },
  { num: '03', title: 'Progress Dashboard', desc: 'Visual charts for training volume, session duration, body weight, and measurements over time.' },
  { num: '04', title: 'Expert Programs', desc: 'Pre-built programs by Ram — beginner, strength, hypertrophy, fat loss. Follow or customize.' },
  { num: '05', title: 'Body Measurements', desc: 'Track weight, body fat, chest, waist, hips over time. See exactly how your body is changing.' },
  { num: '06', title: 'Razorpay Payments', desc: 'Secure Indian payments — UPI, cards, wallets. Monthly, yearly, or lifetime access plans.' },
]

const TESTIMONIALS = [
  { initials: 'AK', name: 'Arjun Kumar', role: 'Lost 12kg in 90 days', quote: '"Ram\'s platform changed how I train. The workout tracking and diet plan together got me to my goal weight in 3 months."' },
  { initials: 'PS', name: 'Priya Sharma', role: '+40kg bench in 6 months', quote: '"The dashboard shows my progress so clearly. Seeing my bench press go from 60 to 100kg keeps me motivated every single day."' },
  { initials: 'RV', name: 'Rahul Verma', role: 'Lifetime member', quote: '"Lifetime plan was the best investment. The programs are professional, diet tracking is seamless, and Ram actually responds."' },
]

const PLANS = [
  {
    id: 'monthly', label: 'Monthly', price: '₹999', period: 'per month',
    featured: false,
    features: ['Workout Tracking', 'Exercise Library (200+)', 'Basic Progress Charts', "Ram's Workout Programs"],
  },
  {
    id: 'yearly', label: 'Yearly', price: '₹4,999', period: 'per year — save 58%',
    featured: true, badge: 'Best Value',
    features: ['Everything in Monthly', 'Diet & Meal Plans', 'Body Measurements Tracker', 'Advanced Analytics', 'Priority Support'],
  },
  {
    id: 'lifetime', label: 'Lifetime', price: '₹14,999', period: 'one-time — never pay again',
    featured: false,
    features: ['Everything in Yearly', 'Custom Exercise Creation', 'Unlimited Workout History', 'Monthly Performance Insights', 'Strength Benchmarking'],
  },
]

// ── Main Landing component ───────────────────────────────────────────────────

export default function Landing() {
  const navigate = useNavigate()
  const [hoverNav, setHoverNav] = useState(null)
  const [hoverFeature, setHoverFeature] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div style={{ background: '#f5f5f5', color: '#0f0f0a', fontFamily: "'DM Sans', sans-serif", overflowX: 'clip' }}>

      {/* ── NAV ── */}
      <nav style={S.nav}>
        <Link to="/" style={S.logo}>
          FIT<span style={{ color: '#c5c5c5' }}>WITH</span>RAM
        </Link>

        {/* Desktop nav links */}
        <ul style={{ ...S.navLinks }} className="nav-links-desktop">
          {['Features', 'Programs', 'Pricing'].map(label => (
            <li key={label}>
              <a
                href={`#${label.toLowerCase()}`}
                style={{ ...S.navLink, color: hoverNav === label ? '#0f0f0a' : '#999999' }}
                onMouseEnter={() => setHoverNav(label)}
                onMouseLeave={() => setHoverNav(null)}
              >{label}</a>
            </li>
          ))}
        </ul>

        <div style={S.navRight}>
          <div className="nav-auth-desktop">
            <BtnGhost to="/login" style={{ padding: '0.45rem 1.1rem', fontSize: '0.75rem' }}>Login</BtnGhost>
            <BtnPrimary to="/signup" style={{ padding: '0.45rem 1.1rem', fontSize: '0.75rem' }}>Join Free</BtnPrimary>
          </div>
          {/* Hamburger */}
          <button onClick={() => setMobileMenuOpen(o => !o)} className="hamburger-landing" style={{
            display: 'none', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '1.5rem', color: '#0f0f0a', padding: '0.25rem'
          }}>☰</button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(245,245,245,0.98)',
          zIndex: 200, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '2rem'
        }}>
          <button onClick={() => setMobileMenuOpen(false)} style={{
            position: 'absolute', top: '1.5rem', right: '1.5rem',
            background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#0f0f0a'
          }}>✕</button>
          {['Features', 'Programs', 'Pricing'].map(label => (
            <a key={label} href={`#${label.toLowerCase()}`}
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', letterSpacing: '3px', color: '#0f0f0a', textDecoration: 'none' }}>{label}</a>
          ))}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <BtnGhost to="/login" onClick={() => setMobileMenuOpen(false)}>Login</BtnGhost>
            <BtnPrimary to="/signup" onClick={() => setMobileMenuOpen(false)}>Join Free</BtnPrimary>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <div style={{ borderBottom: '0.5px solid #eeeeee' }}>
        <div style={S.hero} className="hero-grid">
          <div style={S.heroBg}>FITWITHRAM</div>

          {/* LEFT */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={S.heroTag}>
              <span style={S.heroTagLine} />
              Personal Training Platform
            </div>

            <h1 style={S.heroTitle}>
              TRAIN<br />
              <span style={S.heroTitleMuted}>HARDER.</span><br />
              TRACK<br />
              SMARTER.
            </h1>

            <p style={S.heroDesc}>
              Ram's all-in-one fitness platform. Custom workouts, personalized diet plans,
              live session tracking, and detailed progress analytics — everything in one place.
            </p>

            <div style={S.heroActions}>
              <BtnPrimary to="/signup">Start Training Free ↗</BtnPrimary>
              <BtnGhost to="/login">Sign In</BtnGhost>
            </div>

            <div style={S.heroStats} className="hero-stats">
              {[['3K+', 'Active Members'], ['200+', 'Exercises'], ['98%', 'Satisfaction']].map(([num, label]) => (
                <div key={label}>
                  <div style={S.statNum}>{num}</div>
                  <div style={S.statLabel}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — hero image */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center' }} className="hero-image-wrap">
            <div style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
              <img
                src="/media/herosection.jpeg"
                alt="Ram — Personal Trainer"
                style={{
                  width: '100%',
                  height: '600px',
                  objectFit: 'cover',
                  objectPosition: 'center center',
                  display: 'block',
                  borderRadius: '6px',
                  filter: 'contrast(1.05) brightness(0.97)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── TRAINING CARDS ── */}
      <div style={{ background: '#fff', borderBottom: '0.5px solid #eeeeee' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '4rem 2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '0.72rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#999', marginBottom: '0.75rem' }}>
              <span style={{ width: '2rem', height: '0.5px', background: '#aaa', display: 'inline-block' }} />Choose Your Path
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '2px', color: '#0f0f0a', margin: 0 }}>HOW DO YOU WANT TO TRAIN?</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="training-cards-grid">
            {/* Offline Card */}
            <div style={{ background: '#f7f7f5', border: '1px solid #e5e5e5', borderRadius: 10, padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%', boxSizing: 'border-box' }}>
              <div>
                <div style={{ fontSize: '0.68rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#999', marginBottom: '0.6rem' }}>🏋️ At the Gym · Free</div>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '2px', color: '#0f0f0a', margin: 0, marginBottom: '0.35rem' }}>OFFLINE TRAINING</h3>
                <div style={{ fontSize: '0.82rem', color: '#777', fontWeight: 500 }}>No subscription needed. No live sessions.</div>
              </div>
              <p style={{ color: '#888', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>
                Train at the gym with Ram's personalized plan. Ram assigns your workout and diet plan, then contacts you directly on WhatsApp within 24 hours.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Custom workout plan', 'Personalised diet plan', 'WhatsApp support from Ram'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#555' }}>
                    <span style={{ color: '#111', fontWeight: 700, fontSize: '0.9rem' }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <a href="/signup?intent=offline" style={{ display: 'block', textAlign: 'center', padding: '0.8rem 1.5rem', background: '#0f0f0a', color: '#fff', borderRadius: 8, fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.5px', marginTop: 'auto' }}>
                Get Started Free →
              </a>
            </div>

            {/* Online Card */}
            <div style={{ background: '#f7f7f5', border: '1px solid #e5e5e5', borderRadius: 10, padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%', boxSizing: 'border-box' }}>
              <div>
                <div style={{ fontSize: '0.68rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#999', marginBottom: '0.6rem' }}>🌐 Train Anywhere · Premium</div>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '2px', color: '#0f0f0a', margin: 0, marginBottom: '0.35rem' }}>ONLINE TRAINING</h3>
                <div style={{ fontSize: '0.82rem', color: '#777', fontWeight: 500 }}>Full access from ₹999/month.</div>
              </div>
              <p style={{ color: '#888', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>
                Train anywhere with Ram's live guidance. Real-time form checks, live sessions, priority support and the full platform experience.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Custom workout plan', 'Personalised diet plan', 'Progress tracking in-app', 'Live sessions with Ram', 'Form check & real-time feedback', 'Priority support'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#555' }}>
                    <span style={{ color: '#111', fontWeight: 700, fontSize: '0.9rem' }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <a href="/signup?intent=online" style={{ display: 'block', textAlign: 'center', padding: '0.8rem 1.5rem', background: '#0f0f0a', color: '#fff', borderRadius: 8, fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.5px', marginTop: 'auto' }}>
                Start Premium →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div id="features" style={S.sectionFull}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0' }}>
          <div style={S.sectionTag}><span style={S.sectionTagLine} />Platform Features</div>
          <h2 style={S.sectionTitle}>EVERYTHING<br />YOU NEED</h2>
          <p style={S.sectionSub}>Built for serious athletes and beginners alike — one platform, managed entirely by Ram.</p>

          <div style={S.featuresGrid} className="features-grid">
            {FEATURES.map((f, i) => (
              <div
                key={f.num}
                style={{
                  ...S.featureItem,
                  background: hoverFeature === i ? '#eeeeee' : 'transparent',
                  borderRight: (i + 1) % 3 === 0 ? 'none' : '0.5px solid #e5e5e5',
                }}
                onMouseEnter={() => setHoverFeature(i)}
                onMouseLeave={() => setHoverFeature(null)}
              >
                <div style={S.featureNum}>{f.num}</div>
                <div style={S.featureTitle}>{f.title}</div>
                <div style={S.featureDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div id="programs" style={{ ...S.sectionFull }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={S.sectionTag}><span style={S.sectionTagLine} />How It Works</div>
          <h2 style={S.sectionTitle}>GET STARTED<br />IN 3 STEPS</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: '#e5e5e5', border: '0.5px solid #e5e5e5', marginTop: '3.5rem' }} className="how-it-works-grid">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up free in 30 seconds. No credit card required to get started.' },
              { step: '02', title: 'Get Your Plan', desc: 'Ram assigns you a personalized workout program and diet plan based on your goals.' },
              { step: '03', title: 'Track & Grow', desc: 'Log every session, monitor your progress, and watch your strength compound over time.' },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ background: '#f5f5f5', padding: '2.5rem 2rem' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3.5rem', color: '#e5e5e5', lineHeight: 1, marginBottom: '1rem' }}>{step}</div>
                <div style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0f0f0a' }}>{title}</div>
                <div style={{ fontSize: '0.82rem', color: '#aaaaaa', lineHeight: 1.7, fontWeight: 300 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRICING ── */}
      <div id="pricing" style={S.sectionFull}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={S.sectionTag}><span style={S.sectionTagLine} />Membership Plans</div>
          <h2 style={S.sectionTitle}>SIMPLE<br />PRICING</h2>
          <p style={S.sectionSub}>No hidden fees. Cancel monthly anytime. Lifetime members never pay again.</p>

          <div style={S.pricingGrid} className="pricing-grid">
            {PLANS.map((plan) => (
              <div key={plan.id} style={plan.featured ? S.priceCardFeatured : S.priceCard}>
                {plan.badge && <div style={S.bestTag}>{plan.badge}</div>}
                <div style={plan.featured ? S.pricePlanFeatured : S.pricePlan}>{plan.label}</div>
                <div style={plan.featured ? S.priceAmtFeatured : S.priceAmt}>{plan.price}</div>
                <div style={plan.featured ? S.pricePeriodFeatured : S.pricePeriod}>{plan.period}</div>

                <button
                  onClick={() => navigate('/signup')}
                  style={{
                    width: '100%', padding: '0.75rem',
                    background: plan.featured ? '#f5f5f5' : 'transparent',
                    color: plan.featured ? '#0f0f0a' : '#888888',
                    border: plan.featured ? 'none' : '0.5px solid #d5d5d5',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.75rem', letterSpacing: '1.5px', textTransform: 'uppercase',
                    cursor: 'pointer', marginBottom: '1.75rem', transition: 'all 0.2s',
                  }}
                >
                  {plan.id === 'yearly' ? 'Start Free Trial' : `Choose ${plan.label}`}
                </button>

                <ul style={plan.featured ? S.priceFeatureListFeatured : S.priceFeatureList}>
                  {plan.features.map(f => (
                    <li key={f} style={plan.featured ? S.priceFeatureItemFeatured : S.priceFeatureItem}>
                      <span style={{ color: plan.featured ? '#777777' : '#cccccc', flexShrink: 0 }}>—</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div style={S.sectionFull}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={S.sectionTag}><span style={S.sectionTagLine} />Member Stories</div>
          <h2 style={S.sectionTitle}>REAL<br />RESULTS</h2>

          <div style={S.testiGrid} className="testimonials-grid">
            {TESTIMONIALS.map(({ initials, name, role, quote }) => (
              <div key={name} style={S.testiCard}>
                <p style={S.testiQuote}>{quote}</p>
                <div style={S.testiAuthor}>
                  <div style={S.testiAvatar}>{initials}</div>
                  <div>
                    <div style={S.testiName}>{name}</div>
                    <div style={S.testiRole}>{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={S.ctaSection}>
        <div style={S.ctaBg}>START</div>
        <h2 style={S.ctaTitle}>READY TO<br />TRANSFORM?</h2>
        <p style={S.ctaSub}>Join FitWithRam today. Your first 14 days are completely free.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
          <BtnPrimary to="/signup" style={{ padding: '1rem 3rem', fontSize: '0.88rem' }}>
            Create Free Account ↗
          </BtnPrimary>
          <BtnGhost to="/login" style={{ padding: '1rem 2rem', fontSize: '0.88rem' }}>
            Sign In
          </BtnGhost>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ ...S.footer }} className="landing-footer">
        <div style={S.footerLogo}>FITWITHRAM</div>
        <div style={{ ...S.footerLinks }} className="footer-links">
          {['Features', 'Pricing', 'Dashboard', 'Privacy', 'Contact'].map(l => (
            <a key={l} href="#" style={S.footerLink}>{l}</a>
          ))}
        </div>
        <div style={S.footerCopy}>© {new Date().getFullYear()} FitWithRam. All rights reserved.</div>
      </footer>

      {/* ── Responsive Styles ── */}
      <style>{`
        @media (max-width: 768px) {
          .hamburger-landing { display: flex !important; }
          .nav-links-desktop { display: none !important; }
          .nav-auth-desktop { display: none !important; }
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
            padding: 2.5rem 1.25rem !important;
          }
          .hero-image-wrap { order: -1; }
          .hero-image-wrap > div { max-width: 340px !important; }
          .hero-image-wrap img { height: 380px !important; }
          .hero-stats { gap: 1.5rem !important; }
          .features-grid, .how-it-works-grid, .pricing-grid, .testimonials-grid {
            grid-template-columns: 1fr !important;
          }
          .landing-footer {
            flex-direction: column !important;
            text-align: center !important;
            gap: 1rem !important;
          }
          .footer-links { flex-wrap: wrap !important; justify-content: center !important; }
          .training-cards-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

    </div>
  )
}
