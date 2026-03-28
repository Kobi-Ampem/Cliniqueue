import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const router = express.Router()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

function loadFirstAidData() {
  const dataPath = path.resolve(__dirname, '../../src/data/firstAidData.json')
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'))
}

// GET /api/first-aid — all emergency categories
router.get('/', (req, res) => {
  try {
    const data = loadFirstAidData()
    res.json(data)
  } catch (err) {
    console.error('First Aid GET error:', err)
    res.status(500).json({ error: 'Failed to load first aid data' })
  }
})

// GET /api/first-aid/:id — single emergency category by id
router.get('/:id', (req, res) => {
  try {
    const data = loadFirstAidData()
    const category = data.find(item => item.id === req.params.id)

    if (!category) {
      return res.status(404).json({ error: 'Emergency category not found' })
    }

    res.json(category)
  } catch (err) {
    console.error('First Aid GET/:id error:', err)
    res.status(500).json({ error: 'Failed to load first aid data' })
  }
})

export default router
