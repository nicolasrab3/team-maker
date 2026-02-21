import { toPng } from 'html-to-image'

/**
 * html-to-image no renderiza bien elementos fuera de pantalla (ej. left: -9999px).
 * Clonamos el nodo, lo posicionamos en el viewport y generamos la imagen del clon.
 */
function cloneForExport(node: HTMLElement): HTMLElement {
  const clone = node.cloneNode(true) as HTMLElement
  const style = clone.style
  style.position = 'fixed'
  style.top = '0'
  style.left = '0'
  style.visibility = 'hidden'
  style.pointerEvents = 'none'
  style.zIndex = '-1'
  document.body.appendChild(clone)
  return clone
}

export async function exportTeamsImage(elementId: string): Promise<void> {
  const node = document.getElementById(elementId)
  if (!node) throw new Error('Export element not found')

  const clone = cloneForExport(node)
  try {
    const dataUrl = await toPng(clone, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: '#0f2419',
      skipFonts: true, // evita SecurityError al leer CSS de Google Fonts (cross-origin)
    })
    await triggerDownloadOrShare(dataUrl)
  } finally {
    document.body.removeChild(clone)
  }
}

async function triggerDownloadOrShare(dataUrl: string): Promise<void> {
  const blob = await (await fetch(dataUrl)).blob()
  const file = new File([blob], 'equipos.png', { type: 'image/png' })

  // Try Web Share API (mobile)
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file], title: 'Equipos de fútbol' })
    return
  }

  // Fallback: download
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = 'equipos.png'
  link.click()
}
