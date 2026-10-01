import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import CompanyTable from './CompanyTable'
import CityFilter from './CityFilter'
import SearchInput from './SearchInput'

export const dynamic = 'force-dynamic'

const SCORE_OPTIONS = [
  { value: 0, label: 'Tutte' },
  { value: 30, label: '≥ 30' },
  { value: 50, label: '≥ 50' },
  { value: 100, label: '≥ 100' },
]

const SORT_OPTIONS = [
  { value: 'score', label: 'Score' },
  { value: 'name', label: 'Nome' },
  { value: 'city', label: 'Città' },
]

const MIN_COMPANIES = 3

function buildUrl(params) {
  const sp = new URLSearchParams()
  if (params.city) sp.set('city', params.city)
  if (params.group) sp.set('group', params.group)
  if (params.q) sp.set('q', params.q)
  if (params.min !== undefined && params.min !== null && params.min !== 30) {
    sp.set('min', String(params.min))
  }
  if (params.sort && params.sort !== 'score') sp.set('sort', params.sort)
  const qs = sp.toString()
  return qs ? `/companies?${qs}` : '/companies'
}

export default async function CompaniesPage({ searchParams }) {
  const params = await searchParams
  const cityFilter = params?.city || null
  const groupFilter = params?.group || null
  const searchQuery = params?.q || null 
  const minScore = parseInt(params?.min ?? '30', 10)
  const sortBy = params?.sort || 'score'

  // 1. Calcola TUTTE le città (per il filtro e per smallCityNames)
  const citiesRaw = await prisma.company.groupBy({
    by: ['city'],
    where: { score: { gte: minScore }, city: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { city: 'desc' } },
  })
  const cities = citiesRaw
    .filter((c) => c.city)
    .map((c) => ({ name: c.city, count: c._count._all }))

  const smallCityNames = cities
    .filter((c) => c.count < MIN_COMPANIES)
    .map((c) => c.name)

  // 2. Where
  const where = {
    score: { gte: minScore },
    ...(cityFilter && { city: cityFilter }),
    ...(groupFilter === 'small' && { city: { in: smallCityNames } }),
    ...(searchQuery && {
      OR: [
        { name: { contains: searchQuery, mode: 'insensitive'}},
        { city: { contains: searchQuery, mode: 'insensitive'}},
        { website: { contains: searchQuery, mode: 'insensitive'}}
      ]
    }

    )
  }

  const orderBy =
    sortBy === 'name' ? [{ name: 'asc' }]
    : sortBy === 'city' ? [{ city: 'asc' }, { score: 'desc' }]
    : [{ score: 'desc' }, { name: 'asc' }]

  const companies = await prisma.company.findMany({
    where,
    orderBy,
    take: 300,
  })

  const total = await prisma.company.count()

  return (
    <main className="min-h-screen pt-12 pb-16 text-text-primary">
      <div className="max-w-7xl mx-auto px-8">

        <header className="mb-10">
          <h1 className="text-5xl md:text-6xl font-serif font-semibold tracking-tight text-text-primary mb-3">
            Library
          </h1>
          <p className="text-sm text-text-secondary">
            {total} aziende totali
          </p>
        </header>

          {/* Ricerca */}
        <div className="mb-6">
          <SearchInput defaultValue={searchQuery} />
        </div>

        {/* Filtri */}
<div className="space-y-4 mb-8">
  {/* Score */}
  <div className="flex flex-wrap items-center gap-3">
    <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
      Score
    </span>
    {SCORE_OPTIONS.map((opt) => (
      <Link
        key={opt.value}
        href={buildUrl({
          city: cityFilter,
          group: groupFilter,
          q: searchQuery,
          min: opt.value,
          sort: sortBy,
        })}
        className={`text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full border transition-all ${
          minScore === opt.value
            ? 'border-violet-400 text-violet-700 bg-violet-50'
            : 'border-violet-500/15 text-text-secondary hover:border-violet-300 hover:text-violet-700'
        }`}
      >
        {opt.label}
      </Link>
    ))}
  </div>

  {/* Ordinamento */}
  <div className="flex flex-wrap items-center gap-3">
    <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
      Ordina
    </span>
    {SORT_OPTIONS.map((opt) => (
      <Link
        key={opt.value}
        href={buildUrl({
          city: cityFilter,
          group: groupFilter,
          q: searchQuery,
          min: minScore,
          sort: opt.value,
        })}
        className={`text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full border transition-all ${
          sortBy === opt.value
            ? 'border-violet-400 text-violet-700 bg-violet-50'
            : 'border-violet-500/15 text-text-secondary hover:border-violet-300 hover:text-violet-700'
        }`}
      >
        {opt.label}
      </Link>
    ))}
  </div>

  {/* Città */}
  <div className="flex flex-wrap items-center gap-3">
    <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
      Città
    </span>
    <CityFilter
      cities={cities}
      activeCity={cityFilter}
      activeGroup={groupFilter}
      searchQuery={searchQuery}
      minScore={minScore}
      sortBy={sortBy}
    />
  </div>
</div>

        {/* Tabella */}
        <CompanyTable companies={companies} />

      </div>
    </main>
  )
}