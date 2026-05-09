import { useState } from 'react'
import { AppLayout } from '@/layouts/AppLayout'
import { HomePage } from '@/pages/HomePage'
import type { AppView } from '@/types/navigation'

function App() {
  const [activeView, setActiveView] = useState<AppView>('pedidos')

  return (
    <AppLayout activeView={activeView} onNavigate={setActiveView}>
      <HomePage activeView={activeView} onNavigate={setActiveView} />
    </AppLayout>
  )
}

export default App
