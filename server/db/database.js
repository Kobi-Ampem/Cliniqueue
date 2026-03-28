import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbFile = path.resolve(__dirname, 'clinicplus.db')

// Create DB connection
const db = new Database(dbFile)

// Initialise DB schema
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

  // Check if we need to seed the db by looking at how many records we have
  const stmt = db.prepare('SELECT COUNT(*) as count FROM wait_reports')
  const result = stmt.get()

  if (result.count === 0) {
    console.log('🌱 Seeding initial wait time data...')
    
    // Read the facility seed file from frontend data
    const facilitiesPath = path.resolve(__dirname, '../../src/data/facilities.json')
    if (fs.existsSync(facilitiesPath)) {
      const facilities = JSON.parse(fs.readFileSync(facilitiesPath, 'utf8'))
      const insert = db.prepare(`
        INSERT INTO wait_reports (facilityId, service, minutes, timeOfDay) 
        VALUES (?, ?, ?, ?)
      `)

      const insertMany = db.transaction((facilities) => {
        for (const f of facilities) {
          for (const s of f.services) {
            // Seed a few records to build the average
            insert.run(f.id, s.name, s.avgWaitMinutes + 10, 'morning')
            insert.run(f.id, s.name, Math.max(5, s.avgWaitMinutes - 15), 'afternoon')
            insert.run(f.id, s.name, s.avgWaitMinutes, 'morning')
          }
        }
      })
      insertMany(facilities)
      console.log('✅ Seeding complete')
    }
  }
}

export default db
