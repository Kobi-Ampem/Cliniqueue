import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbFile = path.resolve(__dirname, 'clinicplus.db')

const db = new Database(dbFile)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS wait_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facilityId TEXT NOT NULL,
      service TEXT NOT NULL,
      minutes INTEGER NOT NULL,
      timeOfDay TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      facility TEXT NOT NULL,
      service TEXT NOT NULL,
      doctor TEXT DEFAULT '',
      diagnosis TEXT DEFAULT '',
      prescriptions TEXT DEFAULT '',
      nextDate TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  const stmt = db.prepare('SELECT COUNT(*) as count FROM wait_reports')
  const result = stmt.get()

  if (result.count === 0) {
    console.log('Seeding initial wait time data...')

    const facilitiesPath = path.resolve(__dirname, '../../frontend/src/data/facilities.json')
    if (fs.existsSync(facilitiesPath)) {
      const facilities = JSON.parse(fs.readFileSync(facilitiesPath, 'utf8'))
      const insert = db.prepare(`
        INSERT INTO wait_reports (facilityId, service, minutes, timeOfDay) 
        VALUES (?, ?, ?, ?)
      `)

      const insertMany = db.transaction((facilities) => {
        for (const f of facilities) {
          for (const s of f.services) {
            insert.run(f.id, s.name, s.avgWaitMinutes + 10, 'morning')
            insert.run(f.id, s.name, Math.max(5, s.avgWaitMinutes - 15), 'afternoon')
            insert.run(f.id, s.name, s.avgWaitMinutes, 'morning')
          }
        }
      })
      insertMany(facilities)
      console.log('Seeding complete')
    }
  }
}

export default db
