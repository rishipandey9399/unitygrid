import { useState } from 'react'
import { MapPin, Users, Zap, Heart } from 'lucide-react'

const NGOS = [
  { name: 'Aksharavana Trust', category: 'Education', region: 'Bangalore', volunteers: 42, drives: 8 },
  { name: 'Karuna Health', category: 'Health', region: 'Chennai', volunteers: 78, drives: 12 },
  { name: 'ByteBridge', category: 'Technology', region: 'Hyderabad', volunteers: 35, drives: 6 },
  { name: 'Annapurna Collective', category: 'Food & Hunger', region: 'Pune', volunteers: 60, drives: 10 },
  { name: 'GreenRoots', category: 'Environment', region: 'Mumbai', volunteers: 55, drives: 9 },
  { name: 'Udaan Foundation', category: 'Women & Girls', region: 'Delhi', volunteers: 47, drives: 7 },
]

const FILTERS = ['All', 'Education', 'Health', 'Technology', 'Environment', 'Food & Hunger']

export default function Ngos() {
  const [active, setActive] = useState('All')
  const shown = NGOS.filter(n => active === 'All' || n.category === active)

  return (
    <main className="min-h-screen bg-[#ffeedb] pt-8 pb-16">
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="font-bold text-3xl text-[#493129]">NGOs</h2>
            <p className="text-gray-400 text-sm mt-1">Find the cause that speaks to you.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border-2 transition-all ${active === f ? 'border-[#493129] bg-[#493129] text-white' : 'border-[#493129] text-[#493129] hover:bg-[#ffdec7]'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {shown.map(n => (
            <div key={n.name} className="border-sketch bg-white p-5 rounded-xl card-lift">
              <div className="w-10 h-10 rounded-xl bg-[#ffdec7] flex items-center justify-center mb-3">
                <Heart size={18} className="text-[#8b597b]" />
              </div>
              <p className="text-[10px] font-bold tracking-widest text-[#8b597b]">{n.category.toUpperCase()}</p>
              <h3 className="font-bold text-[#493129] text-lg mt-1">{n.name}</h3>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-2"><MapPin size={11} /> {n.region}</p>
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Users size={11} /> {n.volunteers} volunteers</span>
                <span className="flex items-center gap-1"><Zap size={11} /> {n.drives} drives</span>
              </div>
              <button className="btn-sketch mt-4 w-full py-2 text-sm font-semibold text-[#493129]">
                View Profile
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
