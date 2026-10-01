'use client'

import { useState, useTransition } from 'react'
import { updateStatus, updateNotes, toggleKanban } from './actions'
import { generateEmail } from '@/app/actions/generate-email'
import { Wand2, Copy, Check } from 'lucide-react'

const STATUSES = [
  'DA_CONTATTARE',
  'CONTATTATO',
  'COLLOQUIO',
  'RIFIUTATO',
  'ASSUNTO',
  'SCARTATO_DA_ME',
]

const STATUS_LABELS = {
  DA_CONTATTARE: 'Da contattare',
  CONTATTATO: 'Contattato',
  COLLOQUIO: 'Colloquio',
  RIFIUTATO: 'Rifiutato',
  ASSUNTO: 'Assunto',
  SCARTATO_DA_ME: 'Scartato',
}

export default function CompanyActions({ companyId, companyData, initialStatus, initialNotes, initialInKanban }) {
  const [status, setStatus] = useState(initialStatus)
  const [notes, setNotes] = useState(initialNotes)
  const [inKanban, setInKanban] = useState(initialInKanban)
  const [isPending, startTransition] = useTransition()
  const [savedStatus, setSavedStatus] = useState(false)
  const [savedNotes, setSavedNotes] = useState(false)

  const [emailDraft, setEmailDraft] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleStatusChange(e) {
    const newStatus = e.target.value
    setStatus(newStatus)
    startTransition(async () => {
      await updateStatus(companyId, newStatus)
      setSavedStatus(true)
      setTimeout(() => setSavedStatus(false), 2000)
    })
  }

  function handleNotesSave() {
    startTransition(async () => {
      await updateNotes(companyId, notes)
      setSavedNotes(true)
      setTimeout(() => setSavedNotes(false), 2000)
    })
  }

  function handleToggleKanban() {
    const newValue = !inKanban
    setInKanban(newValue)
    startTransition(async () => {
      await toggleKanban(companyId, newValue)
    })
  }

  async function handleGenerateEmail() {
    setEmailLoading(true)
    setEmailDraft('')
    const result = await generateEmail(companyData)
    if (result.email) {
      setEmailDraft(result.email)
    } else {
      alert(result.error)
    }
    setEmailLoading(false)
  }

  function handleCopy() {
    navigator.clipboard.writeText(emailDraft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      {/* Kanban */}
      <section className="mb-8 xl:mb-10">
        <h2 className="text-xs font-bold tracking-widest text-violet-600 uppercase mb-4">
          Kanban
        </h2>
        <div className="glass-light rounded-2xl p-5 xl:p-6">
          <button
            type="button"
            onClick={handleToggleKanban}
            disabled={isPending}
            className={`w-full font-bold px-5 py-3 rounded-xl text-sm tracking-wide transition-all disabled:opacity-50 ${
              inKanban
                ? 'bg-violet-100 text-violet-700 hover:bg-violet-200 border border-violet-400'
                : 'bg-violet-500 text-white hover-glow'
            }`}
          >
            {inKanban ? 'In Kanban — Rimuovi' : 'Aggiungi a Kanban'}
          </button>
          <p className="text-xs text-text-secondary mt-2">
            {inKanban
              ? 'Questa azienda appare nella Quest Board.'
              : 'Aggiungila per gestire la candidatura.'}
          </p>
        </div>
      </section>

      {/* Stato */}
      <section className="mb-8 xl:mb-10">
        <h2 className="text-xs font-bold tracking-widest text-violet-600 uppercase mb-4">
          Stato candidatura
        </h2>
        <div className="glass-light rounded-2xl p-5 xl:p-6">
          <select
            value={status}
            onChange={handleStatusChange}
            disabled={isPending}
            className="w-full bg-white border border-violet-500/15 rounded-xl px-4 py-3 text-sm text-text-primary focus:border-violet-400 focus:outline-none transition-colors disabled:opacity-50"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          {savedStatus && (
            <p className="text-xs text-violet-600 mt-2">Stato aggiornato</p>
          )}
        </div>
      </section>

      {/* Note */}
      <section className="mb-8 xl:mb-10">
        <h2 className="text-xs font-bold tracking-widest text-violet-600 uppercase mb-4">
          Note personali
        </h2>
        <div className="glass-light rounded-2xl p-5 xl:p-6">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            placeholder="Es. contattata il 25/09, in attesa di risposta..."
            className="w-full bg-white border border-violet-500/15 rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:border-violet-400 focus:outline-none transition-colors resize-none"
          />
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 mt-3">
            <button
              type="button"
              onClick={handleNotesSave}
              disabled={isPending || notes === initialNotes}
              className="bg-violet-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs tracking-wide hover-glow disabled:opacity-50 transition-all"
            >
              {isPending ? 'Salvataggio...' : 'Salva note'}
            </button>
            {savedNotes && (
              <p className="text-xs text-violet-600">Note salvate</p>
            )}
          </div>
        </div>
      </section>

      {/* Bozza Email AI */}
      <section>
        <h2 className="text-xs font-bold tracking-widest text-violet-600 uppercase mb-4">
          Bozza Email con AI
        </h2>
        <div className="glass-light rounded-2xl p-5 xl:p-6">
          {!emailDraft ? (
            <button
              type="button"
              onClick={handleGenerateEmail}
              disabled={emailLoading}
              className="w-full bg-violet-500 text-white font-bold px-5 py-3 rounded-xl text-sm tracking-wide hover-glow disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              {emailLoading ? 'Generazione in corso...' : 'Genera bozza email'}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={emailDraft}
                  onChange={(e) => setEmailDraft(e.target.value)}
                  rows={14}
                  className="w-full bg-white border border-violet-500/15 rounded-xl px-4 py-3 text-sm text-text-primary focus:border-violet-400 focus:outline-none transition-colors resize-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="absolute top-2 right-2 p-2 rounded-lg bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors"
                  title="Copia negli appunti"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setEmailDraft('')}
                className="text-xs text-text-secondary hover:text-violet-600 transition-colors"
              >
                Genera di nuovo
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}