import express from 'express'
import db from '../db/database.js'
import crypto from 'crypto'

const router = express.Router()

// GET /api/journal — fetch all entries, newest first
router.get('/', (req, res) => {
  try {
    const entries = db.prepare(
      'SELECT * FROM journal_entries ORDER BY date DESC, createdAt DESC'
    ).all()
    res.json(entries)
  } catch (err) {
    console.error('Journal GET error:', err)
    res.status(500).json({ error: 'Failed to fetch journal entries' })
  }
})

// GET /api/journal/:id — fetch single entry
router.get('/:id', (req, res) => {
  try {
    const entry = db.prepare('SELECT * FROM journal_entries WHERE id = ?').get(req.params.id)
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' })
    }
    res.json(entry)
  } catch (err) {
    console.error('Journal GET/:id error:', err)
    res.status(500).json({ error: 'Failed to fetch journal entry' })
  }
})

// POST /api/journal — create new entry
router.post('/', (req, res) => {
  const { date, facility, service, doctor, diagnosis, prescriptions, nextDate, notes } = req.body

  if (!date || !facility || !service) {
    return res.status(400).json({ error: 'date, facility, and service are required' })
  }

  try {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const stmt = db.prepare(`
      INSERT INTO journal_entries (id, date, facility, service, doctor, diagnosis, prescriptions, nextDate, notes, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(id, date, facility, service, doctor || '', diagnosis || '', prescriptions || '', nextDate || '', notes || '', now, now)

    const entry = db.prepare('SELECT * FROM journal_entries WHERE id = ?').get(id)
    res.status(201).json(entry)
  } catch (err) {
    console.error('Journal POST error:', err)
    res.status(500).json({ error: 'Failed to create journal entry' })
  }
})

// PUT /api/journal/:id — update existing entry
router.put('/:id', (req, res) => {
  const { date, facility, service, doctor, diagnosis, prescriptions, nextDate, notes } = req.body

  if (!date || !facility || !service) {
    return res.status(400).json({ error: 'date, facility, and service are required' })
  }

  try {
    const existing = db.prepare('SELECT * FROM journal_entries WHERE id = ?').get(req.params.id)
    if (!existing) {
      return res.status(404).json({ error: 'Entry not found' })
    }

    const now = new Date().toISOString()
    const stmt = db.prepare(`
      UPDATE journal_entries
      SET date = ?, facility = ?, service = ?, doctor = ?, diagnosis = ?, prescriptions = ?, nextDate = ?, notes = ?, updatedAt = ?
      WHERE id = ?
    `)

    stmt.run(date, facility, service, doctor || '', diagnosis || '', prescriptions || '', nextDate || '', notes || '', now, req.params.id)

    const entry = db.prepare('SELECT * FROM journal_entries WHERE id = ?').get(req.params.id)
    res.json(entry)
  } catch (err) {
    console.error('Journal PUT error:', err)
    res.status(500).json({ error: 'Failed to update journal entry' })
  }
})

// DELETE /api/journal/:id — delete entry
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM journal_entries WHERE id = ?').get(req.params.id)
    if (!existing) {
      return res.status(404).json({ error: 'Entry not found' })
    }

    db.prepare('DELETE FROM journal_entries WHERE id = ?').run(req.params.id)
    res.json({ success: true, message: 'Entry deleted' })
  } catch (err) {
    console.error('Journal DELETE error:', err)
    res.status(500).json({ error: 'Failed to delete journal entry' })
  }
})

export default router
