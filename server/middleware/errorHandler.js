export function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Not Found',
    message: `No route matches ${req.method} ${req.originalUrl}`,
  })
}

export function globalErrorHandler(err, req, res, _next) {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message)

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' })
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  })
}
