import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDB } from './db/database.js'
import waitTimesRouter from './routes/waitTimes.js'
import translateRouter from './routes/translate.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Initialise SQLite Database
initDB()

// Routes
app.use('/api/wait-times', waitTimesRouter)
app.use('/api/translate', translateRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
  console.log(`\n============== ClinicPlus API ==============`)
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`============================================\n`)
})
