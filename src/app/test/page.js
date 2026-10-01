'use client'

import { useState } from 'react'
import { testByText, testByRadius } from '@/app/actions/test-import'

export default function TestPage() {
  const [resultText, setResultText] = useState(null)
  const [resultRadius, setResultRadius] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleTest(action) {
    setLoading(true)
    const formData = new FormData()
    formData.append('city', 'Cuneo')
    formData.append('radius', '50')
    formData.append('categories', 'software house')
    formData.append('categories', 'e-commerce')
    formData.append('categories', 'agenzie di comunicazione')

    const result = await action(formData)
    if (action === testByText) setResultText(result)
    else setResultRadius(result)
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-brand-bg text-brand-text p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-black">Test Import</h1>

        <div className="flex gap-4">
          <button
            onClick={() => handleTest(testByText)}
            disabled={loading}
            className="bg-brand-text text-brand-bg font-bold px-6 py-3 rounded-xl disabled:opacity-50"
          >
            Test Metodo TEXT
          </button>
          <button
            onClick={() => handleTest(testByRadius)}
            disabled={loading}
            className="bg-brand-cyan text-brand-bg font-bold px-6 py-3 rounded-xl disabled:opacity-50"
          >
            Test Metodo RADIUS
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ResultPanel title="Metodo TEXT" result={resultText} />
          <ResultPanel title="Metodo RADIUS" result={resultRadius} />
        </div>
      </div>
    </main>
  )
}

function ResultPanel({ title, result }) {
  if (!result) return (
    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
      <h2 className="font-bold mb-2">{title}</h2>
      <p className="text-brand-muted text-sm">Nessun test eseguito.</p>
    </div>
  )

  if (result.error) return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
      <h2 className="font-bold mb-2">{title}</h2>
      <p className="text-red-400 text-sm">{result.error}</p>
    </div>
  )

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-4">
      <div>
        <h2 className="font-bold text-lg">{title}</h2>
        <p className="text-xs text-brand-muted font-mono">
          {result.totalUnique} uniche · {result.totalRaw} totali
        </p>
      </div>

      <div className="text-xs space-y-1">
        {Object.entries(result.perCategory).map(([cat, count]) => (
          <div key={cat} className="flex justify-between">
            <span className="text-brand-muted">{cat}</span>
            <span className="font-mono">{count}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 pt-4 space-y-2 max-h-96 overflow-y-auto">
        {result.places.map(p => (
          <div key={p.id} className="text-xs border-b border-white/5 pb-2">
            <div className="font-bold">{p.name}</div>
            <div className="text-brand-muted">{p.city || '—'} · {p.website || 'no sito'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}