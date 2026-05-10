import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/global.css'
import App from './App.tsx'
import { camions } from './data/camions'
import { inicialitzarFlotaDesExcel } from './services/fleetBootstrap'

async function arranc() {
  try {
    const res = await inicialitzarFlotaDesExcel(camions)
    if (import.meta.env.DEV && res.rutesSenseCamioDisponible.length > 0) {
      console.warn(
        '[fleet] Rutes sense camió lliure:',
        res.rutesSenseCamioDisponible.map((r) => r.id),
      )
    }
  } catch (e) {
    console.error('[fleet] Error inicialitzant rutes Excel / assignació:', e)
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  )
}

void arranc()
