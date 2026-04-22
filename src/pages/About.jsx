import { Heart, Users, Shield, Target, Leaf, BookOpen } from 'lucide-react'

export default function About() {
  return (
    <div className="min-h-screen bg-[#ffeedb] py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="inline-block text-xs font-semibold tracking-widest text-[#8b597b] bg-[#ffdec7] px-4 py-1 rounded-full mb-4 border border-[#efa3a0]">
            OUR MISSION
          </p>
          <h1 className="font-bold text-4xl md:text-5xl text-[#493129] leading-tight mb-6">
            Building bridges between <span className="sketch-underline">passion</span> and <span className="sketch-underline">purpose</span>.
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            UNITYDRIVE was founded on a simple belief: everyone wants to help, they just need to find the right avenue. We provide a platform that seamlessly connects dedicated volunteers with NGOs making a real difference on the ground.
          </p>
        </div>

        {/* Story Section */}
        <div className="border-sketch bg-white p-8 md:p-12 rounded-2xl mb-16 relative">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <Heart size={100} className="text-[#8b597b]" />
           </div>
           <h2 className="font-bold text-2xl text-[#493129] mb-4 relative z-10">Our Story</h2>
           <div className="space-y-4 text-gray-600 relative z-10">
             <p>
                What started as a small initiative to organize local community cleanups quickly grew into a nation-wide platform. We realized that while many people were eager to volunteer, administrative overhead and lack of visibility were holding both individuals and organizations back.
             </p>
             <p>
                Today, UNITYDRIVE serves as the central nervous system for localized volunteer efforts. By providing tools for NGOs to manage their events and for volunteers to track their impact, we're making social change more accessible and organized than ever before.
             </p>
           </div>
        </div>

        {/* Values Grid */}
        <div className="mb-16">
           <h2 className="font-bold text-2xl text-[#493129] text-center mb-8">Our Core Values</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                  { icon: <Users size={24} />, title: "Community First", color: "#8b597b", desc: "Every feature we build is designed to strengthen localized, community-driven action." },
                  { icon: <Shield size={24} />, title: "Trust & Transparency", color: "#2e6b4f", desc: "We ensure all participating NGOs are vetted, providing a safe environment for all volunteers." },
                  { icon: <Target size={24} />, title: "Measurable Impact", color: "#493129", desc: "We believe in tracking progress to show volunteers the real-world value of their time." },
                  { icon: <Leaf size={24} />, title: "Sustainable Action", color: "#efa3a0", desc: "Long-term relationships between volunteers and causes create lasting change." },
              ].map((val, idx) => (
                  <div key={idx} className="border-sketch bg-white p-6 rounded-xl flex gap-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${val.color}20`, color: val.color }}>
                          {val.icon}
                      </div>
                      <div>
                          <h3 className="font-bold text-lg text-[#493129] mb-1">{val.title}</h3>
                          <p className="text-sm text-gray-500 leading-relaxed">{val.desc}</p>
                      </div>
                  </div>
              ))}
           </div>
        </div>

        {/* Team / Closing */}
        <div className="text-center">
            <h2 className="font-bold text-2xl text-[#493129] mb-4">Join the Movement</h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">Whether you have an hour a week or represent an organization looking for hands, there's a place for you here.</p>
             <button className="btn-sketch px-8 py-3 font-bold text-sm bg-[#efa3a0] text-white">
                Get Started Today
             </button>
        </div>

      </div>
    </div>
  )
}
