'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

export default function SearchInput({ defaultValue }) {
  const [value, setValue] = useState(defaultValue || '')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value.trim()) {
        params.set('q', value.trim())
      } else {
        params.delete('q')
      }
      router.push(`/companies?${params.toString()}`)
    }, 300)

    return () => clearTimeout(timer)
  }, [value])

  function handleClear() {
    setValue('')
  }

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cerca per nome, città o sito..."
        className="w-full bg-white border border-violet-500/15 rounded-xl pl-11 pr-11 py-3 text-sm text-text-primary placeholder-text-muted focus:border-violet-400 focus:outline-none transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-text-muted hover:text-violet-600 hover:bg-violet-50 transition-colors"
          aria-label="Cancella ricerca"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}