import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

const app = express()
const PORT = process.env.PORT || 8080

app.use(helmet())
app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Hero Infra Backend',
    version: '1.0.0'
  })
})

app.get('/api/info', (req, res) => {
  res.json({
    message: 'Hero Infra Backend está funcionando!',
    endpoints: [
      '/health - Status do serviço',
      '/api/info - Esta informação',
      '/api/services - Lista de serviços'
    ]
  })
})

app.get('/api/services', (req, res) => {
  res.json({
    services: [
      { name: 'Frontend', status: 'running', port: 3000 },
      { name: 'Backend', status: 'running', port: 8080 },
      { name: 'Database', status: 'running', port: 3306 },
      { name: 'Redis', status: 'running', port: 6379 }
    ]
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`)
  console.log(`📍 Health check: http://localhost:${PORT}/health`)
})
