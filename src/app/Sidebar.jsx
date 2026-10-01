'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Wand2, Eye, Library, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react'

const LINKS = [
  { href: '/', label: 'Quest', icon: Wand2 },
  { href: '/companies', label: 'Library', icon: Library },
  { href: '/import', label: 'Summon', icon: Eye },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1280) setMobileOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      {/* Hamburger (mobile + tablet) */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 xl:hidden w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
        style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }}
        aria-label="Apri menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay (mobile + tablet) */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 xl:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen z-50 flex flex-col transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          xl:translate-x-0
          ${collapsed ? 'xl:w-20' : 'xl:w-60'}
          w-60
        `}
        style={{
          background: 'linear-gradient(180deg, #1a0b2e 0%, #2d1b4e 100%)',
          borderRight: '1px solid rgba(168, 85, 247, 0.2)',
        }}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-violet-500/15">
          <Link href="/" className="flex items-center gap-3 group min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br from-violet-500 to-cyan-500 group-hover:glow-violet transition-all">
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            {(!collapsed || mobileOpen) && (
              <span className="font-serif text-xl font-semibold tracking-tight text-white truncate">
                JobWizard
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="xl:hidden text-violet-200/70 hover:text-white transition-colors"
            aria-label="Chiudi menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-6 space-y-1 px-3">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === '/' ? pathname === '/' : pathname.startsWith(href)

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group ${
                  isActive
                    ? 'text-white bg-violet-500/20'
                    : 'text-violet-200/70 hover:text-white hover:bg-violet-500/10'
                }`}
                title={collapsed ? label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {(!collapsed || mobileOpen) && (
                  <span className="truncate tracking-wide">{label}</span>
                )}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-violet-400 rounded-r-full" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Collapse button (solo desktop) */}
        <div className="hidden xl:block p-3 border-t border-violet-500/15 mb-16">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-violet-200/70 hover:text-white hover:bg-violet-500/10 transition-all text-xs font-bold tracking-widest uppercase"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Comprimi</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}