import { useCallback, useEffect, useRef, useState } from 'react'
import { PasteModal } from './components/PasteModal'
import { TeamsBoard } from './components/TeamsBoard'
import { exportTeamsImage } from './lib/exportImage'
import { assignTeams, parsePlayers } from './lib/parsePlayers'
import { Player } from './types'

const STORAGE_KEY = 'futbol-equipos-state'

function loadFromStorage(): Player[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Player[]) : null
  } catch {
    return null
  }
}

function saveToStorage(players: Player[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players))
  } catch {}
}

function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: 'ok' | 'err' }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full font-body text-sm font-semibold shadow-xl z-50 transition-all
        ${type === 'ok' ? 'bg-green-500 text-[#071810]' : 'bg-red-500 text-white'}`}
    >
      {message}
    </div>
  )
}

// ── ExportView ────────────────────────────────────────────────────────────────
function ExportView({ players }: { players: Player[] }) {
  const teamA = players.filter((p) => p.team === 'A')
  const teamB = players.filter((p) => p.team === 'B')
  const now = new Date()
  const dateStr = now.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      id="export-area"
      className="rounded-2xl overflow-hidden"
      style={{ background: '#0f2419', padding: '24px', fontFamily: 'DM Sans, sans-serif' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <span style={{ fontSize: '28px' }}>⚽</span>
        <span style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '28px', letterSpacing: '4px', color: '#4ade80' }}>
          ARMAR EQUIPOS
        </span>
      </div>
      <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '20px' }}>
        {dateStr} · {timeStr}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Team A */}
        <div style={{ background: '#071810', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(52,211,153,0.2)' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(52,211,153,0.2)' }}>
            <span style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '20px', letterSpacing: '3px', color: '#34d399' }}>
              EQUIPO A
            </span>
          </div>
          <div style={{ padding: '10px 14px' }}>
            {teamA.map((p, i) => (
              <p key={p.id} style={{ margin: '4px 0', fontSize: '13px', color: '#d1fae5' }}>
                <span style={{ color: '#34d399', marginRight: '6px' }}>{i + 1}.</span>
                {p.name}
              </p>
            ))}
          </div>
        </div>
        {/* Team B */}
        <div style={{ background: '#071810', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(56,189,248,0.2)' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(56,189,248,0.2)' }}>
            <span style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '20px', letterSpacing: '3px', color: '#38bdf8' }}>
              EQUIPO B
            </span>
          </div>
          <div style={{ padding: '10px 14px' }}>
            {teamB.map((p, i) => (
              <p key={p.id} style={{ margin: '4px 0', fontSize: '13px', color: '#e0f2fe' }}>
                <span style={{ color: '#38bdf8', marginRight: '6px' }}>{i + 1}.</span>
                {p.name}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [players, setPlayers] = useState<Player[]>([])
  const [showModal, setShowModal] = useState(false)
  const [remember, setRemember] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [exporting, setExporting] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load from storage if remember was previously on
  useEffect(() => {
    const stored = loadFromStorage()
    if (stored && stored.length > 0) {
      setPlayers(stored)
      setRemember(true)
    }
  }, [])

  const showToast = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2800)
  }, [])

  function updatePlayers(next: Player[]) {
    setPlayers(next)
    if (remember) saveToStorage(next)
    else clearStorage()
  }

  function handleRememberToggle() {
    const next = !remember
    setRemember(next)
    if (next) saveToStorage(players)
    else clearStorage()
  }

  async function handlePasteButton() {
    try {
      const text = await navigator.clipboard.readText()
      if (text.trim()) {
        processText(text)
        return
      }
    } catch {}
    setShowModal(true)
  }

  function processText(text: string) {
    const parsed = parsePlayers(text)
    if (parsed.length === 0) {
      showToast('No se detectaron jugadores', 'err')
      return
    }
    const assigned = assignTeams(parsed)
    updatePlayers(assigned)
    showToast(`${parsed.length} jugador${parsed.length !== 1 ? 'es' : ''} detectado${parsed.length !== 1 ? 's' : ''} ✓`)
  }

  function handleShuffle() {
    if (players.length === 0) return
    const reassigned = assignTeams(players)
    updatePlayers(reassigned)
    showToast('Equipos revueltos 🔀')
  }

  function handleSwap() {
    if (players.length === 0) return
    const swapped = players.map((p) => ({ ...p, team: p.team === 'A' ? 'B' : 'A' }) as Player)
    updatePlayers(swapped)
    showToast('Equipos invertidos ↔️')
  }

  function handleClear() {
    updatePlayers([])
    showToast('Lista borrada')
  }

  async function handleExport() {
    if (players.length === 0) return
    setExporting(true)
    try {
      await new Promise((r) => setTimeout(r, 50)) // let DOM render export-area
      await exportTeamsImage('export-area')
      showToast('Imagen generada 📸')
    } catch (e) {
      console.error(e)
      showToast('Error al generar imagen', 'err')
    } finally {
      setExporting(false)
    }
  }

  const hasPlayers = players.length > 0

  return (
    <div className="min-h-screen bg-[#071810] text-white font-body">
      {/* Subtle pitch texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 40px, #22c55e 40px, #22c55e 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, #22c55e 40px, #22c55e 41px)',
        }}
      />

      <div className="relative max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl">⚽</span>
            <h1 className="font-display text-5xl tracking-widest text-green-400">ARMAR EQUIPOS</h1>
          </div>
          {hasPlayers && (
            <p className="text-green-600 font-body text-sm font-medium">
              {players.length} jugador{players.length !== 1 ? 'es' : ''}
            </p>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={handlePasteButton}
          className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-400 active:scale-[0.98] text-[#071810] font-body font-bold text-lg transition-all shadow-lg shadow-green-900/50"
        >
          {hasPlayers ? '📋 Pegar nueva lista' : '📋 Pegar lista'}
        </button>

        {/* Teams */}
        {hasPlayers && (
          <>
            <TeamsBoard players={players} onChange={updatePlayers} />

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleShuffle}
                className="py-3 rounded-xl border border-green-700/40 bg-green-900/20 text-green-300 font-body font-semibold text-sm hover:bg-green-900/40 active:scale-95 transition-all"
              >
                🔀 Repartir de nuevo
              </button>
              <button
                onClick={handleSwap}
                className="py-3 rounded-xl border border-green-700/40 bg-green-900/20 text-green-300 font-body font-semibold text-sm hover:bg-green-900/40 active:scale-95 transition-all"
              >
                ↔️ Invertir equipos
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-body font-bold text-sm active:scale-95 transition-all disabled:opacity-50"
              >
                {exporting ? '⏳ Generando…' : '📸 Generar imagen'}
              </button>
              <button
                onClick={handleClear}
                className="py-3 rounded-xl border border-red-800/40 bg-red-900/10 text-red-400 font-body font-semibold text-sm hover:bg-red-900/30 active:scale-95 transition-all"
              >
                🗑️ Limpiar
              </button>
            </div>

            {/* Remember toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none group">
              <div
                onClick={handleRememberToggle}
                role="switch"
                aria-checked={remember}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleRememberToggle()}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  remember ? 'bg-green-500' : 'bg-green-900/60'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    remember ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
              <span className="text-green-500 font-body text-sm">Recordar en este dispositivo</span>
            </label>
          </>
        )}

        {/* Empty state hint */}
        {!hasPlayers && (
          <div className="text-center space-y-2 py-8 text-green-800">
            <p className="text-4xl">📱</p>
            <p className="font-body text-sm">
              Copiá la lista del grupo de WhatsApp y tocá el botón de arriba.
            </p>
          </div>
        )}
      </div>

      {/* Hidden export area – off-screen but in DOM */}
      <div className="fixed left-[-9999px] top-0 w-[360px]" aria-hidden="true">
        <ExportView players={players} />
      </div>

      {/* Modal */}
      {showModal && (
        <PasteModal
          onConfirm={(text) => {
            setShowModal(false)
            processText(text)
          }}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  )
}
