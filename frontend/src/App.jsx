import React from 'react'

function App() {
  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'system-ui, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          🚀 Hero Infra
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
          Frontend está funcionando perfeitamente!
        </p>
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '2rem', 
          borderRadius: '1rem',
          marginTop: '2rem',
          backdropFilter: 'blur(10px)'
        }}>
          <h2>Status do Sistema</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
              <div>✅ Frontend</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Online</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
              <div>🔄 Backend</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Conectando...</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
              <div>🗄️ Database</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Conectando...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
