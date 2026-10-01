'use client'

import Link from 'next/link'
import { ExternalLink, FileText } from 'lucide-react'

const STATUS_LABELS = {
  DA_CONTATTARE: 'Da contattare',
  CONTATTATO: 'Contattato',
  COLLOQUIO: 'Colloquio',
  RIFIUTATO: 'Rifiutato',
  ASSUNTO: 'Assunto',
  SCARTATO_DA_ME: 'Scartato',
}

const STATUS_COLORS = {
  DA_CONTATTARE: { bg: '#ede9fe', text: '#6d28d9' },
  CONTATTATO: { bg: '#dbeafe', text: '#1d4ed8' },
  COLLOQUIO: { bg: '#cffafe', text: '#0e7490' },
  RIFIUTATO: { bg: '#f3f4f6', text: '#6b7280' },
  ASSUNTO: { bg: '#e9d5ff', text: '#7e22ce' },
  SCARTATO_DA_ME: { bg: '#f3f4f6', text: '#6b7280' },
}

const GRID = 'grid grid-cols-[2.5fr_1fr_0.6fr_1.3fr_1.5fr_100px] gap-4 items-center'

function scoreColor(score) {
  if (score >= 100) return 'text-violet-600'
  if (score >= 50) return 'text-cyan-600'
  if (score >= 30) return 'text-blue-600'
  if (score > 0) return 'text-violet-400'
  return 'text-text-muted'
}

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || STATUS_COLORS.DA_CONTATTARE
  return (
    <span
      className="inline-block text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {STATUS_LABELS[status] || status}
    </span>
  )
}

export default function CompanyTable({ companies }) {
  if (companies.length === 0) {
    return (
      <div className="glass-light rounded-2xl p-12 text-center">
        <p className="font-serif text-2xl mb-2 text-text-primary">
          Nessuna azienda trovata
        </p>
        <p className="text-sm text-text-secondary">Prova a cambiare i filtri.</p>
      </div>
    )
  }

  return (
    <>
      {/* ========== MOBILE + TABLET: card list ========== */}
      <div className="xl:hidden space-y-3">
        {companies.map((c) => {
          const site = c.website
            ? c.website.replace(/^https?:\/\//, '').replace(/\/$/, '')
            : null

          return (
            <div key={c.id} className="glass-light rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <Link
                  href={`/companies/${c.id}`}
                  className="font-semibold text-text-primary hover:text-violet-700 transition-colors flex-1 min-w-0"
                >
                  {c.name}
                </Link>
                <span className={`text-lg font-mono font-bold shrink-0 ${scoreColor(c.score)}`}>
                  {c.score}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-3">
                {c.city && (
                  <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider">
                    {c.city}
                  </span>
                )}
                <StatusBadge status={c.status} />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-violet-500/10">
                <span className="text-xs text-violet-500 truncate flex-1">
                  {site || <span className="text-text-muted">—</span>}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  {c.website && (
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-violet-500 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                      title="Apri sito"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <Link
                    href={`/companies/${c.id}`}
                    className="p-2 rounded-lg text-violet-500 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                    title="Apri dettaglio"
                  >
                    <FileText className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ========== DESKTOP: tabella ========== */}
      <div className="hidden xl:block glass-light rounded-2xl overflow-hidden">
        <div
          className={`${GRID} px-6 py-4 border-b border-violet-500/15 text-[10px] font-bold tracking-widest text-violet-600 uppercase`}
        >
          <div>Azienda</div>
          <div>Città</div>
          <div className="text-right">Score</div>
          <div>Stato</div>
          <div>Sito</div>
          <div className="text-right">Azioni</div>
        </div>

        <div>
          {companies.map((c) => {
            const site = c.website
              ? c.website.replace(/^https?:\/\//, '').replace(/\/$/, '')
              : null

            return (
              <Link
                key={c.id}
                href={`/companies/${c.id}`}
                className={`${GRID} px-6 py-4 border-b border-violet-500/5 last:border-b-0 hover:bg-violet-50/60 transition-colors group`}
              >
                <div className="font-semibold text-text-primary group-hover:text-violet-700 transition-colors truncate">
                  {c.name}
                </div>

                <div className="text-xs font-mono text-text-secondary uppercase tracking-wider truncate">
                  {c.city || '—'}
                </div>

                <div className={`text-lg font-mono font-bold text-right ${scoreColor(c.score)}`}>
                  {c.score}
                </div>

                <div>
                  <StatusBadge status={c.status} />
                </div>

                <div className="text-xs text-violet-500 group-hover:text-violet-700 truncate">
                  {site || <span className="text-text-muted">—</span>}
                </div>

                <div className="flex items-center justify-end gap-1">
                  {c.website && (
                    <span
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        window.open(c.website, '_blank', 'noopener,noreferrer')
                      }}
                      className="p-2 rounded-lg text-violet-500 hover:text-violet-700 hover:bg-violet-100 transition-colors cursor-pointer"
                      title="Apri sito"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  )}
                  <span
                    className="p-2 rounded-lg text-violet-500 group-hover:text-violet-700 group-hover:bg-violet-100 transition-colors"
                    title="Apri dettaglio"
                  >
                    <FileText className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}