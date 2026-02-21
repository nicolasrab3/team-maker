import { useCallback, useEffect, useRef, useState } from 'react'

interface Props {
  onConfirm: (text: string) => void
  onClose: () => void
}

export function PasteModal({ onConfirm, onClose }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [pasteError, setPasteError] = useState<string | null>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  const handlePasteFromClipboard = useCallback(async () => {
    setPasteError(null)
    try {
      const text = await navigator.clipboard.readText()
      if (ref.current) {
        ref.current.value = text
        ref.current.focus()
      }
    } catch {
      setPasteError('No se pudo leer el portapapeles. Pegá la lista con el dedo (mantener apretado en el recuadro).')
    }
  }, [])

  function handleConfirm() {
    const text = ref.current?.value.trim() ?? ''
    if (text) onConfirm(text)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={handleKey}
    >
      <div className="w-full max-w-lg bg-[#0f2419] border border-green-700/40 rounded-2xl p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-green-400 tracking-wide">PEGÁ LA LISTA</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-green-600 hover:text-green-300 transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>
        <p className="text-green-300/70 text-sm font-body">
          Copiá la lista de WhatsApp y pegala acá. Acepta numeración, guiones, bullets, o una línea por jugador.
        </p>
        <button
          type="button"
          onClick={handlePasteFromClipboard}
          className="w-full py-2.5 rounded-xl border border-green-600 bg-green-900/30 text-green-400 font-body text-sm font-semibold hover:bg-green-900/50 active:scale-[0.98] transition-all"
        >
          📋 Pegar del portapapeles
        </button>
        {pasteError && (
          <p className="text-amber-400 text-sm font-body" role="alert">
            {pasteError}
          </p>
        )}
        <textarea
          ref={ref}
          placeholder={"1. Nico\n2. Juan\n- Pedro\n• María"}
          rows={8}
          className="w-full bg-[#071810] border border-green-700/30 rounded-xl p-3 text-green-100 font-body text-sm resize-none outline-none focus:border-green-500 transition-colors placeholder-green-800"
          aria-label="Lista de jugadores"
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-green-800 text-green-500 font-body font-semibold hover:bg-green-900/30 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-xl bg-green-500 text-[#071810] font-body font-bold hover:bg-green-400 active:scale-95 transition-all"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
