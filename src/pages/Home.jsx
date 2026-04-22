import { useRef, useEffect, useState, useCallback } from 'react'
import { ArrowRight, ChevronRight, MapPin, Users, Sparkles, Heart, BookOpen, Zap, UserCheck, Search, CalendarCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

// ── Scroll fade-in hook ───────────────────────────────────────────────────────
function useFadeIn() {
  useEffect(() => {
    const els = document.querySelectorAll('.fade-in-scroll')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

// ── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 pt-12 pb-4">
      {/* Headline */}
      <div className="text-center mb-10 fade-in-scroll">
        <p className="inline-block text-xs font-semibold tracking-widest text-[#8b597b] bg-[#ffdec7] px-4 py-1 rounded-full mb-4 border border-[#efa3a0]">
          🌱 Connecting NGOs &amp; Volunteers
        </p>
        <h1 className="font-bold text-4xl md:text-6xl text-[#493129] leading-tight max-w-3xl mx-auto">
          Give the gift of<br />
          <span className="sketch-underline">impact — help us</span><br />
          unite every drive.
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto mt-5 text-sm leading-relaxed">
          Your support connects NGOs and volunteers to create meaningful change.
          Together, we make sure every cause finds the right hands to carry it forward.
        </p>
        <Link to="/volunteer">
          <button className="btn-sketch mt-7 px-8 py-3 font-bold text-sm bg-[#493129] text-[#ffeedb] inline-flex items-center gap-2">
            Explore Drives <ArrowRight size={15} />
          </button>
        </Link>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-auto">

        {/* Card 1 — Photo + quote */}
        <div className="border-sketch bg-[#493129] text-white p-5 rounded-2xl flex flex-col justify-end row-span-2 min-h-[240px] relative overflow-hidden fade-in-scroll" style={{ transitionDelay: '0ms' }}>
          <div className="absolute inset-0 opacity-20"
            style={{ background: 'repeating-linear-gradient(45deg, #8b597b 0, #8b597b 1px, transparent 1px, transparent 10px)' }} />
          <div className="relative z-10">
            <p className="font-['Caveat'] text-xl leading-snug text-[#ffdec7]">"Be the reason a volunteer smiles"</p>
            <p className="text-xs text-[#efa3a0] mt-2">Join 1,200+ active volunteers</p>
          </div>
        </div>

        {/* Card 2 — Stat */}
        <div className="border-sketch bg-[#efa3a0] text-white p-5 rounded-2xl flex flex-col justify-between fade-in-scroll" style={{ transitionDelay: '100ms' }}>
          <p className="text-3xl font-bold">200+</p>
          <p className="text-sm font-medium mt-1 leading-snug">Trained NGOs empowering communities every day</p>
        </div>

        {/* Card 3 — Centre CTA */}
        <div className="border-sketch bg-[#8b597b] text-white p-5 rounded-2xl flex flex-col justify-between col-span-1 fade-in-scroll" style={{ transitionDelay: '200ms' }}>
          <p className="font-['Caveat'] text-lg text-[#ffdec7]">Join 1000 people building a better tomorrow.</p>
          <Link to="/login">
            <button className="mt-4 w-full py-2 rounded-xl bg-white text-[#8b597b] font-bold text-sm btn-sketch">
              Join Community
            </button>
          </Link>
        </div>

        {/* Card 4 — Drives count */}
        <div className="border-sketch bg-[#ffdec7] text-[#493129] p-5 rounded-2xl flex flex-col justify-between fade-in-scroll" style={{ transitionDelay: '300ms' }}>
          <Sparkles size={20} className="text-[#8b597b]" />
          <div>
            <p className="text-3xl font-bold">1,400+</p>
            <p className="text-sm mt-1">volunteer drives across India</p>
          </div>
        </div>

        {/* Card 5 — Photo style (tall) */}
        <div className="border-sketch bg-[#ffdec7] rounded-2xl overflow-hidden min-h-[180px] flex flex-col justify-end p-4 relative fade-in-scroll" style={{ transitionDelay: '400ms' }}>
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Heart size={80} className="text-[#efa3a0]" />
          </div>
          <p className="relative z-10 font-['Caveat'] text-lg text-[#493129]">Inspire change, Inspire education</p>
        </div>

        {/* Card 6 — Stat */}
        <div className="border-sketch bg-white text-[#493129] p-5 rounded-2xl fade-in-scroll" style={{ transitionDelay: '500ms' }}>
          <p className="text-xs font-bold tracking-widest text-[#8b597b]">IMPACT</p>
          <p className="font-bold text-3xl mt-2">85%</p>
          <p className="text-sm text-gray-500 mt-1">increase in literacy across served regions</p>
        </div>

        {/* Card 7 — Dark right */}
        <div className="border-sketch bg-[#493129] text-white p-5 rounded-2xl flex flex-col justify-between fade-in-scroll" style={{ transitionDelay: '600ms' }}>
          <p className="font-['Caveat'] text-base text-[#ffdec7]">ONE child, one Teacher, one Book</p>
          <div className="w-12 h-12 rounded-full border-2 border-[#efa3a0] flex items-center justify-center mt-4">
            <BookOpen size={20} className="text-[#efa3a0]" />
          </div>
        </div>

      </div>
    </section>
  )
}

// ── How It Works (numbered boxes) ────────────────────────────────────────────
const STEPS = [
  {
    num: '01',
    icon: <UserCheck size={22} />,
    title: 'Sketch your profile',
    desc: 'Tell us your skills, location and free days. Takes under a minute.',
  },
  {
    num: '02',
    icon: <Search size={22} />,
    title: 'We match, you pick',
    desc: 'Our engine scores drives within 10 km and explains why each one fits you.',
  },
  {
    num: '03',
    icon: <CalendarCheck size={22} />,
    title: 'Show up, log hours',
    desc: 'Your Social Impact CV updates automatically. Share it. Own it.',
  },
]

function HowItWorksSection() {
  return (
    <section className="bg-[#493129] py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10 fade-in-scroll">
          <p className="font-['Caveat'] text-[#efa3a0] text-xl mb-1">simple as 1-2-3</p>
          <h2 className="font-bold text-3xl text-white">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className="border-2 border-white/20 rounded-2xl p-8 relative fade-in-scroll"
              style={{ animationDelay: `${i * 120}ms`, transitionDelay: `${i * 120}ms` }}
            >
              {/* Number */}
              <p className="font-['Caveat'] text-[#efa3a0] text-4xl font-bold mb-4 leading-none">{s.num}</p>
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#efa3a0] mb-5">
                {s.icon}
              </div>
              <h3 className="font-bold text-white text-xl mb-3">{s.title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Recent Articles ──────────────────────────────────────────────────────────
const ARTICLES = [
  { cat: 'Education', title: 'How reading circles are changing rural literacy', date: 'Apr 18, 2026' },
  { cat: 'Health', title: 'Mobile health camps — scaling to tier-3 cities', date: 'Apr 14, 2026' },
  { cat: 'Technology', title: 'Code with Teens: 300 students, one semester', date: 'Apr 10, 2026' },
  { cat: 'Environment', title: 'The lake that came back: a cleanup story', date: 'Apr 5, 2026' },
  { cat: 'Food & Hunger', title: "Annapurna's 1 lakh meals milestone", date: 'Mar 30, 2026' },
]

const CAT_COLOR = {
  Education: '#493129', Health: '#8b597b', Technology: '#efa3a0',
  Environment: '#2e6b4f', 'Food & Hunger': '#d4a373',
}

function ArticlesSection() {
  const ref = useRef()
  return (
    <section className="py-12 bg-[#ffdec7]/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6 fade-in-scroll">
          <div>
            <h2 className="font-bold text-3xl text-[#493129]">Recent Articles</h2>
            <p className="text-gray-400 text-sm mt-1">Stories from the ground</p>
          </div>
          <span className="text-xs text-gray-400 flex items-center gap-1 italic">scroll →</span>
        </div>
        <div ref={ref} className="scroll-container flex gap-4 pb-3 fade-in-scroll">
          {ARTICLES.map(a => (
            <div key={a.title} className="shrink-0 w-64 border-sketch bg-white p-5 rounded-xl card-lift cursor-pointer">
              <span
                className="inline-block text-[10px] font-bold tracking-widest text-white px-2 py-0.5 rounded-full mb-3"
                style={{ background: CAT_COLOR[a.cat] }}
              >
                {a.cat.toUpperCase()}
              </span>
              <h3 className="font-semibold text-[#493129] text-sm leading-snug">{a.title}</h3>
              <p className="text-xs text-gray-400 mt-3">{a.date}</p>
              <p className="text-xs text-[#8b597b] font-semibold mt-2 flex items-center gap-1">
                Read more <ChevronRight size={11} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── What We Do ───────────────────────────────────────────────────────────────
function Building2({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
    </svg>
  )
}

const PILLARS = [
  {
    icon: <Building2 />,
    title: 'Connect NGOs',
    desc: 'Multi-tenant dashboards for NGOs to manage drives, volunteers, and impact — all in one place.',
  },
  {
    icon: <Users />,
    title: 'Empower Volunteers',
    desc: 'Volunteers build a Social Impact CV, earn badges, and get matched to drives near them.',
  },
  {
    icon: <Sparkles />,
    title: 'AI-Powered Matching',
    desc: 'Our engine matches volunteers to drives based on skills, proximity, and availability.',
  },
]


function WhatWeDoSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-10 fade-in-scroll">
        <h2 className="font-bold text-3xl text-[#493129]">What We Do</h2>
        <p className="text-gray-400 text-sm mt-2">Three pillars of meaningful connection</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PILLARS.map((p, i) => (
          <div
            key={i}
            className="border-sketch bg-white p-7 rounded-2xl text-center card-lift fade-in-scroll"
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#ffdec7] flex items-center justify-center mx-auto mb-5 text-[#8b597b]">
              {p.icon}
            </div>
            <h3 className="font-bold text-xl text-[#493129] mb-3">{p.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function JoinForm() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('volunteer')
  const [done, setDone] = useState(false)
  const navigate = useNavigate()
  return (
    <section className="bg-[#493129] py-16">
      <div className="max-w-2xl mx-auto px-6 text-center fade-in-scroll">
        <p className="font-['Caveat'] text-[#efa3a0] text-xl mb-2">ready to make a difference?</p>
        <h2 className="font-bold text-3xl md:text-4xl text-white mb-4">Join the Unity<span className="text-[#efa3a0]">Drive</span></h2>
        <p className="text-gray-400 text-sm mb-8">Whether you're an NGO or a volunteer — your first step starts here.</p>
        {done ? (
          <div className="border-2 border-[#efa3a0] rounded-2xl py-8 px-6 text-[#efa3a0] font-['Caveat'] text-2xl">
            ✓ You're on the list! We'll be in touch soon.
          </div>
        ) : (
          <div className="border-sketch-plum bg-white/5 backdrop-blur p-8 rounded-2xl">
            <div className="flex border-2 border-white/20 rounded-xl overflow-hidden mb-5">
              {[['volunteer', "I'm a Volunteer"], ['ngo', 'I represent an NGO']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setRole(val)}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${role === val ? 'bg-[#efa3a0] text-white' : 'text-gray-300 hover:text-white'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border-2 border-white/20 text-sm outline-none focus:border-[#efa3a0] transition-colors mb-4"
            />
            <button
              onClick={() => {
                 if(email) setDone(true);
                 setTimeout(() => navigate('/login'), 1500)
              }}
              className="btn-sketch w-full py-3 font-bold text-sm bg-[#efa3a0] text-white"
            >
              Join as {role === 'volunteer' ? 'Volunteer' : 'NGO'} →
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

// ── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#493129] border-t-2 border-[#8b597b] py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[#ffeedb]">
          <Heart size={16} className="text-[#efa3a0]" fill="#efa3a0" />
          <span className="font-['Caveat'] text-xl font-bold">UNITYDRIVE</span>
        </div>
        <div className="flex gap-6 text-sm text-gray-400">
          {['About', 'Privacy', 'Terms', 'Contact'].map(l => (
            <a key={l} href="#" className="hover:text-[#efa3a0] transition-colors">{l}</a>
          ))}
        </div>
        <p className="text-xs text-gray-500">© 2026 UNITYDRIVE. Built with ❤️</p>
      </div>
    </footer>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  useFadeIn()
  return (
    <main>
      <HeroSection />
      <HowItWorksSection />
      <ArticlesSection />
      <WhatWeDoSection />
      <JoinForm />
      <Footer />
    </main>
  )
}
