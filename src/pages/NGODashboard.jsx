import { useState, useRef, useEffect } from 'react'
import {
  Calendar, Eye, EyeOff, Plus, Upload, MapPin,
  Users, Clock, TrendingUp, Sparkles, ChevronRight,
  ToggleLeft, ToggleRight, FileUp
} from 'lucide-react'

// ── Mock data ────────────────────────────────────────────────────────────────
const matchedVolunteers = [
  { initials: 'AP', name: 'Aanya P.', skill: 'Teaching', score: 92, color: '#efa3a0' },
  { initials: 'RM', name: 'Rohan M.', skill: 'Logistics', score: 87, color: '#8b597b' },
  { initials: 'LH', name: 'Lin H.', skill: 'Medical', score: 81, color: '#493129' },
]

// ── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`w-12 h-6 rounded-full relative transition-colors duration-300 border-2 border-[#493129] ${on ? 'bg-[#2e6b4f]' : 'bg-gray-300'}`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${on ? 'translate-x-6' : 'translate-x-0.5'}`}
      />
    </button>
  )
}

// ── Drive card ───────────────────────────────────────────────────────────────
function DriveCard({ drive, onToggle }) {
  return (
    <div className={`border-2 rounded-xl p-4 mb-3 ${drive.visibility ? 'border-[#493129]' : 'border-gray-300 opacity-80'}`}
      style={{ boxShadow: drive.visibility ? '3px 3px 0px #493129' : 'none' }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
            style={{ background: drive.visibility ? '#2e6b4f' : '#c0392b' }}
          >
            {drive.visibility ? 'Public' : 'Private'}
          </span>
          <span className="text-xs text-gray-400">{drive.date}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          <span className="text-[10px] font-bold tracking-widest text-gray-400">{drive.visibility ? 'PUBLIC' : 'PRIVATE'}</span>
          <Toggle on={drive.visibility} onToggle={onToggle} />
        </div>
      </div>
      <h3 className="font-bold text-[#493129] text-base">{drive.title}</h3>
      <p className="text-sm text-gray-500 mt-1 mb-3">{drive.desc}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {drive.tags.map(t => (
          <span key={t} className="px-2.5 py-0.5 rounded-full border-2 border-[#493129] text-xs font-semibold text-[#493129]">{t}</span>
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
        <span className="flex items-center gap-1"><MapPin size={11} /> {drive.location}</span>
        <span className="flex items-center gap-1"><Users size={11} /> {drive.slots}/{drive.total}</span>
        <span className="flex items-center gap-1"><Clock size={11} /> {drive.hours}h</span>
      </div>
      {/* Fill bar */}
      <div className="w-full h-1.5 rounded-full bg-gray-200">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${drive.fill}%`, background: drive.fill > 60 ? '#2e6b4f' : '#efa3a0' }}
        />
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function NGODashboard() {
  const [drives, setDrives] = useState([])
  const [filter, setFilter] = useState('All')
  const [dragging, setDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrResult, setOcrResult] = useState(null)
  const fileRef = useRef()

  const fetchDrives = async () => {
    try {
      const res = await fetch('/api/ngo/drives', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setDrives(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchDrives()
  }, [])

  const toggle = async (id) => {
    try {
      const res = await fetch(`/api/drives/${id}/toggle`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (res.ok) {
        fetchDrives() // Refresh the list
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleNewDrive = async () => {
    const title = prompt('Enter drive title:')
    if (!title) return
    const location = prompt('Enter location (e.g. Indiranagar):') || 'Bhopal'
    const date = prompt('Enter date (e.g. Apr 25):') || 'Soon'
    
    try {
      const res = await fetch('/api/drives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title, location, date, desc: 'A newly created drive', tags: ['Community'], total: 10, hours: 4 })
      })
      if (res.ok) fetchDrives()
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = drives.filter(d =>
    filter === 'All' ? true : filter === 'Public' ? d.visibility : !d.visibility
  )

  const stats = {
    active: drives.length,
    pub: drives.filter(d => d.visibility).length,
    priv: drives.filter(d => !d.visibility).length,
    fill: Math.round(drives.reduce((a, d) => a + d.fill, 0) / drives.length) + '%',
    hours: 273,
  }

  const handleDrop = async (e) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer?.files[0] || e.target?.files[0]
    if (!f) return

    setUploadedFile(f.name)
    setIsProcessing(true)
    setOcrResult(null)

    const formData = new FormData()
    formData.append('file', f)

    try {
      const res = await fetch('/api/ocr-volunteer', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok) {
        setOcrResult('Success! AI registered the volunteer.')
      } else {
        setOcrResult('AI Processing Failed: ' + data.error)
      }
    } catch (err) {
      setOcrResult('Upload error: ' + err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#ffeedb] px-4 py-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="font-['Caveat'] text-[#efa3a0] text-lg">good morning 🌸</p>
          <h1 className="font-bold text-4xl text-[#493129] leading-tight">
            Your field of work, <span className="sketch-underline">sketched live.</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2 max-w-lg">
            Manage drives, keep some private, broadcast the rest. Volunteers nearby get matched automatically.
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'ACTIVE DRIVES', value: stats.active, icon: <Calendar size={16} className="text-[#efa3a0]" /> },
            { label: 'PUBLIC', value: stats.pub, icon: <Eye size={16} className="text-[#efa3a0]" /> },
            { label: 'PRIVATE', value: stats.priv, icon: <EyeOff size={16} className="text-[#efa3a0]" /> },
            { label: 'FILL RATE', value: stats.fill, icon: <TrendingUp size={16} className="text-[#efa3a0]" /> },
          ].map(s => (
            <div key={s.label} className="border-sketch bg-white p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-widest text-gray-400">{s.label}</span>
                {s.icon}
              </div>
              <p className="font-bold text-3xl text-[#493129]">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Content grid */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left — Drives list */}
          <div className="flex-1">
            {/* Filter bar */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex border-2 border-[#493129] rounded-xl overflow-hidden">
                {['All', 'Public', 'Private'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 text-sm font-semibold transition-colors ${filter === f ? 'bg-[#493129] text-white' : 'bg-white text-[#493129] hover:bg-[#ffdec7]'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button onClick={handleNewDrive} className="btn-sketch px-4 py-1.5 text-sm font-bold bg-[#efa3a0] text-white flex items-center gap-1">
                <Plus size={15} /> New
              </button>
            </div>

            <h2 className="font-bold text-xl text-[#493129] mb-4">Drives</h2>

            {filtered.map(d => (
              <DriveCard key={d.id} drive={d} onToggle={() => toggle(d.id)} />
            ))}
          </div>

          {/* Right sidebar */}
          <div className="w-full lg:w-72 flex flex-col gap-4">

            {/* Data import with AI OCR */}
            <div className="border-sketch bg-white p-5 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <FileUp size={16} className="text-[#efa3a0]" />
                <h3 className="font-bold text-[#493129]">Data import (AI OCR)</h3>
              </div>
              <p className="text-xs text-gray-400 mb-4">Upload handwritten volunteer forms. AI will extract skills and auto-register them to the database.</p>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${dragging ? 'border-[#efa3a0] bg-[#fff3ee]' : 'border-gray-300'}`}
                onClick={() => fileRef.current.click()}
              >
                {isProcessing ? (
                  <div className="animate-pulse">
                    <Sparkles size={24} className="mx-auto text-[#efa3a0] mb-2" />
                    <p className="text-sm font-bold text-[#493129]">AI is reading form...</p>
                    <p className="text-xs text-gray-400 mt-1">Extracting skills & location</p>
                  </div>
                ) : (
                  <>
                    <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-400 font-['Caveat'] text-base">drop paper form here</p>
                    <p className="text-xs text-gray-300 mt-1">PNG, JPG · max 5MB</p>
                  </>
                )}
                
                {uploadedFile && !isProcessing && (
                  <p className="text-xs text-gray-600 font-semibold mt-2">{uploadedFile}</p>
                )}
                {ocrResult && (
                  <p className={`text-xs font-semibold mt-2 ${ocrResult.includes('Success') ? 'text-green-600' : 'text-red-500'}`}>
                    {ocrResult}
                  </p>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={handleDrop} />
              <button className="btn-sketch w-full mt-3 py-2 text-sm font-bold bg-[#493129] text-white disabled:opacity-50"
                onClick={() => fileRef.current.click()} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Upload Form Image'}
              </button>
            </div>

            {/* Match engine */}
            <div className="border-sketch bg-white p-5 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={16} className="text-[#efa3a0]" />
                <h3 className="font-bold text-[#493129]">Match engine</h3>
              </div>
              <p className="text-xs text-gray-400 mb-4">Uses proximity (10km), skill overlap, and availability to surface volunteers automatically.</p>
              <div className="flex flex-col gap-2">
                {matchedVolunteers.map(v => (
                  <div key={v.name} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#fff8f3]">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: v.color }}>
                      {v.initials}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#493129]">{v.name}</p>
                      <p className="text-xs text-gray-400">{v.skill}</p>
                    </div>
                    <span className="font-bold text-[#efa3a0] text-sm">{v.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* This month hours */}
            <div className="border-sketch bg-white p-5 rounded-xl">
              <p className="font-['Caveat'] text-[#efa3a0] text-base italic mb-1">this month</p>
              <p className="font-bold text-5xl text-[#493129]">{stats.hours}</p>
              <p className="text-sm text-gray-400 mt-1">donated by your community across {stats.active} drives.</p>
            </div>

            {/* Today & Upcoming Drives */}
            <div className="border-sketch bg-white p-5 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={16} className="text-[#efa3a0]" />
                <h3 className="font-bold text-[#493129]">Today & Upcoming</h3>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { title: 'River Yamuna Cleanup', ngo: 'GreenRoots', date: 'Today', time: '7:00 AM', status: 'today' },
                  { title: 'Free Eye Checkup Camp', ngo: 'Karuna Health', date: 'Today', time: '9:00 AM', status: 'today' },
                  { title: 'Meal Distribution', ngo: 'Annapurna', date: 'Apr 23', time: '12:00 PM', status: 'upcoming' },
                  { title: "Women's Workshop", ngo: 'Udaan Foundation', date: 'Apr 25', time: '3:00 PM', status: 'upcoming' },
                  { title: 'Mobile Library Tour', ngo: 'Aksharavana', date: 'Apr 28', time: '8:00 AM', status: 'upcoming' },
                ].map((ev, i) => (
                  <div key={i} className="flex items-start gap-3 pb-3 border-b border-dashed border-gray-100 last:border-0 last:pb-0">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${ev.status === 'today' ? 'bg-green-500' : 'bg-[#efa3a0]'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#493129] truncate">{ev.title}</p>
                      <p className="text-xs text-[#8b597b]">{ev.ngo}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{ev.date} · {ev.time}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${ev.status === 'today' ? 'bg-green-100 text-green-700' : 'bg-[#ffdec7] text-[#493129]'}`}>
                      {ev.status === 'today' ? 'LIVE' : 'SOON'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
