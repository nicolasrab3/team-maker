import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import { Player, TeamId } from '../types'

// ── SortablePlayer ──────────────────────────────────────────────────────────
function SortablePlayer({ player, teamColor }: { player: Player; teamColor: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: player.id,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/20 hover:bg-black/30 transition-colors group cursor-grab active:cursor-grabbing touch-none select-none"
      aria-label={`Arrastrar a ${player.name}`}
    >
      <span className={`text-lg ${teamColor} opacity-40 group-hover:opacity-70 transition-opacity`}>
        ☰
      </span>
      <span className="flex-1 font-body text-sm font-medium text-white/90">
        {player.name}
      </span>
    </div>
  )
}

// ── PlayerCard (overlay while dragging) ─────────────────────────────────────
function PlayerCard({ player }: { player: Player }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-900 shadow-xl border border-green-500/50 cursor-grabbing">
      <span className="text-green-400 text-lg">☰</span>
      <span className="font-body text-sm font-medium text-white">{player.name}</span>
    </div>
  )
}

// ── TeamColumn ───────────────────────────────────────────────────────────────
function TeamColumn({
  teamId,
  players,
  label,
  accentClass,
  borderClass,
  badgeClass,
}: {
  teamId: TeamId
  players: Player[]
  label: string
  accentClass: string
  borderClass: string
  badgeClass: string
}) {
  return (
    <div
      className={`flex-1 min-w-0 rounded-2xl border ${borderClass} bg-black/20 overflow-hidden`}
      data-team={teamId}
    >
      {/* Header */}
      <div className={`px-4 py-3 flex items-center gap-2 border-b ${borderClass}`}>
        <span className={`font-display text-2xl tracking-widest ${accentClass}`}>{label}</span>
        <span className={`ml-auto text-xs font-body font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>
          {players.length}
        </span>
      </div>

      {/* Players */}
      <SortableContext items={players.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <div className="p-2 space-y-1 min-h-[120px]">
          {players.map((p) => (
            <SortablePlayer key={p.id} player={p} teamColor={accentClass} />
          ))}
          {players.length === 0 && (
            <p className="text-center text-green-900 font-body text-xs py-6">Sin jugadores</p>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

// ── TeamsBoard ────────────────────────────────────────────────────────────────
interface Props {
  players: Player[]
  onChange: (players: Player[]) => void
}

export function TeamsBoard({ players, onChange }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const teamA = players.filter((p) => p.team === 'A')
  const teamB = players.filter((p) => p.team === 'B')
  const activePlayer = players.find((p) => p.id === activeId) ?? null

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const activePlayer = players.find((p) => p.id === active.id)
    const overPlayer = players.find((p) => p.id === over.id)
    if (!activePlayer || !overPlayer) return
    if (activePlayer.team !== overPlayer.team) {
      const updated = players.map((p) =>
        p.id === activePlayer.id ? { ...p, team: overPlayer.team } : p
      )
      onChange(updated)
    }
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over || active.id === over.id) return

    const oldIndex = players.findIndex((p) => p.id === active.id)
    const newIndex = players.findIndex((p) => p.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    onChange(arrayMove(players, oldIndex, newIndex))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3">
        <TeamColumn
          teamId="A"
          players={teamA}
          label="EQUIPO A"
          accentClass="text-emerald-400"
          borderClass="border-emerald-700/40"
          badgeClass="bg-emerald-900/60 text-emerald-300"
        />
        <TeamColumn
          teamId="B"
          players={teamB}
          label="EQUIPO B"
          accentClass="text-sky-400"
          borderClass="border-sky-700/40"
          badgeClass="bg-sky-900/60 text-sky-300"
        />
      </div>
      <DragOverlay>{activePlayer ? <PlayerCard player={activePlayer} /> : null}</DragOverlay>
    </DndContext>
  )
}
