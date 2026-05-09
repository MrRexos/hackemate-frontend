import { AppLayout } from '@/layouts/AppLayout'
import { HomePage } from '@/pages/HomePage'
import { TruckDetailsPage } from '@/pages/TruckDetailsPage'
import { Navigate, Route, Routes } from 'react-router-dom'

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route element={<HomePage />} path="/" />
        <Route element={<TruckDetailsPage />} path="/camio/:codi" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </AppLayout>
  )
}

export default App
