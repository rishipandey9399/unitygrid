import { useState, useRef } from 'react'
import { Upload, FileText, Send, Image as ImageIcon, BarChart3, Bot, Activity } from 'lucide-react'

export default function AiAnalyzer() {
  const [prompt, setPrompt] = useState('Extract volunteer data from this image and generate a dashboard chart.')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([])
  const [chartUrl, setChartUrl] = useState(null)
  const [error, setError] = useState(null)
  
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) {
      setFile(selected)
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result)
      reader.readAsDataURL(selected)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt) return

    setLoading(true)
    setError(null)
    setMessages([{ role: 'user', content: prompt }])
    setChartUrl(null)

    const formData = new FormData()
    formData.append('prompt', prompt)
    if (file) {
      formData.append('file', file)
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        // Try to get the real error from the response body
        let errMsg = 'Failed to analyze data'
        try {
          const errData = await res.json()
          errMsg = errData.error || errMsg
        } catch (_) {}
        throw new Error(errMsg)
      }
      const data = await res.json()
      
      setMessages(prev => [...prev, ...(data.messages || [])])
      if (data.chart_url) {
        // Add cache busting query param to ensure new chart loads
        setChartUrl(`${data.chart_url}?t=${Date.now()}`)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }

  }

  return (
    <div className="min-h-screen bg-[#ffeedb] px-4 py-8">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Input & Chat */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="border-sketch bg-white p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#8b597b] flex items-center justify-center text-white shadow-md">
                <Bot size={24} />
              </div>
              <div>
                <h1 className="font-bold text-2xl text-[#493129]">Data Analyst AI</h1>
                <p className="font-['Caveat'] text-lg text-gray-500 italic">convert paper-based surveys into digital insights</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* File Upload Zone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#8b597b] bg-[#ffdec7]/20 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-[#ffdec7]/40 transition-colors"
              >
                {preview ? (
                  <div className="relative w-full max-w-xs">
                    <img src={preview} alt="Upload preview" className="rounded-lg shadow-sm border border-gray-200" />
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={32} className="text-[#8b597b] mb-3" />
                    <p className="font-semibold text-[#493129]">Upload Paper Survey / Report</p>
                    <p className="text-xs text-gray-500 mt-1">Seamlessly integrate offline data for AI analysis (PNG, JPG)</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              {/* Prompt Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="What would you like me to do?"
                  className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#493129]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-sketch bg-[#493129] text-white px-6 py-3 font-bold disabled:opacity-50 flex items-center gap-2"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>

          {/* AI Logs / Reasoning */}
          <div className="border-sketch bg-white p-6 rounded-2xl flex-1 flex flex-col">
            <h3 className="font-bold text-[#493129] mb-4 flex items-center gap-2">
              <Activity size={18} className="text-[#8b597b]" />
              Agent Reasoning Logs
            </h3>
            <div className="flex-1 bg-[#fff8f3] rounded-xl p-4 border border-gray-100 overflow-y-auto min-h-[300px] max-h-[500px]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <FileText size={32} className="mb-2 opacity-50" />
                  <p className="text-sm font-medium">Logs will appear here when the agent runs.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`p-3 rounded-lg text-sm ${
                      msg.role === 'user' ? 'bg-[#ffdec7]/50 border border-[#ffdec7] text-[#493129]' :
                      msg.role === 'tool_call' ? 'bg-gray-100 border border-gray-200 text-gray-600 font-mono text-xs' :
                      msg.role === 'tool' ? 'bg-blue-50 border border-blue-100 text-blue-800 font-mono text-xs' :
                      'bg-[#efa3a0]/10 border border-[#efa3a0]/30 text-[#493129]'
                    }`}>
                      {msg.role === 'tool_call' && <p className="font-bold text-gray-500 mb-1">🛠 Tool: {msg.name}</p>}
                      {msg.role === 'tool' && <p className="font-bold text-blue-500 mb-1">✅ Tool Output ({msg.name}):</p>}
                      <div className="whitespace-pre-wrap">
                        {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content || msg.args)}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex items-center gap-2 text-[#8b597b] text-sm font-semibold p-3 animate-pulse">
                      <Bot size={16} /> Agent is thinking and executing tools...
                    </div>
                  )}
                </div>
              )}
            </div>
            {error && <p className="text-red-500 text-sm font-semibold mt-4">{error}</p>}
          </div>
        </div>

        {/* Right Side: Visualizations */}
        <div className="w-full lg:w-[450px]">
          <div className="border-sketch bg-white p-6 rounded-2xl h-full sticky top-24">
            <h3 className="font-bold text-[#493129] mb-4 flex items-center gap-2">
              <BarChart3 size={20} className="text-[#efa3a0]" />
              Generated Visualizations
            </h3>
            
            {chartUrl ? (
              <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm animate-in zoom-in duration-300">
                <img src={chartUrl} alt="Generated Chart" className="w-full h-auto" />
                <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                  <a href={chartUrl} download="sales_chart.png" className="text-xs font-bold text-[#8b597b] hover:underline">
                    Download Image
                  </a>
                </div>
              </div>
            ) : (
              <div className="h-[300px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400">
                <ImageIcon size={48} className="mb-3 text-gray-300" />
                <p className="font-semibold">No charts generated yet</p>
                <p className="text-xs max-w-[200px] text-center mt-2">
                  Ask the agent to generate a dashboard using Matplotlib.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
