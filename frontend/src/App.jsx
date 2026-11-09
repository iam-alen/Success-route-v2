import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import CareerAdvice from './pages/CareerAdvice'
import Roadmap from './pages/Roadmap'
import Resume from './pages/Resume'

// Pages inside this wrapper need a logged-in user
function Protected() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/signin" replace />
  return (
    <>
      <Navbar />
      <main className="page">
        <Outlet />
      </main>
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<AuthPage mode="signin" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />
      <Route element={<Protected />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/advice" element={<CareerAdvice />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/resume" element={<Resume />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
