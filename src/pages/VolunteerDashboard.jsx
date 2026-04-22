import { useState, useEffect } from 'react'
import {
  Clock, Heart, Award, MapPin, Calendar, Users,
  Star, Download, Bookmark, CheckCircle, ChevronRight,
  Sparkles, Target
} from 'lucide-react'

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
      { threshold: 0.1 }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

// ── Mock data ────────────────────────────────────────────────────────────────
const volunteer = {
  name: 'Aanya Patel',
  initials: 'AP',
  hours: 142,
  drives: 18,
  badges: 3,
  skills: ['Teaching', 'Translation', 'Tech'],
  availability: ['22\nApr Wed', '25\nApr Sat', '29\nApr Wed', '2\nMay Sat'],
  nextBadge: { label: '200 Hour Club', hoursLeft: 58, progress: 71 },
  earnedBadges: [
    { label: 'First 100 hrs', year: 2026 },
    { label: 'Storyteller', year: 2025 },
    { label: 'Crisis Responder', year: 2024 },
  ],
}

const allDrives = [
  {
    id: 1,
    org: 'AKSHARAVANA TRUST',
    title: 'Saturday Reading Circle',
    desc: 'Read with kids at the community library. Hindi/English/Kannada welcome.',
    tags: ['Teaching', 'Translation'],
    location: 'Indiranagar',
    distance: '0.6 km',
    date: 'Sat, Apr 25',
    free: true,
    slots: '7/12',
    skillsMatched: 2,
    proximity: 'very close',
    match: 97,
  },
  {
    id: 2,
    org: 'BYTEBRIDGE',
    title: 'Code with Teens',
    desc: 'Intro to Python session for high-schoolers from govt. schools.',
    tags: ['Tech', 'Teaching'],
    location: 'Domlur',
    distance: '5.1 km',
    date: 'Wed, Apr 22',
    free: true,
    slots: '3/8',
    skillsMatched: 2,
    proximity: 'nearby',
    match: 75,
  },
  {
    id: 3,
    org: 'KARUNA HEALTH',
    title: 'Mobile Health Camp',
    desc: 'Set up a free check-up camp. Doctors, nurses, and runners needed.',
    tags: ['Medical', 'Logistics'],
    location: 'Hebbal',
    distance: '5.1 km',
    date: 'Wed, Apr 29',
    free: true,
    slots: '11/20',
    skillsMatched: 0,
    proximity: 'nearby',
    match: 40,
  },
  {
    id: 4,
    org: 'ANNAPURNA COLLECTIVE',
    title: 'Community Kitchen',
    desc: 'Cook and serve 300 meals at the weekend kitchen.',
    tags: ['Cooking', 'Logistics'],
    location: 'Jayanagar',
    distance: '2.9 km',
    date: 'Sun, Apr 26',
    free: false,
    slots: '9/15',
    skillsMatched: 0,
    proximity: 'very close',
    match: 36,
  },
]

// ── Match ring ───────────────────────────────────────────────────────────────
function MatchRing({ score }) {
  const radius = 24
  const circ = 2 * Math.PI * radius
  const dash = (score / 100) * circ
  const color = score >= 70 ? '#efa3a0' : score >= 40 ? '#d4a373' : '#ccc'
  return (
    <div className="flex flex-col items-center shrink-0">
      <svg width="60" height="60">
        <circle cx="30" cy="30" r={radius} fill="none" stroke="#e8e0d8" strokeWidth="5" />
        <circle
          cx="30" cy="30" r={radius} fill="none"
          stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 30 30)"
        />
        <text x="30" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fill="#493129">{score}</text>
      </svg>
      <span className="text-[11px] text-[#efa3a0] font-medium -mt-1">match</span>
    </div>
  )
}

// ── Drive card ───────────────────────────────────────────────────────────────
function DriveCard({ drive, saved, onSave }) {
  return (
    <div className="border-sketch bg-white p-5 rounded-xl card-lift">
      <div className="flex gap-4 items-start">
        <div className="flex-1">
          <p className="text-[11px] font-semibold text-[#8b597b] tracking-widest mb-1">{drive.org}</p>
          <h3 className="font-bold text-[#493129] text-lg leading-tight">{drive.title}</h3>
          <p className="text-sm text-gray-600 mt-1 mb-3">{drive.desc}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {drive.tags.map(t => (
              <span key={t} className="px-3 py-0.5 rounded-full bg-[#efa3a0] text-white text-xs font-semibold">{t}</span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><MapPin size={12} /> {drive.location} · {drive.distance}</span>
            <span className="flex items-center gap-1"><Calendar size={12} /> {drive.date}</span>
            {drive.free && <span className="text-green-600 font-semibold">· you're free</span>}
            <span className="flex items-center gap-1"><Users size={12} /> {drive.slots}</span>
          </div>
        </div>
        <MatchRing score={drive.match} />
      </div>
      <div className="border-t border-dashed border-gray-300 mt-4 pt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">{drive.skillsMatched} skills matched · {drive.proximity}</span>
        <div className="flex gap-2">
          <button
            onClick={() => onSave(drive.id)}
            className={`btn-sketch px-4 py-1.5 text-sm font-semibold transition-colors ${
              saved
                ? 'bg-red-50 text-red-500 border-red-300 hover:bg-red-100'
                : 'bg-white text-[#493129] hover:bg-[#ffdec7]'
            }`}
          >
            {saved ? '✕ Unsave' : '🔖 Save'}
          </button>
          <button className="btn-sketch px-4 py-1.5 text-sm font-semibold bg-[#efa3a0] text-white">
            Sign up
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function VolunteerDashboard() {
  const [savedIds, setSavedIds] = useState([])
  useFadeIn()

  const toggleSave = (id) => {
    setSavedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  // Saved drives shown first, then rest sorted by match score
  const savedDrives = allDrives.filter(d => savedIds.includes(d.id))
  const otherDrives = allDrives.filter(d => !savedIds.includes(d.id))

  return (
    <div className="min-h-screen bg-[#ffeedb] px-4 py-8">
      <div className="max-w-5xl mx-auto">

        {/* ── Social Impact CV Card ── */}
        <div className="border-sketch bg-white p-6 rounded-2xl mb-8 relative fade-in-scroll">
          {/* top-right label */}
          <p className="absolute top-5 right-6 font-['Caveat'] text-[#efa3a0] text-base italic">social impact CV</p>

          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-[#efa3a0] flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-md">
              {volunteer.initials}
            </div>
            <div className="flex-1">
              <p className="font-['Caveat'] text-gray-500 text-lg italic">hello, I'm</p>
              <h1 className="font-bold text-[#493129] text-4xl leading-tight">{volunteer.name}</h1>
              <p className="text-sm text-gray-600 mt-2">
                <span className="bg-yellow-200 px-1 font-semibold">{volunteer.hours} hours served</span>{' '}
                across {volunteer.drives} drives. Skilled in {volunteer.skills.join(', ')}.
              </p>
            </div>
            <button className="btn-sketch px-5 py-2 text-sm font-bold bg-[#493129] text-white flex items-center gap-2 shrink-0">
              <Download size={15} /> Export CV
            </button>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-dashed border-gray-200 my-6" />

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <Clock size={22} className="text-[#efa3a0] mx-auto mb-1" />
              <p className="font-bold text-3xl text-[#493129]">{volunteer.hours}</p>
              <p className="text-xs font-semibold text-gray-400 tracking-widest mt-1">HOURS</p>
            </div>
            <div>
              <Heart size={22} className="text-[#efa3a0] mx-auto mb-1" />
              <p className="font-bold text-3xl text-[#493129]">{volunteer.drives}</p>
              <p className="text-xs font-semibold text-gray-400 tracking-widest mt-1">DRIVES</p>
            </div>
            <div>
              <Award size={22} className="text-[#efa3a0] mx-auto mb-1" />
              <p className="font-bold text-3xl text-[#493129]">{volunteer.badges}</p>
              <p className="text-xs font-semibold text-gray-400 tracking-widest mt-1">BADGES</p>
            </div>
          </div>
        </div>

        {/* ── Two-column lower section ── */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left — Drives list */}
          <div className="flex-1">

            {/* Saved drives (shown first if any) */}
            {savedDrives.length > 0 && (
              <div className="mb-8 p-4 bg-[#ffdec7]/40 rounded-2xl border-2 border-[#efa3a0]">
                <h2 className="font-bold text-xl text-[#493129] mb-1 flex items-center gap-2">
                  <Bookmark size={18} className="text-[#efa3a0]" fill="#efa3a0" />
                  Saved Drives
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#efa3a0] text-white text-xs font-bold">{savedDrives.length}</span>
                </h2>
                <p className="text-xs text-gray-500 mb-4">Drives you've bookmarked</p>
                <div className="flex flex-col gap-4">
                  {savedDrives.map(d => (
                    <DriveCard key={d.id} drive={d} saved={true} onSave={toggleSave} />
                  ))}
                </div>
              </div>
            )}

            {/* Recommended drives */}
            <div>
              <h2 className="font-bold text-xl text-[#493129] mb-1 flex items-center gap-2">
                <Sparkles size={18} className="text-[#efa3a0]" />
                Recommended for you
                <span className="font-['Caveat'] text-sm text-gray-400 font-normal ml-1">by the match engine</span>
              </h2>
              <p className="text-xs text-gray-400 mb-4">Sorted by skill &amp; proximity match</p>
              <div>
                {otherDrives.map(d => (
                  <DriveCard key={d.id} drive={d} saved={false} onSave={toggleSave} />
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-full lg:w-72 flex flex-col gap-4">

            {/* Skills */}
            <div className="border-sketch bg-white p-5 rounded-xl fade-in-scroll">
              <h3 className="font-bold text-[#493129] mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {volunteer.skills.map(s => (
                  <span key={s} className="px-3 py-1 rounded-full bg-[#efa3a0] text-white text-sm font-semibold">{s}</span>
                ))}
              </div>
            </div>

            {/* Badges earned */}
            <div className="border-sketch bg-white p-5 rounded-xl fade-in-scroll">
              <h3 className="font-bold text-[#493129] mb-3">Badges earned</h3>
              <div className="flex flex-col gap-3">
                {volunteer.earnedBadges.map(b => (
                  <div key={b.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center shrink-0">
                      <Award size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#493129]">{b.label}</p>
                      <p className="text-xs text-gray-400">earned · {b.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Available dates */}
            <div className="border-sketch bg-white p-5 rounded-xl fade-in-scroll">
              <h3 className="font-bold text-[#493129] mb-3">Available dates</h3>
              <div className="grid grid-cols-2 gap-2">
                {volunteer.availability.map((d, i) => (
                  <div key={i} className="border-2 border-[#493129] rounded-xl p-2 text-center">
                    <p className="font-bold text-[#efa3a0] text-lg leading-tight whitespace-pre-line">{d.split('\n')[0]}</p>
                    <p className="text-xs text-gray-500">{d.split('\n')[1]}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Keep going */}
            <div className="border-sketch bg-[#493129] p-5 rounded-xl text-white fade-in-scroll">
              <p className="font-['Caveat'] text-[#efa3a0] text-base mb-1">keep going ✳</p>
              <p className="font-bold text-5xl">{volunteer.nextBadge.hoursLeft}h</p>
              <p className="text-sm text-gray-300 mt-1">until your next badge: <span className="font-semibold text-white">{volunteer.nextBadge.label}</span></p>
              <div className="w-full bg-gray-600 rounded-full h-2 mt-4">
                <div
                  className="bg-[#efa3a0] h-2 rounded-full transition-all"
                  style={{ width: `${volunteer.nextBadge.progress}%` }}
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
