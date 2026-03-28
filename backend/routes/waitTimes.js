import express from 'express'
import supabase from '../db/database.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const router = express.Router()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

router.get('/', async (req, res) => {
  try {
    const dataPath = path.resolve(__dirname, '../../frontend/src/data/facilities.json')
    const facilities = JSON.parse(fs.readFileSync(dataPath))

    const { data: reports, error } = await supabase
      .from('wait_reports')
      .select('*')

    if (error) throw error

    const enriched = facilities.map(fac => {
      const facReports = (reports || []).filter(r => r.facility_id === fac.id)

      const newServices = fac.services.map(svc => {
        const svcReports = facReports.filter(r => r.service === svc.name)
        if (svcReports.length === 0) return svc

        const totalWait = svcReports.reduce((sum, r) => sum + r.minutes, 0)
        const newAvg = Math.round(totalWait / svcReports.length)

        return {
          ...svc,
          avgWaitMinutes: newAvg,
          reportCount: svc.reportCount + svcReports.length
        }
      })

      return { ...fac, services: newServices }
    })

    res.json(enriched)
  } catch (err) {
    console.error('Wait times error:', err)
    res.status(500).json({ error: 'Failed to fetch wait times' })
  }
})

router.post('/', async (req, res) => {
  const { facilityId, service, minutes, timeOfDay } = req.body

  if (!facilityId || !service || typeof minutes !== 'number' || !timeOfDay) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const { data, error } = await supabase
      .from('wait_reports')
      .insert({ facility_id: facilityId, service, minutes, time_of_day: timeOfDay })
      .select()
      .single()

    if (error) throw error
    res.status(201).json({ success: true, id: data.id })
  } catch (err) {
    console.error('Insert error:', err)
    res.status(500).json({ error: 'Failed to save wait time' })
  }
})

export default router
