import express from 'express'
import db from '../db/database.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const router = express.Router()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Get all facilities with their calculated wait times
router.get('/', (req, res) => {
  try {
    // Read base structure from frontend JSON
    const dataPath = path.resolve(__dirname, '../../frontend/src/data/facilities.json')
    const facilities = JSON.parse(fs.readFileSync(dataPath))

    // Pull wait reports from DB
    const reports = db.prepare('SELECT * FROM wait_reports').all()

    // Map DB reports back onto base JSON structure
    const enriched = facilities.map(fac => {
      const facReports = reports.filter(r => r.facilityId === fac.id)
      
      const newServices = fac.services.map(svc => {
        // Find reports for this specific service
        const svcReports = facReports.filter(r => r.service === svc.name)

        if (svcReports.length === 0) return svc

        // Calculate a basic average
        const totalWait = svcReports.reduce((sum, r) => sum + r.minutes, 0)
        let newAvg = Math.round(totalWait / svcReports.length)
        
        // Add a count based on reports length plus base reportCount to simulate a bigger dataset
        return {
          ...svc,
          avgWaitMinutes: newAvg,
          reportCount: svc.reportCount + svcReports.length
        }
      })

      return {
        ...fac,
        services: newServices
      }
    })

    res.json(enriched)
  } catch (err) {
    console.error('Wait times error:', err)
    res.status(500).json({ error: 'Failed to fetch wait times' })
  }
})

// Submit a new wait time report
router.post('/', (req, res) => {
  const { facilityId, service, minutes, timeOfDay } = req.body

  if (!facilityId || !service || typeof minutes !== 'number' || !timeOfDay) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const insert = db.prepare('INSERT INTO wait_reports (facilityId, service, minutes, timeOfDay) VALUES (?, ?, ?, ?)')
    const result = insert.run(facilityId, service, minutes, timeOfDay)
    
    res.status(201).json({ success: true, id: result.lastInsertRowid })
  } catch (err) {
    console.error('Insert error:', err)
    res.status(500).json({ error: 'Failed to save wait time' })
  }
})

export default router
