export function shareTextToWhatsApp(text) {
  const enc = encodeURIComponent(text.slice(0, 4000))
  window.open(`https://wa.me/?text=${enc}`, '_blank', 'noopener,noreferrer')
}
