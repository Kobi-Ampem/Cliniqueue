import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in environment variables')
  console.error('Get these from your Supabase project dashboard: https://supabase.com')
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '')

export async function initDB() {
  try {
    const { count, error } = await supabase
      .from('wait_reports')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Supabase connection check failed:', error.message)
      console.error('Make sure your tables are created. Run the SQL from supabase-schema.sql in the Supabase SQL Editor.')
      return
    }

    if (count === 0) {
      console.log('Seeding initial wait time data...')
      await seedWaitReports()
      console.log('Seeding complete')
    } else {
      console.log(`Database connected (${count} wait reports found)`)
    }
  } catch (err) {
    console.error('DB init error:', err.message)
  }
}

async function seedWaitReports() {
  const { default: facilities } = await import('../../frontend/src/data/facilities.json', { assert: { type: 'json' } })

  const rows = []
  for (const f of facilities) {
    for (const s of f.services) {
      rows.push({ facility_id: f.id, service: s.name, minutes: s.avgWaitMinutes + 10, time_of_day: 'morning' })
      rows.push({ facility_id: f.id, service: s.name, minutes: Math.max(5, s.avgWaitMinutes - 15), time_of_day: 'afternoon' })
      rows.push({ facility_id: f.id, service: s.name, minutes: s.avgWaitMinutes, time_of_day: 'morning' })
    }
  }

  const { error } = await supabase.from('wait_reports').insert(rows)
  if (error) console.error('Seed error:', error.message)
}

export default supabase
