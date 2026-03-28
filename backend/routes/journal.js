import express from 'express'
import supabase from '../db/database.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data || [])
  } catch (err) {
    console.error('Journal GET error:', err)
    res.status(500).json({ error: 'Failed to fetch journal entries' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'Entry not found' })
    }
    res.json(data)
  } catch (err) {
    console.error('Journal GET/:id error:', err)
    res.status(500).json({ error: 'Failed to fetch journal entry' })
  }
})

router.post('/', async (req, res) => {
  const { date, facility, service, doctor, diagnosis, prescriptions, nextDate, notes } = req.body

  if (!date || !facility || !service) {
    return res.status(400).json({ error: 'date, facility, and service are required' })
  }

  try {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        date,
        facility,
        service,
        doctor: doctor || '',
        diagnosis: diagnosis || '',
        prescriptions: prescriptions || '',
        next_date: nextDate || '',
        notes: notes || '',
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    console.error('Journal POST error:', err)
    res.status(500).json({ error: 'Failed to create journal entry' })
  }
})

router.put('/:id', async (req, res) => {
  const { date, facility, service, doctor, diagnosis, prescriptions, nextDate, notes } = req.body

  if (!date || !facility || !service) {
    return res.status(400).json({ error: 'date, facility, and service are required' })
  }

  try {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('journal_entries')
      .update({
        date,
        facility,
        service,
        doctor: doctor || '',
        diagnosis: diagnosis || '',
        prescriptions: prescriptions || '',
        next_date: nextDate || '',
        notes: notes || '',
        updated_at: now,
      })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'Entry not found' })
    }
    res.json(data)
  } catch (err) {
    console.error('Journal PUT error:', err)
    res.status(500).json({ error: 'Failed to update journal entry' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', req.params.id)

    if (error) throw error
    res.json({ success: true, message: 'Entry deleted' })
  } catch (err) {
    console.error('Journal DELETE error:', err)
    res.status(500).json({ error: 'Failed to delete journal entry' })
  }
})

export default router
