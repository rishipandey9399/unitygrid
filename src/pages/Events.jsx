import { useState, useEffect } from 'react'
import { Calendar, MapPin, Clock, Users, Tag, ChevronRight, Search, Filter } from 'lucide-react'

// ── Scroll fade-in hook ───────────────────────────────────────────────────────
function useFadeIn(deps = []) {
  useEffect(() => {
    // Small delay so the DOM has painted the new cards
    const timer = setTimeout(() => {
      const els = document.querySelectorAll('.fade-in-scroll:not(.fade-in-visible)')
      if (!els.length) return
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('fade-in-visible')
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.05 }
      )
      els.forEach((el) => observer.observe(el))
      return () => observer.disconnect()
    }, 50)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

// ── Constants ───────────────────────────────────────────────────────────────
const CATEGORIES = ['All', 'Education', 'Health', 'Environment', 'Technology', 'Food & Hunger', 'Women & Girls', 'Social']

const CAT_BG = {
  Education: '#493129', Health: '#8b597b', Environment: '#2e6b4f',
  Technology: '#efa3a0', 'Food & Hunger': '#d4a373', 'Women & Girls': '#9b59b6',
  Social: '#493129'
}

export default function Events() {
  const [events, setEvents] = useState([])
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [enrolledIds, setEnrolledIds] = useState([])
  const [loading, setLoading] = useState(true)
  useFadeIn([events])


  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events')
      if (res.ok) {
        const data = await res.json()
        setEvents(data)
      }
      
      const token = localStorage.getItem('token')
      if (token) {
        const volRes = await fetch('/api/volunteer/events', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (volRes.ok) {
          const volData = await volRes.json()
          setEnrolledIds(volData.enrolled_ids || [])
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleRegister = async (eventId) => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/login'
      return
    }

    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        if (data.enrolled) {
          setEnrolledIds(prev => [...prev, eventId])
        } else {
          setEnrolledIds(prev => prev.filter(id => id !== eventId))
        }
        // Refresh event data to update filled counts
        fetchEvents()
      } else {
        const errorData = await res.json()
        alert(errorData.error || 'Registration failed')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = events.filter(e => {
    const catMatch = category === 'All' || e.category === category
    const searchMatch = search === '' ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.org.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase())
    return catMatch && searchMatch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ffeedb] flex items-center justify-center">
        <p className="font-['Caveat'] text-2xl text-[#493129]">Loading events...</p>
      </div>
    )
  }

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
            {filtered.map(e => (
              <EventCard 
                key={e.id} 
                event={e} 
                isEnrolled={enrolledIds.includes(e.id)}
                onRegister={() => handleRegister(e.id)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

function EventCard({ event, isEnrolled, onRegister }) {
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
        <button 
          onClick={onRegister}
          className={`btn-sketch w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
            isEnrolled 
              ? 'bg-[#2e6b4f] text-white' 
              : 'bg-[#493129] text-white'
          }`}
        >
          {isEnrolled ? (
            <>Registered <ChevronRight size={15} /></>
          ) : (
            <>Register Now <ChevronRight size={15} /></>
          )}
        </button>
      </div>
    </div>
  )
}
