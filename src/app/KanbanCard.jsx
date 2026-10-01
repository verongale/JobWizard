'use client'

import { useDraggable } from '@dnd-kit/core'
import Link from 'next/link'

const STATUS_COLORS = {
  DA_CONTATTARE: '#ede9fe',
  CONTATTATO: '#dbeafe',
  COLLOQUIO: '#cffafe',
  RIFIUTATO: '#f3f4f6',
  ASSUNTO: '#e9d5ff',
  SCARTATO_DA_ME: '#f3f4f6',
}

function scoreColor(score) {
  if (score >= 100) return 'text-violet-600'
  if (score >= 50) return 'text-cyan-600'
  if (score >= 30) return 'text-blue-600'
  if (score > 0) return 'text-violet-400'
  return 'text-text-muted'
}

export default function KanbanCard({ company, isOverlay = false }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: company.id,
      disabled: isOverlay,
    })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  const bgColor = STATUS_COLORS[company.status] || '#f3f4f6'

  const content = (
    <div
      className={`rounded-xl p-3 transition-all border border-violet-500/10 ${
        isDragging ? 'opacity-30' : 'hover:border-violet-400'
      } ${isOverlay ? 'shadow-2xl cursor-grabbing' : 'cursor-grab'}`}
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="text-sm font-semibold leading-tight flex-1 min-w-0 truncate text-text-primary">
          {company.name}
        </h4>
        <span className={`text-sm font-mono font-bold shrink-0 ${scoreColor(company.score)}`}>
          {company.score}
        </span>
      </div>
      {company.city && (
        <p className="text-[10px] text-text-secondary font-mono uppercase tracking-wider">
          {company.city}
        </p>
      )}
    </div>
  )

  if (isOverlay) {
    return content
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Link href={`/companies/${company.id}`} className="block">
        {content}
      </Link>
    </div>
  )
}