import { AppLayout } from '@/layouts/AppLayout'
import { HomePage } from '@/pages/HomePage'
import { TruckDetailsPage } from '@/pages/TruckDetailsPage'
import { Navigate, Route, Routes } from 'react-router-dom'

function App() {
  return (
    <AppLayout>
      <div className="flex min-h-0 flex-1 flex-col">
        <Routes>
          <Route element={<HomePage />} path="/" />
          <Route element={<TruckDetailsPage />} path="/camio/:codi" />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </div>
    </AppLayout>
  )
}

export default App
