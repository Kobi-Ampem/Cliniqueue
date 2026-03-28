import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const router = express.Router()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

function loadServicesData() {
  const dataPath = path.resolve(__dirname, '../../frontend/src/data/hospitalServices.json')
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'))
}

// GET /api/hospital-services — all hospital services
router.get('/', (req, res) => {
  try {
    const data = loadServicesData()
    res.json(data)
  } catch (err) {
    console.error('Hospital Services GET error:', err)
    res.status(500).json({ error: 'Failed to load hospital services data' })
  }
})

// GET /api/hospital-services/:id — single service by id
router.get('/:id', (req, res) => {
  try {
    const data = loadServicesData()
    const service = data.find(item => item.id === req.params.id)

    if (!service) {
      return res.status(404).json({ error: 'Service not found' })
    }

    res.json(service)
  } catch (err) {
    console.error('Hospital Services GET/:id error:', err)
    res.status(500).json({ error: 'Failed to load hospital service data' })
  }
})

export default router
