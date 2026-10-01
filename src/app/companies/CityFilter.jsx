'use client'

import Link from 'next/link'

const MIN_COMPANIES = 3

function buildUrl({ city, group, q, min, sort }) {
  const sp = new URLSearchParams()
  if (city) sp.set('city', city)
  if (group) sp.set('group', group)
  if (q) sp.set('q', q)
  if (min !== undefined && min !== null && min !== 30) sp.set('min', String(min))
  if (sort && sort !== 'score') sp.set('sort', sort)
  const qs = sp.toString()
  return qs ? `/companies?${qs}` : '/companies'
}

export default function CityFilter({ cities, activeCity, activeGroup, searchQuery, minScore, sortBy }) {
  const bigCities = cities.filter((c) => c.count >= MIN_COMPANIES)
  const smallCities = cities.filter((c) => c.count < MIN_COMPANIES)
  const totalSmall = smallCities.reduce((sum, c) => sum + c.count, 0)

  const urlFor = ({ city, group }) => buildUrl({ city, group, q:searchQuery, min: minScore, sort: sortBy })

  const activeClass = 'border-violet-400 text-violet-700 bg-violet-50'
  const inactiveClass = 'border-violet-500/15 text-text-secondary hover:border-violet-300 hover:text-violet-700'

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={urlFor({})}
        className={`text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full border transition-all ${
          !activeCity && !activeGroup ? activeClass : inactiveClass
        }`}
      >
        Tutte
      </Link>

      {bigCities.map((c) => (
        <Link
          key={c.name}
          href={urlFor({ city: c.name })}
          className={`text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full border transition-all ${
            activeCity === c.name ? activeClass : inactiveClass
          }`}
        >
          {c.name} <span className="opacity-50">({c.count})</span>
        </Link>
      ))}

      {smallCities.length > 0 && (
        <Link
          href={urlFor({ group: 'small' })}
          className={`text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full border transition-all ${
            activeGroup === 'small' ? activeClass : inactiveClass
          }`}
        >
          Altre {smallCities.length} città <span className="opacity-50">({totalSmall})</span>
        </Link>
      )}
    </div>
  )
}