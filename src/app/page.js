import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import KanbanBoard from './KanbanBoard'
import { Wand2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

const COLUMNS = [
  { status: 'DA_CONTATTARE', label: 'Da contattare' },
  { status: 'CONTATTATO', label: 'Contattato' },
  { status: 'COLLOQUIO', label: 'Colloquio' },
  { status: 'RIFIUTATO', label: 'Rifiutato' },
  { status: 'ASSUNTO', label: 'Assunto' },
]

export default async function HomePage() {
  const companies = await prisma.company.findMany({
    where: {
      OR: [
        { inKanban: true },
        { status: { not: 'DA_CONTATTARE' } },
      ],
    },
    orderBy: [{ score: 'desc' }, { name: 'asc' }],
  })

  const total = companies.length

  return (
    <main className="min-h-screen pt-12 pb-16 text-text-primary">
      <div className="max-w-7xl mx-auto px-8">
        <header className="mb-12">
          <h1 className="text-5xl md:text-6xl font-serif font-semibold tracking-tight text-text-primary">
            Quest Board
          </h1>
        </header>

        {total === 0 ? (
          <div className="glass-light rounded-2xl p-12 text-center">
            <Wand2 className="w-8 h-8 text-violet-500 mx-auto mb-4" />
            <p className="font-serif text-2xl mb-2 text-text-primary">
              Nessuna candidatura in corso
            </p>
            <p className="text-sm text-text-secondary mb-6">
              Vai nella Library e aggiungi le aziende che vuoi gestire.
            </p>
            <Link
              href="/companies"
              className="inline-block px-6 py-3 rounded-xl bg-violet-500 text-white text-sm font-bold tracking-wide hover-glow"
            >
              Apri Library
            </Link>
          </div>
        ) : (
          <KanbanBoard columns={COLUMNS} companies={companies} />
        )}
      </div>
    </main>
  )
}