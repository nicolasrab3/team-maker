import { Player } from '../types'

const WEEKDAY = '(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)'
const SIMPLE_WEEKDAY_REGEX = new RegExp(`^${WEEKDAY}(\\s+\\d{1,2})?$`, 'i')
const WHATSAPP_HEADER_REGEX = new RegExp(
  `^${WEEKDAY}(?:\\s+\\d{1,2}(?:[\\/-]\\d{1,2})?(?:[\\/-]\\d{2,4})?)?(?:\\s+\\d{1,2}:\\d{2})?(?:\\s*[-–—]\\s*.+)?$`,
  'i'
)

function isHeaderLine(text: string): boolean {
  const value = text.trim()
  return SIMPLE_WEEKDAY_REGEX.test(value) || WHATSAPP_HEADER_REGEX.test(value)
}

function cleanLine(line: string): string {
  // Remove leading numbering: "1. " "2) " "3- " "4: "
  line = line.replace(/^\s*\d+\s*[\.\)\-:]\s*/, '')
  // Remove bullet/dash/asterisk prefixes
  line = line.replace(/^\s*[-•*·]\s*/, '')
  // Remove leading emojis / non-alphanumeric chars (but keep the rest)
  line = line.replace(/^[^\p{L}\p{N}]+/u, '')
  return line.trim()
}

export function parsePlayers(raw: string): Player[] {
  const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  let lines: string[] = normalized.split('\n')

  // If single line with commas/semicolons, split by those
  if (lines.length === 1) {
    const single = lines[0]
    if (/[,;]/.test(single)) {
      lines = single.split(/[,;]/)
    }
  }

  const seen = new Set<string>()
  const players: Player[] = []
  let isFirstItem = true

  for (const line of lines) {
    const name = cleanLine(line)
    if (!name) continue

    // "Out" corta la lista: ese item y todo lo de abajo se excluye
    if (name.toLowerCase() === 'out') break

    // Primer ítem encabezado (ej. "Martes 14", "Martes 28/04 19:50 - KDT") se excluye
    if (isFirstItem && isHeaderLine(name)) {
      isFirstItem = false
      continue
    }
    isFirstItem = false

    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    players.push({ id: crypto.randomUUID(), name, team: 'A' })
  }

  return players
}

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function assignTeams(players: Player[]): Player[] {
  const shuffled = fisherYates(players)
  const half = Math.ceil(shuffled.length / 2)
  return shuffled.map((p, i) => ({ ...p, team: i < half ? 'A' : 'B' }))
}
