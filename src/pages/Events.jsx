import { useState, useEffect } from 'react'
import { Calendar, MapPin, Clock, Users, Tag, ChevronRight, Search, Filter } from 'lucide-react'

// ── Scroll fade-in hook ───────────────────────────────────────────────────────
function useFadeIn() {
  useEffect(() => {
    const observe = () => {
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
        { threshold: 0.1 }
      )
      els.forEach((el) => observer.observe(el))
      return () => observer.disconnect()
    }
    return observe()
  }, [])
}

// ── Mock event data ───────────────────────────────────────────────────────────
const EVENTS = [
  {
    id: 1,
    org: 'Aksharavana Trust',
    category: 'Education',
    title: 'Summer Reading Festival',
    desc: 'A day-long reading celebration for children aged 6–14. Storytelling, book gifting, and an art wall.',
    date: 'Sun, May 4, 2026',
    time: '9:00 AM – 4:00 PM',
    location: 'Indiranagar Community Hall, Bangalore',
    slots: 60,
    filled: 38,
    tags: ['Education', 'Kids', 'Community'],
    color: '#493129',
  },
  {
    id: 2,
    org: 'Karuna Health',
    category: 'Health',
    title: 'Free Health & Wellness Camp',
    desc: 'General check-ups, blood pressure screening, and dental consultations for underserved families.',
    date: 'Sat, May 10, 2026',
    time: '8:00 AM – 2:00 PM',
    location: 'Hebbal Bus Terminal Ground, Bangalore',
    slots: 200,
    filled: 134,
    tags: ['Health', 'Medical', 'Free'],
    color: '#8b597b',
  },
  {
    id: 3,
    org: 'GreenRoots',
    category: 'Environment',
    title: 'Bellandur Lake Restoration Walk',
    desc: 'Community cleanup and awareness walk around Bellandur Lake. Gloves and trash bags provided.',
    date: 'Sun, May 11, 2026',
    time: '6:30 AM – 10:00 AM',
    location: 'Bellandur Lake, Bangalore',
    slots: 120,
    filled: 89,
    tags: ['Environment', 'Outdoor', 'Cleanup'],
    color: '#2e6b4f',
  },
  {
    id: 4,
    org: 'ByteBridge',
    category: 'Technology',
    title: 'Code Your Future — Hackathon',
    desc: 'A 6-hour hackathon for high-school students to build solutions for real social problems.',
    date: 'Sat, May 17, 2026',
    time: '10:00 AM – 4:00 PM',
    location: 'NIMHANS Convention Centre, Bangalore',
    slots: 80,
    filled: 55,
    tags: ['Technology', 'Youth', 'Hackathon'],
    color: '#efa3a0',
  },
  {
    id: 5,
    org: 'Annapurna Collective',
    category: 'Food & Hunger',
    title: 'Community Feast — 1 Lakh Meals',
    desc: 'Celebrate our milestone of 1 lakh meals served. Cook, serve, and celebrate with our volunteers.',
    date: 'Sun, May 18, 2026',
    time: '11:00 AM – 3:00 PM',
    location: 'Jayanagar 4th Block Ground, Bangalore',
    slots: 150,
    filled: 90,
    tags: ['Food', 'Community', 'Celebration'],
    color: '#d4a373',
  },
  {
    id: 6,
    org: 'Udaan Foundation',
    category: 'Women & Girls',
    title: 'Empowerment Workshop Series',
    desc: 'A skills-building workshop for women in urban slums — finance, legal rights, and digital literacy.',
    date: 'Sat, May 24, 2026',
    time: '10:00 AM – 1:00 PM',
    location: 'Dharavi Resource Centre, Mumbai',
    slots: 50,
    filled: 22,
    tags: ['Women', 'Education', 'Empowerment'],
    color: '#9b59b6',
  },
]

const CATEGORIES = ['All', 'Education', 'Health', 'Environment', 'Technology', 'Food & Hunger', 'Women & Girls']

const CAT_BG = {
  Education: '#493129', Health: '#8b597b', Environment: '#2e6b4f',
  Technology: '#efa3a0', 'Food & Hunger': '#d4a373', 'Women & Girls': '#9b59b6',
}

function EventCard({ event }) {
  const pct = Math.round((event.filled / event.slots) * 100)
  return (
    <div className="border-sketch bg-white rounded-2xl overflow-hidden card-lift fade-in-scroll flex flex-col">
      {/* Coloured top bar */}
      <div className="h-2" style={{ background: event.color }} />
      <div className="p-6 flex-1 flex flex-col">
        {/* Category + org */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className="text-[10px] font-bold tracking-widest text-white px-2.5 py-0.5 rounded-full"
            style={{ background: CAT_BG[event.category] || event.color }}
          >
            {event.category.toUpperCase()}
          </span>
          <span className="text-xs text-gray-400 font-medium">{event.org}</span>
        </div>

        <h3 className="font-bold text-[#493129] text-xl leading-tight mb-2">{event.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-4">{event.desc}</p>

        {/* Meta info */}
        <div className="flex flex-col gap-2 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-2"><Calendar size={13} className="text-[#efa3a0]" /> {event.date}</span>
          <span className="flex items-center gap-2"><Clock size={13} className="text-[#efa3a0]" /> {event.time}</span>
          <span className="flex items-center gap-2"><MapPin size={13} className="text-[#efa3a0]" /> {event.location}</span>
          <span className="flex items-center gap-2"><Users size={13} className="text-[#efa3a0]" /> {event.filled}/{event.slots} registered</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {event.tags.map(t => (
            <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-gray-300 text-gray-500">
              #{t}
            </span>
          ))}
        </div>

        {/* Fill bar */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-1.5 text-xs text-gray-400">
            <span>{pct}% filled</span>
            <span>{event.slots - event.filled} spots left</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-gray-100">
            <div
              className="h-1.5 rounded-full transition-all"
              style={{ width: `${pct}%`, background: pct > 70 ? '#efa3a0' : '#2e6b4f' }}
            />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-6">
        <button className="btn-sketch w-full py-2.5 text-sm font-bold bg-[#493129] text-white flex items-center justify-center gap-2">
          Register Now <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}

export default function Events() {
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  useFadeIn()

  const filtered = EVENTS.filter(e => {
    const catMatch = category === 'All' || e.category === category
    const searchMatch = search === '' ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.org.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase())
    return catMatch && searchMatch
  })

  return (
    <main className="min-h-screen bg-[#ffeedb]">
      {/* Hero banner */}
      <section className="bg-[#493129] pt-14 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-['Caveat'] text-[#efa3a0] text-xl mb-2 fade-in-scroll">happening near you</p>
          <h1 className="font-bold text-4xl md:text-5xl text-white max-w-2xl leading-tight mb-4 fade-in-scroll">
            Events by <span className="text-[#efa3a0]">NGOs</span> across India
          </h1>
          <p className="text-gray-300 text-sm max-w-lg mb-8 fade-in-scroll">
            Browse upcoming drives, camps, workshops and community gatherings organised by our NGO partners.
            Register in seconds and show up for good.
          </p>

          {/* Search bar */}
          <div className="relative max-w-md fade-in-scroll">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events by name, NGO, or city…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border-2 border-white/20 text-sm outline-none focus:border-[#efa3a0] transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-wrap gap-2 fade-in-scroll">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                category === c
                  ? 'border-[#493129] bg-[#493129] text-white'
                  : 'border-[#493129] text-[#493129] hover:bg-[#ffdec7]'
              }`}
            >
              {c}
            </button>
          ))}
          <span className="text-xs text-gray-400 self-center ml-2">{filtered.length} events found</span>
        </div>
      </section>

      {/* Events grid */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center py-24 fade-in-scroll">
            <p className="font-['Caveat'] text-3xl text-gray-400">No events match your search.</p>
            <p className="text-sm text-gray-400 mt-2">Try a different category or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </section>
    </main>
  )
}
