import { useState } from 'react'
import { Search, MapPin, Target, Sparkles, User, Briefcase } from 'lucide-react'

const AREA_COORDS = {
  "MP Nagar": { lat: 23.2324, lon: 77.4300 },
  "Arera Colony": { lat: 23.2146, lon: 77.4321 },
  "Indrapuri": { lat: 23.2505, lon: 77.4667 },
  "Kolar Road": { lat: 23.1800, lon: 77.4100 },
  "Saket Nagar": { lat: 23.2100, lon: 77.4500 }
}

export default function NgoVolunteerFinder() {
  const [driveDesc, setDriveDesc] = useState('')
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
      const res = await fetch('/api/match-volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drive_description: driveDesc,
          ngo_lat: coords.lat,
          ngo_lon: coords.lon
        })
      })

      if (!res.ok) throw new Error('Failed to get matched volunteers')
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
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Left Side: Input Form */}
        <div className="flex-1 border-sketch bg-white p-8 rounded-2xl h-fit sticky top-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#8b597b] flex items-center justify-center text-white">
              <Target size={24} />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#493129]">Volunteer Finder AI</h1>
              <p className="font-['Caveat'] text-lg text-gray-500 italic">discover the perfect candidates for your drive</p>
            </div>
          </div>

          <form onSubmit={handleMatch} className="space-y-6">
            <div>
              <label className="block font-semibold text-[#493129] mb-2 flex items-center gap-2">
                <Briefcase size={16} className="text-[#8b597b]" />
                Drive Requirements & Skills Needed
              </label>
              <textarea
                required
                rows={4}
                value={driveDesc}
                onChange={e => setDriveDesc(e.target.value)}
                placeholder="e.g. We need volunteers experienced in teaching python to high-schoolers..."
                className="w-full border-2 border-gray-200 rounded-xl p-4 outline-none focus:border-[#493129] transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#493129] mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-[#8b597b]" />
                Location of Drive (Bhopal)
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
                <span className="animate-pulse">Analyzing profiles...</span>
              ) : (
                <>
                  <Sparkles size={20} /> Find Volunteers
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

              {result.matched_volunteers?.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg text-[#493129] mb-4 flex items-center gap-2">
                    <User size={20} className="text-[#8b597b]" />
                    Other Nearby Candidates
                  </h3>
                  <div className="space-y-4">
                    {result.matched_volunteers.slice(1).map((vol, i) => (
                      <div key={i} className="border-sketch bg-white p-5 rounded-xl flex gap-4 card-lift">
                        <div className="w-10 h-10 rounded-full bg-[#efa3a0] flex items-center justify-center text-white font-bold shrink-0">
                          {vol.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-[#493129]">{vol.name}</h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{vol.bio}</p>
                          <div className="flex items-center gap-2 mt-3 text-xs font-semibold text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded-md text-[#493129]">{vol.area}</span>
                            <span className="flex items-center gap-1 text-[#efa3a0]">
                              <MapPin size={12} />
                              {vol.distance} km away
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center">
                          <button className="btn-sketch text-[#8b597b] border-[#8b597b] bg-transparent hover:bg-[#8b597b] hover:text-white px-3 py-1.5 text-xs font-bold transition-colors">
                            Invite
                          </button>
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
              <p className="font-semibold text-lg">Awaiting Drive Details</p>
              <p className="text-sm max-w-[250px] mt-2">
                Describe the skills and requirements for your upcoming drive to find perfectly matched volunteers in your area.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
