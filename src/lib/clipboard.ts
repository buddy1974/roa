/**
 * Copies text to the clipboard.
 * Uses navigator.clipboard.writeText when available; falls back to
 * a hidden textarea + execCommand("copy") for older browsers.
 * Returns true on success, false on failure.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // fall through to execCommand fallback
    }
  }

  const el = document.createElement('textarea')
  el.value = text
  el.setAttribute('style', 'position:fixed;left:-9999px;top:-9999px;opacity:0')
  document.body.appendChild(el)
  el.focus()
  el.select()
  try {
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    document.body.removeChild(el)
  }
}
