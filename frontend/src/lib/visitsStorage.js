const STORAGE_KEY = 'cliniklan_visits_v1'

export function loadVisits() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveVisits(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function addVisit(entry) {
  const list = loadVisits()
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `v-${Date.now()}`
  list.unshift({ ...entry, id, createdAt: new Date().toISOString() })
  saveVisits(list)
  return list
}
