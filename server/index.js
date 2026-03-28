import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDB } from './db/database.js'
import waitTimesRouter from './routes/waitTimes.js'
import translateRouter from './routes/translate.js'
import journalRouter from './routes/journal.js'
import firstAidRouter from './routes/firstAid.js'
import hospitalServicesRouter from './routes/hospitalServices.js'
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '1mb' }))

initDB()

// --- API Routes ---
app.use('/api/wait-times', waitTimesRouter)
app.use('/api/translate', translateRouter)
app.use('/api/journal', journalRouter)
app.use('/api/first-aid', firstAidRouter)
app.use('/api/hospital-services', hospitalServicesRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    endpoints: [
      'GET  /api/health',
      'GET  /api/wait-times',
      'POST /api/wait-times',
      'POST /api/translate',
      'POST /api/translate/batch',
      'GET  /api/journal',
      'GET  /api/journal/:id',
      'POST /api/journal',
      'PUT  /api/journal/:id',
      'DELETE /api/journal/:id',
      'GET  /api/first-aid',
      'GET  /api/first-aid/:id',
      'GET  /api/hospital-services',
      'GET  /api/hospital-services/:id',
    ]
  })
})

app.use(notFoundHandler)
app.use(globalErrorHandler)

app.listen(PORT, () => {
  console.log(`\n============== ClinicPlus API ==============`)
  console.log(`  Server running on http://localhost:${PORT}`)
  console.log(`  Health check:  http://localhost:${PORT}/api/health`)
  console.log(`============================================\n`)
})
