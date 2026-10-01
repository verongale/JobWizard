'use client'

import { useState, useEffect } from 'react'
import { MapPin, Wand2 } from 'lucide-react'
import { importCompanies } from '@/app/actions/import'
import { scanCompanies, countToScan } from '@/app/actions/scan'

export default function ImportPage() {
  const [importResult, setImportResult] = useState(null)
  const [importLoading, setImportLoading] = useState(false)

  const [scanResult, setScanResult] = useState(null)
  const [scanLoading, setScanLoading] = useState(false)

  const [counts, setCounts] = useState({ total: 0, done: 0, remaining: 0 })

  useEffect(() => {
    countToScan().then(setCounts)
  }, [])

  async function handleImport(formData) {
    setImportLoading(true)
    setImportResult(null)
    try {
      const res = await importCompanies(formData)
      setImportResult(res)
      const c = await countToScan()
      setCounts(c)
    } catch (error) {
      setImportResult({ error: error.message })
    } finally {
      setImportLoading(false)
    }
  }

  async function handleScan() {
    setScanLoading(true)
    setScanResult(null)
    try {
      const res = await scanCompanies()
      setScanResult(res)
      const c = await countToScan()
      setCounts(c)
    } catch (error) {
      setScanResult({ error: error.message })
    } finally {
      setScanLoading(false)
    }
  }

  return (
    <main className="min-h-screen pt-12 pb-16 text-text-primary">
      <div className="max-w-7xl mx-auto px-8">

        <header className="mb-12">
          <h1 className="text-5xl md:text-6xl font-serif font-semibold tracking-tight text-text-primary">
            Summon Companies
          </h1>
        </header>

        {/* Sezione 1: Trova aziende */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-violet-500/15">
            <MapPin className="w-5 h-5 text-violet-500" />
            <h2 className="text-xs font-bold tracking-widest text-violet-600 uppercase">
              Trova nuove aziende
            </h2>
          </div>

          <form action={handleImport}>
            <div className="glass-light rounded-2xl p-6 space-y-5 mb-5">
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-text-muted uppercase mb-2">
                  Zona
                </label>
                <input
                  type="text"
                  name="city"
                  defaultValue="Cuneo"
                  className="w-full bg-white border border-violet-500/15 rounded-xl px-4 py-3 text-sm text-text-primary focus:border-violet-400 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest text-text-muted uppercase mb-2">
                  Raggio (km)
                </label>
                <input
                  type="number"
                  name="radius"
                  defaultValue={50}
                  max={50}
                  className="w-full bg-white border border-violet-500/15 rounded-xl px-4 py-3 text-sm text-text-primary focus:border-violet-400 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest text-text-muted uppercase mb-2">
                  Categorie
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="categories"
                      value="software house"
                      defaultChecked
                      className="w-4 h-4 accent-violet-500"
                    />
                    <span className="text-sm text-text-primary">Software house / IT</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="categories"
                      value="agenzie di comunicazione"
                      defaultChecked
                      className="w-4 h-4 accent-violet-500"
                    />
                    <span className="text-sm text-text-primary">Agenzie di comunicazione</span>
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={importLoading}
              className="bg-violet-500 text-white font-bold px-6 py-3 rounded-xl text-sm tracking-wide hover-glow disabled:opacity-50 transition-all"
            >
              {importLoading ? 'Ricerca in corso...' : 'Cerca'}
            </button>
          </form>

          {importResult && (
            <div className="mt-6 glass-light rounded-2xl p-5">
              {importResult.error ? (
                <p className="text-rose-500 text-sm">{importResult.error}</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-text-primary">
                    <strong>{importResult.imported}</strong> aziende importate
                  </p>
                  <p className="text-xs text-text-secondary">
                    {importResult.skipped} già presenti · {importResult.totalUnique} totali trovate
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Sezione 2: Scraping */}
        <section>
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-violet-500/15">
            <Wand2 className="w-5 h-5 text-violet-500" />
            <h2 className="text-xs font-bold tracking-widest text-violet-600 uppercase">
              Scansiona siti web
            </h2>
          </div>

          <div className="glass-light rounded-2xl p-6 mb-5">
            <div className="space-y-1 text-sm">
              <p className="text-text-secondary">
                Aziende totali con sito: <span className="text-text-primary font-mono">{counts.total}</span>
              </p>
              <p className="text-text-secondary">
                Già scansionate: <span className="text-text-primary font-mono">{counts.done}</span>
              </p>
              <p className="text-text-primary font-bold">
                Da scansionare: <span className="font-mono">{counts.remaining}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleScan}
            disabled={scanLoading || counts.remaining === 0}
            className="bg-violet-500 text-white font-bold px-6 py-3 rounded-xl text-sm tracking-wide hover-glow disabled:opacity-50 transition-all"
          >
            {scanLoading
              ? 'Scansione in corso...'
              : counts.remaining === 0
                ? 'Tutte scansionate'
                : `Avvia Scraping (${Math.min(20, counts.remaining)} aziende)`}
          </button>

          {scanResult && (
            <div className="mt-6 glass-light rounded-2xl p-5">
              {scanResult.error ? (
                <p className="text-rose-500 text-sm">{scanResult.error}</p>
              ) : (
                <div className="space-y-2 text-sm">
                  <p className="text-text-primary">
                    <strong>{scanResult.scanned}</strong> siti scansionati
                  </p>
                  {scanResult.errors > 0 && (
                    <p className="text-text-secondary">
                      {scanResult.errors} errori di rete
                    </p>
                  )}
                  {scanResult.techFound !== undefined && (
                    <p className="text-violet-600">
                      <strong>{scanResult.techFound}</strong> tech trovate in questo batch
                    </p>
                  )}
                  {scanResult.remaining !== undefined && (
                    <p className="text-text-secondary pt-2 border-t border-violet-500/15">
                      Restano da scansionare: <span className="font-mono text-text-primary">{scanResult.remaining}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}