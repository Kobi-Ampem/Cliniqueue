const STORAGE_KEY = 'cliniklan_wait_reports_v1'

export function loadWaitReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveWaitReport(entry) {
  const list = loadWaitReports()
  list.push({
    ...entry,
    at: new Date().toISOString(),
  })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function reportsThisWeek(reports) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  return reports.filter((r) => new Date(r.at).getTime() >= weekAgo).length
}

export function mergedServiceAverage(seedService, userReports, facilityId) {
  const relevant = userReports.filter(
    (r) => r.facilityId === facilityId && r.serviceId === seedService.id,
  )
  const totalMinutes =
    seedService.avgMinutes * seedService.reportCount +
    relevant.reduce((a, r) => a + r.minutes, 0)
  const count = seedService.reportCount + relevant.length
  return count ? Math.round(totalMinutes / count) : seedService.avgMinutes
}
