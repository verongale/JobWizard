import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CompanyActions from './CompanyActions'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

function scoreColor(score) {
  if (score >= 100) return 'text-violet-600'
  if (score >= 50) return 'text-cyan-600'
  if (score >= 30) return 'text-blue-600'
  if (score > 0) return 'text-violet-400'
  return 'text-text-muted'
}

function scoreLabel(score) {
  if (score >= 100) return 'Top tech'
  if (score >= 50) return 'Tech'
  if (score >= 30) return 'Forse tech'
  if (score > 0) return 'Debole'
  return 'Non tech'
}

export default async function CompanyDetailPage({ params }) {
  const { id } = await params

  const company = await prisma.company.findUnique({
    where: { id },
  })

  if (!company) {
    notFound()
  }

  const keywords = company.scanResult?.keywords || []
  const error = company.scanResult?.error
  const needsReview = company.scanResult?.needsManualReview === true

  return (
    <main className="min-h-screen pt-20 xl:pt-12 pb-16 text-text-primary">
      <div className="max-w-7xl mx-auto px-6 xl:px-8">

        {/* Torna indietro */}
        <Link
          href="/companies"
          className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-text-secondary hover:text-violet-700 transition-colors mb-6 xl:mb-8"
        >
          <ArrowLeft className="w-3 h-3" />
          Torna alla Library
        </Link>

        {/* Header */}
        <header className="mb-8 xl:mb-10">
          <div className="flex justify-between items-start gap-4 xl:gap-6 mb-3">
            <h1 className="text-3xl xl:text-5xl font-serif font-semibold tracking-tight flex-1 min-w-0">
              {company.name}
            </h1>
            <div className="text-right shrink-0">
              <div className={`text-3xl xl:text-4xl font-mono font-bold leading-none ${scoreColor(company.score)}`}>
                {company.score}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-text-muted mt-1">
                {scoreLabel(company.score)}
              </div>
            </div>
          </div>

          {company.city && (
            <p className="text-xs text-text-secondary font-mono uppercase tracking-wider">
              {company.city}
            </p>
          )}
        </header>

        {/* Dati azienda */}
        <section className="mb-8 xl:mb-10 glass-light rounded-2xl p-5 xl:p-6 space-y-4">
          {company.address && (
            <div className="grid grid-cols-1 xl:grid-cols-[120px_1fr] gap-1 xl:gap-3">
              <span className="text-[10px] uppercase tracking-widest text-text-muted">
                Indirizzo
              </span>
              <span className="text-sm text-text-primary">{company.address}</span>
            </div>
          )}
          {company.phone && (
            <div className="grid grid-cols-1 xl:grid-cols-[120px_1fr] gap-1 xl:gap-3">
              <span className="text-[10px] uppercase tracking-widest text-text-muted">
                Telefono
              </span>
              <a
                href={`tel:${company.phone}`}
                className="text-sm text-violet-600 hover:text-violet-800 transition-colors"
              >
                {company.phone}
              </a>
            </div>
          )}
          {company.email && (
            <div className="grid grid-cols-1 xl:grid-cols-[120px_1fr] gap-1 xl:gap-3">
              <span className="text-[10px] uppercase tracking-widest text-text-muted">
                Email
              </span>
              <a
                href={`mailto:${company.email}`}
                className="text-sm text-violet-600 hover:text-violet-800 transition-colors break-all"
              >
                {company.email}
              </a>
            </div>
          )}
          {company.website && (
            <div className="grid grid-cols-1 xl:grid-cols-[120px_1fr] gap-1 xl:gap-3">
              <span className="text-[10px] uppercase tracking-widest text-text-muted">
                Sito
              </span>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-violet-600 hover:text-violet-800 transition-colors underline underline-offset-2 break-all"
              >
                {company.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            </div>
          )}
          {!company.address && !company.phone && !company.email && !company.website && (
            <p className="text-sm text-text-secondary">
              Nessun dato di contatto disponibile.
            </p>
          )}
        </section>

        {/* Azioni (Kanban, stato, note) */}
        <CompanyActions
          companyId={company.id}
          companyData={{
            name: company.name,
            city: company.city,
            website: company.website,
            score: company.score,
          }}
          initialStatus={company.status}
          initialNotes={company.notes || ''}
          initialInKanban={company.inKanban}
        />

        {/* Scansione */}
        <section className="mt-8 xl:mt-10">
          <h2 className="text-xs font-bold tracking-widest text-violet-600 uppercase mb-4">
            Scansione
          </h2>
          <div className="glass-light rounded-2xl p-5 xl:p-6 space-y-4">

            {needsReview && (
              <div className="text-xs text-amber-600">
                Da controllare a mano {error && `(${error})`}
              </div>
            )}

            {company.lastScannedAt && (
              <div className="grid grid-cols-1 xl:grid-cols-[120px_1fr] gap-1 xl:gap-3">
                <span className="text-[10px] uppercase tracking-widest text-text-muted">
                  Ultima
                </span>
                <span className="text-sm font-mono text-text-primary">
                  {new Date(company.lastScannedAt).toLocaleString('it-IT')}
                </span>
              </div>
            )}

            {keywords.length > 0 ? (
              <div>
                <span className="text-[10px] uppercase tracking-widest text-text-muted block mb-3">
                  Keyword trovate ({keywords.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((k, i) => (
                    <span
                      key={i}
                      className="text-xs font-mono bg-violet-50 border border-violet-500/15 px-2 py-1 rounded-full text-text-primary"
                      title={`Peso ${k.weight} × ${k.count} occorrenze`}
                    >
                      {k.word} <span className="text-text-muted">×{k.count}</span>
                      <span className="text-violet-600 ml-1">+{k.contribution}</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-secondary">Nessuna keyword trovata.</p>
            )}
          </div>
        </section>

      </div>
    </main>
  )
}