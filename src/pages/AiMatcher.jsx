import { useState } from 'react'
import { Search, MapPin, Target, Sparkles, Building2, User } from 'lucide-react'

const AREA_COORDS = {
  "MP Nagar": { lat: 23.2324, lon: 77.4300 },
  "Arera Colony": { lat: 23.2146, lon: 77.4321 },
  "Indrapuri": { lat: 23.2505, lon: 77.4667 },
  "Kolar Road": { lat: 23.1800, lon: 77.4100 },
  "Saket Nagar": { lat: 23.2100, lon: 77.4500 }
}

export default function AiMatcher() {
  const [bio, setBio] = useState('')
  const [area, setArea] = useState('MP Nagar')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleMatch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const coords = AREA_COORDS[area]
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteer_bio: bio,
          v_lat: coords.lat,
          v_lon: coords.lon
        })
      })

      if (!res.ok) throw new Error('Failed to get matches')
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#ffeedb] px-4 py-12">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Left Side: Input Form */}
        <div className="flex-1 border-sketch bg-white p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#efa3a0] flex items-center justify-center text-white">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#493129]">AI Project Matcher</h1>
              <p className="font-['Caveat'] text-lg text-gray-500 italic">find your perfect cause</p>
            </div>
          </div>

          <form onSubmit={handleMatch} className="space-y-6">
            <div>
              <label className="block font-semibold text-[#493129] mb-2 flex items-center gap-2">
                <User size={16} className="text-[#8b597b]" />
                Your Skills & Interests
              </label>
              <textarea
                required
                rows={4}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="e.g. I am a developer interested in teaching children and helping with technical tasks..."
                className="w-full border-2 border-gray-200 rounded-xl p-4 outline-none focus:border-[#493129] transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#493129] mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-[#8b597b]" />
                Current Area in Bhopal
              </label>
              <select
                value={area}
                onChange={e => setArea(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl p-4 outline-none focus:border-[#493129] transition-colors bg-white"
              >
                {Object.keys(AREA_COORDS).map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-sketch bg-[#493129] text-white py-4 font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-pulse">Finding your match...</span>
              ) : (
                <>
                  <Target size={20} /> Find My Match
                </>
              )}
            </button>
            {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
          </form>
        </div>

        {/* Right Side: Results */}
        <div className="flex-1">
          {result ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
              <div className="border-sketch bg-[#ffdec7] p-6 rounded-2xl border-2 border-[#efa3a0]">
                <h2 className="font-bold text-xl text-[#493129] mb-3">Top Recommendation</h2>
                <p className="text-[#493129] font-medium leading-relaxed">
                  {result.explanation}
                </p>
              </div>

              {result.matched_projects?.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg text-[#493129] mb-4 flex items-center gap-2">
                    <Building2 size={20} className="text-[#8b597b]" />
                    Other Nearby Opportunities
                  </h3>
                  <div className="space-y-4">
                    {result.matched_projects.slice(1).map((proj, i) => (
                      <div key={i} className="border-sketch bg-white p-5 rounded-xl flex gap-4 card-lift">
                        <div className="flex-1">
                          <p className="text-[11px] font-semibold text-[#8b597b] tracking-widest mb-1">{proj.ngo_name}</p>
                          <h4 className="font-bold text-[#493129]">{proj.title}</h4>
                          <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-gray-500">
                            <MapPin size={12} className="text-[#efa3a0]" />
                            {proj.distance} km away
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <Search size={48} className="mb-4 text-gray-300" />
              <p className="font-semibold text-lg">No matches yet</p>
              <p className="text-sm max-w-[250px] mt-2">
                Fill out your skills and location, then hit "Find My Match" to discover projects near you.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
