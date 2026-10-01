'use client'

import { useState, useTransition } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCenter,
} from '@dnd-kit/core'
import { updateStatus } from '@/app/companies/[id]/actions'
import KanbanCard from './KanbanCard'

function DroppableColumn({ column, items, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.status })

  return (
    <div
      ref={setNodeRef}
      className={`w-72 shrink-0 rounded-2xl p-4 flex flex-col max-h-[70vh] transition-all ${
        isOver
          ? 'bg-violet-100 border border-violet-400'
          : 'glass-light'
      }`}
    >
      <div className="flex items-baseline justify-between mb-4 pb-3 border-b border-violet-500/15 shrink-0">
        <h3 className="text-xs font-bold tracking-widest text-violet-600 uppercase">
          {column.label}
        </h3>
        <span className="text-xs font-mono text-text-muted">
          {items.length}
        </span>
      </div>
      <div className="space-y-2 overflow-y-auto flex-1 pr-1">
        {items.length === 0 && (
          <p className="text-xs text-text-muted opacity-60 py-2 italic font-serif">
            Vuota
          </p>
        )}
        {children}
      </div>
    </div>
  )
}

export default function KanbanBoard({ columns, companies: initialCompanies }) {
  const [companies, setCompanies] = useState(initialCompanies)
  const [activeId, setActiveId] = useState(null)
  const [, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  const activeCompany = activeId
    ? companies.find((c) => c.id === activeId)
    : null

  function handleDragStart(event) {
    setActiveId(event.active.id)
  }

  function handleDragEnd(event) {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const companyId = active.id
    const newStatus = over.id

    const company = companies.find((c) => c.id === companyId)
    if (!company || company.status === newStatus) return

    setCompanies((prev) =>
      prev.map((c) => (c.id === companyId ? { ...c, status: newStatus } : c))
    )

    startTransition(async () => {
      try {
        await updateStatus(companyId, newStatus)
      } catch (err) {
        setCompanies((prev) =>
          prev.map((c) =>
            c.id === companyId ? { ...c, status: company.status } : c
          )
        )
      }
    })
  }

  const byStatus = {}
  for (const col of columns) {
    byStatus[col.status] = companies.filter((c) => c.status === col.status)
  }

  return (
    <DndContext
        id="jobwizard-kanban"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        >
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {columns.map((col) => (
            <DroppableColumn key={col.status} column={col} items={byStatus[col.status]}>
              {byStatus[col.status].map((c) => (
                <KanbanCard key={c.id} company={c} />
              ))}
            </DroppableColumn>
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeCompany ? (
          <div className="rotate-2">
            <KanbanCard company={activeCompany} isOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}