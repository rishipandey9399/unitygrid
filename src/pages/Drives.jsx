import { useState, useEffect } from 'react'
import { MapPin, Clock, Users, Calendar, ChevronRight, Zap, Heart } from 'lucide-react'

// ── Mock drive data ──────────────────────────────────────────────────────────
const TODAY = new Date()
const fmt = (d) => d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })

const ALL_DRIVES = [
  // Today's drives
  {
    id: 1, title: 'River Yamuna Cleanup Drive', ngo: 'GreenRoots', category: 'Environment',
    date: fmt(TODAY), status: 'today', location: 'Yamuna Ghat, Delhi',
    volunteers: 45, slots: 60, time: '7:00 AM – 11:00 AM',
    desc: 'Join us for a morning cleanup along the Yamuna riverbank. Gloves and bags provided.',
  },
  {
    id: 2, title: 'Free Eye Checkup Camp', ngo: 'Karuna Health', category: 'Health',
    date: fmt(TODAY), status: 'today', location: 'Community Hall, Chennai',
    volunteers: 22, slots: 30, time: '9:00 AM – 4:00 PM',
    desc: 'Walk-in eye checkups and free spectacle distribution for underserved communities.',
  },
  {
    id: 3, title: 'Code with Teens — Weekend Bootcamp', ngo: 'ByteBridge', category: 'Technology',
    date: fmt(TODAY), status: 'today', location: 'Tech Hub, Hyderabad',
    volunteers: 12, slots: 20, time: '10:00 AM – 1:00 PM',
    desc: 'Teach basic Python to high-school students. No prior teaching experience needed.',
  },

  // Recent / upcoming
  {
    id: 4, title: 'Meal Distribution — Sunday Special', ngo: 'Annapurna Collective', category: 'Food & Hunger',
    date: fmt(new Date(TODAY.getTime() + 2 * 86400000)), status: 'upcoming', location: 'Station Area, Pune',
    volunteers: 0, slots: 40, time: '12:00 PM – 3:00 PM',
    desc: 'Help us cook and distribute 500+ meals to daily-wage workers near the railway station.',
  },
  {
    id: 5, title: 'Women\'s Self-Defense Workshop', ngo: 'Udaan Foundation', category: 'Women & Girls',
    date: fmt(new Date(TODAY.getTime() + 4 * 86400000)), status: 'upcoming', location: 'Community Centre, Delhi',
    volunteers: 8, slots: 25, time: '3:00 PM – 5:00 PM',
    desc: 'Volunteer instructors needed for a free self-defense workshop for young women.',
  },
  {
    id: 6, title: 'Mobile Library — Village Tour', ngo: 'Aksharavana Trust', category: 'Education',
    date: fmt(new Date(TODAY.getTime() + 7 * 86400000)), status: 'upcoming', location: 'Rural Bangalore',
    volunteers: 5, slots: 15, time: '8:00 AM – 6:00 PM',
    desc: 'Drive our mobile library van to three villages and conduct reading sessions with children.',
  },

  // Previous / completed
  {
    id: 7, title: 'Tree Plantation — Miyawaki Method', ngo: 'GreenRoots', category: 'Environment',
    date: fmt(new Date(TODAY.getTime() - 3 * 86400000)), status: 'previous', location: 'Aarey Colony, Mumbai',
    volunteers: 55, slots: 55, time: '6:30 AM – 10:00 AM',
    desc: 'Successfully planted 200+ native saplings using the Miyawaki dense-forest technique.',
  },
  {
    id: 8, title: 'Blood Donation Camp', ngo: 'Karuna Health', category: 'Health',
    date: fmt(new Date(TODAY.getTime() - 5 * 86400000)), status: 'previous', location: 'Town Hall, Chennai',
    volunteers: 78, slots: 80, time: '9:00 AM – 5:00 PM',
    desc: 'Collected 120 units of blood for the regional blood bank. Thank you to all donors!',
  },
  {
    id: 9, title: 'Literacy Assessment Drive', ngo: 'Aksharavana Trust', category: 'Education',
    date: fmt(new Date(TODAY.getTime() - 10 * 86400000)), status: 'previous', location: 'Govt School, Bangalore',
    volunteers: 30, slots: 30, time: '10:00 AM – 2:00 PM',
    desc: 'Assessed reading levels of 300+ students across 5 government primary schools.',
  },
]

const TABS = [
  { key: 'today', label: "Today's Drives", icon: <Zap size={14} /> },
  { key: 'upcoming', label: 'Upcoming', icon: <Calendar size={14} /> },
  { key: 'previous', label: 'Previous', icon: <Clock size={14} /> },
]

const CAT_COLORS = {
  'Environment': { bg: '#2e6b4f', text: '#fff' },
  'Health': { bg: '#8b597b', text: '#fff' },
  'Technology': { bg: '#493129', text: '#ffeedb' },
  'Food & Hunger': { bg: '#d4a373', text: '#fff' },
  'Education': { bg: '#efa3a0', text: '#fff' },
  'Women & Girls': { bg: '#c06c84', text: '#fff' },
}

function DriveCard({ drive }) {
  const color = CAT_COLORS[drive.category] || { bg: '#493129', text: '#fff' }
  const isFull = drive.volunteers >= drive.slots
  const pct = Math.round((drive.volunteers / drive.slots) * 100)

  return (
    <div className="border-sketch bg-white rounded-xl p-5 card-lift flex flex-col">
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <span
          className="inline-block text-[10px] font-bold tracking-widest px-2.5 py-0.5 rounded-full"
          style={{ background: color.bg, color: color.text }}
        >
          {drive.category.toUpperCase()}
        </span>
        <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full ${
          drive.status === 'today' ? 'bg-green-100 text-green-700'
          : drive.status === 'upcoming' ? 'bg-blue-100 text-blue-700'
          : 'bg-gray-100 text-gray-500'
        }`}>
          {drive.status === 'today' ? '● LIVE TODAY' : drive.status === 'upcoming' ? 'UPCOMING' : 'COMPLETED'}
        </span>
      </div>

      {/* Title & NGO */}
      <h3 className="font-bold text-lg text-[#493129] leading-snug mb-1">{drive.title}</h3>
      <p className="text-xs text-[#8b597b] font-semibold mb-2">by {drive.ngo}</p>
      <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-grow">{drive.desc}</p>

      {/* Meta */}
      <div className="space-y-1.5 text-xs text-gray-500 mb-4">
        <p className="flex items-center gap-1.5"><MapPin size={12} className="text-[#8b597b]" /> {drive.location}</p>
        <p className="flex items-center gap-1.5"><Calendar size={12} className="text-[#8b597b]" /> {drive.date}</p>
        <p className="flex items-center gap-1.5"><Clock size={12} className="text-[#8b597b]" /> {drive.time}</p>
      </div>

      {/* Volunteer progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="flex items-center gap-1 text-gray-500"><Users size={11} /> {drive.volunteers}/{drive.slots} volunteers</span>
          <span className="font-bold text-[#493129]">{pct}%</span>
        </div>
        <div className="h-2 bg-[#ffdec7] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: isFull ? '#2e6b4f' : '#efa3a0' }}
          />
        </div>
      </div>

      {/* CTA */}
      {drive.status !== 'previous' ? (
        <button
          disabled={isFull}
          className={`btn-sketch w-full py-2 text-sm font-semibold ${
            isFull
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300 shadow-none'
              : 'bg-[#493129] text-[#ffeedb]'
          }`}
        >
          {isFull ? 'Slots Full' : 'Join This Drive'}
        </button>
      ) : (
        <div className="text-center py-2 text-xs text-gray-400 font-medium border-t border-gray-100">
          ✓ Completed — {drive.volunteers} volunteers participated
        </div>
      )}
    </div>
  )
}

export default function Drives() {
  const [drives, setDrives] = useState([])
  const [tab, setTab] = useState('upcoming')

  const fetchDrives = async () => {
    try {
      const res = await fetch('/api/drives')
      if (res.ok) {
        const data = await res.json()
        const mapped = data.map(d => ({
          id: d.id,
          title: d.title,
          ngo: d.ngo_name || 'NGO',
          category: d.tags && d.tags.length > 0 ? d.tags[0] : 'Community',
          date: d.date,
          status: 'upcoming', // default mapped
          location: d.location,
          volunteers: d.slots,
          slots: d.total,
          time: `${d.hours} hours`,
          desc: d.description
        }))
        setDrives(mapped)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchDrives()
  }, [])

  const filtered = drives.filter(d => d.status === tab)

  const todayCount = drives.filter(d => d.status === 'today').length
  const upcomingCount = drives.filter(d => d.status === 'upcoming').length

  return (
    <div className="min-h-screen bg-[#ffeedb] py-12">
      <div className="max-w-7xl mx-auto px-6">

        {/* Page header */}
        <div className="text-center mb-10">
          <p className="inline-block text-xs font-semibold tracking-widest text-[#8b597b] bg-[#ffdec7] px-4 py-1 rounded-full mb-4 border border-[#efa3a0]">
            🚀 ACTIVE DRIVES
          </p>
          <h1 className="font-bold text-4xl md:text-5xl text-[#493129] leading-tight mb-3">
            Drives
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
            Browse today's live drives, upcoming opportunities, and past events from NGOs across the platform.
          </p>
        </div>

        {/* Stats strip */}
        <div className="flex justify-center gap-6 mb-10">
          <div className="border-sketch bg-white px-6 py-3 rounded-xl text-center">
            <p className="text-2xl font-bold text-[#493129]">{todayCount}</p>
            <p className="text-xs text-gray-500">Live Today</p>
          </div>
          <div className="border-sketch bg-white px-6 py-3 rounded-xl text-center">
            <p className="text-2xl font-bold text-[#8b597b]">{upcomingCount}</p>
            <p className="text-xs text-gray-500">Upcoming</p>
          </div>
          <div className="border-sketch bg-white px-6 py-3 rounded-xl text-center">
            <p className="text-2xl font-bold text-[#efa3a0]">{drives.length}</p>
            <p className="text-xs text-gray-500">Total Drives</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-10">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                tab === t.key
                  ? 'border-[#493129] bg-[#493129] text-white'
                  : 'border-[#493129] text-[#493129] hover:bg-[#ffdec7]'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Drive grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(d => <DriveCard key={d.id} drive={d} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart size={40} className="mx-auto text-[#efa3a0] mb-4" />
            <p className="text-gray-500">No drives in this category right now.</p>
          </div>
        )}

      </div>
    </div>
  )
}
