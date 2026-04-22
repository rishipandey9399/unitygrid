import { useState } from 'react'
import {
  ShieldCheck, Users, Building2, CheckCircle, XCircle,
  Clock, Search, Filter, ChevronDown, Eye, Lock, Unlock,
  AlertTriangle, TrendingUp, UserPlus, BarChart3, MapPin
} from 'lucide-react'

// ── Mock data ────────────────────────────────────────────────────────────────
const initNGOs = [
  { id: 1, name: 'Aksharavana Trust', email: 'contact@aksharavana.org', type: 'NGO', status: 'pending', joined: '2026-04-18', drives: 0, region: 'Bangalore' },
  { id: 2, name: 'Karuna Health', email: 'admin@karunahealth.in', type: 'NGO', status: 'approved', joined: '2026-03-05', drives: 6, region: 'Chennai' },
  { id: 3, name: 'ByteBridge', email: 'hello@bytebridge.org', type: 'NGO', status: 'approved', joined: '2026-02-20', drives: 4, region: 'Hyderabad' },
  { id: 4, name: 'Annapurna Collective', email: 'team@annapurna.ngo', type: 'NGO', status: 'pending', joined: '2026-04-19', drives: 0, region: 'Pune' },
  { id: 5, name: 'GreenRoots Foundation', email: 'info@greenroots.in', type: 'NGO', status: 'rejected', joined: '2026-04-10', drives: 0, region: 'Mumbai' },
]

const initVolunteers = [
  { id: 1, name: 'Aanya Patel', email: 'aanya@mail.com', type: 'Volunteer', status: 'approved', joined: '2026-01-15', hours: 142, skills: ['Teaching', 'Translation'] },
  { id: 2, name: 'Rohan Mehta', email: 'rohan@mail.com', type: 'Volunteer', status: 'pending', joined: '2026-04-17', hours: 0, skills: ['Logistics'] },
  { id: 3, name: 'Lin Hassan', email: 'lin@mail.com', type: 'Volunteer', status: 'approved', joined: '2026-03-10', hours: 54, skills: ['Medical'] },
  { id: 4, name: 'Priya Sharma', email: 'priya@mail.com', type: 'Volunteer', status: 'pending', joined: '2026-04-20', hours: 0, skills: ['Cooking', 'Logistics'] },
]

const STATUS_COLOR = {
  approved: { bg: '#dcfce7', text: '#16a34a', label: 'Approved' },
  pending:  { bg: '#fef9c3', text: '#ca8a04', label: 'Pending' },
  rejected: { bg: '#fee2e2', text: '#dc2626', label: 'Rejected' },
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="border-sketch bg-white p-5 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold tracking-widest text-gray-400">{label}</span>
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <p className="font-bold text-3xl text-[#493129]">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

// ── Access table row ─────────────────────────────────────────────────────────
function AccessRow({ item, onApprove, onReject, onRevoke }) {
  const s = STATUS_COLOR[item.status]
  return (
    <tr className="border-b border-gray-100 hover:bg-[#fff8f3] transition-colors">
      <td className="py-3 px-4">
        <div>
          <p className="font-semibold text-sm text-[#493129]">{item.name}</p>
          <p className="text-xs text-gray-400">{item.email}</p>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.type === 'NGO' ? 'bg-[#ffdec7] text-[#493129]' : 'bg-[#efa3a0]/20 text-[#8b597b]'}`}>
          {item.type}
        </span>
      </td>
      <td className="py-3 px-4 text-xs text-gray-500">
        {item.region || item.skills?.join(', ')}
      </td>
      <td className="py-3 px-4 text-xs text-gray-400">{item.joined}</td>
      <td className="py-3 px-4">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.text }}>
          {s.label}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-2">
          {item.status === 'pending' && (
            <>
              <button
                onClick={onApprove}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200 transition-colors"
              >
                <CheckCircle size={12} /> Approve
              </button>
              <button
                onClick={onReject}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition-colors"
              >
                <XCircle size={12} /> Reject
              </button>
            </>
          )}
          {item.status === 'approved' && (
            <button
              onClick={onRevoke}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <Lock size={12} /> Revoke
            </button>
          )}
          {item.status === 'rejected' && (
            <button
              onClick={onApprove}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors"
            >
              <Unlock size={12} /> Re-approve
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [ngos, setNgos] = useState(initNGOs)
  const [volunteers, setVolunteers] = useState(initVolunteers)
  const [tab, setTab] = useState('ngos')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [toast, setToast] = useState(null)

  const showToast = (msg, color = '#2e6b4f') => {
    setToast({ msg, color })
    setTimeout(() => setToast(null), 2500)
  }

  const updateStatus = (setFn, id, newStatus) => {
    setFn(prev => prev.map(x => x.id === id ? { ...x, status: newStatus } : x))
    const labels = { approved: '✓ Access granted', rejected: '✗ Access rejected', pending: 'Reverted to pending' }
    const colors  = { approved: '#2e6b4f', rejected: '#dc2626', pending: '#ca8a04' }
    showToast(labels[newStatus], colors[newStatus])
  }

  const current = tab === 'ngos' ? ngos : volunteers
  const setFn = tab === 'ngos' ? setNgos : setVolunteers

  const filtered = current.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || item.status === statusFilter.toLowerCase()
    return matchSearch && matchStatus
  })

  const totalNGOs = ngos.length
  const approvedNGOs = ngos.filter(x => x.status === 'approved').length
  const pendingAll = [...ngos, ...volunteers].filter(x => x.status === 'pending').length
  const totalVols = volunteers.length

  return (
    <div className="min-h-screen bg-[#ffeedb] px-4 py-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={22} className="text-[#8b597b]" />
              <p className="font-['Caveat'] text-[#8b597b] text-lg">admin console</p>
            </div>
            <h1 className="font-bold text-4xl text-[#493129]">Access Management</h1>
            <p className="text-gray-500 text-sm mt-2">
              Grant or revoke access for NGOs and volunteers across the platform.
            </p>
          </div>
          {pendingAll > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-100 border-2 border-yellow-400">
              <AlertTriangle size={16} className="text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-700">{pendingAll} pending review</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Building2 size={16}/>} label="TOTAL NGOs" value={totalNGOs} sub={`${approvedNGOs} approved`} accent="#8b597b" />
          <StatCard icon={<Users size={16}/>} label="VOLUNTEERS" value={totalVols} sub={`${volunteers.filter(v=>v.status==='approved').length} approved`} accent="#efa3a0" />
          <StatCard icon={<Clock size={16}/>} label="PENDING" value={pendingAll} sub="awaiting review" accent="#ca8a04" />
          <StatCard icon={<TrendingUp size={16}/>} label="APPROVED RATE"
            value={Math.round(([...ngos,...volunteers].filter(x=>x.status==='approved').length/([...ngos,...volunteers].length))*100)+'%'}
            sub="of all applications" accent="#2e6b4f" />
        </div>

        {/* Table card */}
        <div className="border-sketch bg-white rounded-2xl overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b-2 border-[#493129]">
            {[['ngos', 'NGOs', Building2], ['volunteers', 'Volunteers', Users]].map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => { setTab(key); setStatusFilter('All'); setSearch('') }}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors ${tab === key ? 'bg-[#493129] text-white' : 'text-[#493129] hover:bg-[#ffdec7]'}`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 focus-within:border-[#493129] transition-colors">
              <Search size={15} className="text-gray-400 shrink-0" />
              <input
                className="flex-1 text-sm outline-none bg-transparent text-[#493129] placeholder-gray-300"
                placeholder={`Search ${tab}...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex border-2 border-[#493129] rounded-xl overflow-hidden">
              {['All', 'Pending', 'Approved', 'Rejected'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${statusFilter === s ? 'bg-[#493129] text-white' : 'text-[#493129] hover:bg-[#ffdec7]'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-gray-100 bg-[#fff8f3]">
                  {['Name / Email', 'Type', 'Region / Skills', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} className="py-3 px-4 text-[11px] font-bold tracking-widest text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-gray-400 text-sm">No results found</td></tr>
                ) : (
                  filtered.map(item => (
                    <AccessRow
                      key={item.id}
                      item={item}
                      onApprove={() => updateStatus(setFn, item.id, 'approved')}
                      onReject={() => updateStatus(setFn, item.id, 'rejected')}
                      onRevoke={() => updateStatus(setFn, item.id, 'rejected')}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 text-xs text-gray-400">
            Showing {filtered.length} of {current.length} {tab}
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className="fixed bottom-6 right-6 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-xl transition-all"
            style={{ background: toast.color, border: '2px solid rgba(255,255,255,0.3)' }}
          >
            {toast.msg}
          </div>
        )}

        {/* Today & Upcoming Events */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-[#8b597b]" />
            <h2 className="font-bold text-xl text-[#493129]">Today & Upcoming Drives</h2>
            <span className="ml-1 text-xs font-semibold text-[#8b597b] bg-[#ffdec7] px-2 py-0.5 rounded-full">Platform-wide</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'River Yamuna Cleanup Drive', ngo: 'GreenRoots', date: 'Today', time: '7:00 AM – 11:00 AM', location: 'Yamuna Ghat, Delhi', volunteers: 45, slots: 60, status: 'today', cat: 'Environment' },
              { title: 'Free Eye Checkup Camp', ngo: 'Karuna Health', date: 'Today', time: '9:00 AM – 4:00 PM', location: 'Community Hall, Chennai', volunteers: 22, slots: 30, status: 'today', cat: 'Health' },
              { title: 'Code with Teens Bootcamp', ngo: 'ByteBridge', date: 'Today', time: '10:00 AM – 1:00 PM', location: 'Tech Hub, Hyderabad', volunteers: 12, slots: 20, status: 'today', cat: 'Technology' },
              { title: 'Meal Distribution', ngo: 'Annapurna Collective', date: 'Apr 23', time: '12:00 PM – 3:00 PM', location: 'Station Area, Pune', volunteers: 0, slots: 40, status: 'upcoming', cat: 'Food & Hunger' },
              { title: "Women's Self-Defense Workshop", ngo: 'Udaan Foundation', date: 'Apr 25', time: '3:00 PM – 5:00 PM', location: 'Community Centre, Delhi', volunteers: 8, slots: 25, status: 'upcoming', cat: 'Women & Girls' },
              { title: 'Mobile Library Tour', ngo: 'Aksharavana Trust', date: 'Apr 28', time: '8:00 AM – 6:00 PM', location: 'Rural Bangalore', volunteers: 5, slots: 15, status: 'upcoming', cat: 'Education' },
            ].map((ev, i) => (
              <div key={i} className="border-sketch bg-white p-4 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full ${ev.status === 'today' ? 'bg-green-100 text-green-700' : 'bg-[#ffdec7] text-[#493129]'}`}>
                    {ev.status === 'today' ? '● LIVE TODAY' : 'UPCOMING'}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{ev.cat}</span>
                </div>
                <h3 className="font-bold text-sm text-[#493129] leading-snug mb-1">{ev.title}</h3>
                <p className="text-xs text-[#8b597b] font-semibold mb-2">{ev.ngo}</p>
                <div className="space-y-1 text-xs text-gray-500 mb-3">
                  <p className="flex items-center gap-1"><MapPin size={10} className="text-[#8b597b]" /> {ev.location}</p>
                  <p className="flex items-center gap-1"><Clock size={10} className="text-[#8b597b]" /> {ev.date} · {ev.time}</p>
                  <p className="flex items-center gap-1"><Users size={10} className="text-[#8b597b]" /> {ev.volunteers}/{ev.slots} volunteers</p>
                </div>
                <div className="w-full h-1.5 bg-[#ffdec7] rounded-full">
                  <div
                    className="h-1.5 rounded-full bg-[#efa3a0]"
                    style={{ width: `${Math.round((ev.volunteers / ev.slots) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
