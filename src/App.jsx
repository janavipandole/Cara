import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useEffect } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Contact from './pages/Contact'
import Services from './pages/Services'
import CaseStudy from './pages/CaseStudy'
import Projects from './pages/Projects'

function RedirectHandler() {
  const navigate = useNavigate()
  const location = useLocation()
  useEffect(() => {
    const redirect = sessionStorage.redirect
    delete sessionStorage.redirect
    if (redirect) {
      const base = '/React-Project'
      const path = redirect.startsWith(base) ? redirect.slice(base.length) : redirect
      if (path && path !== location.pathname) {
        navigate(path, { replace: true })
      }
    }
  }, [])
  return null
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <RedirectHandler />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<Services />} />
          <Route path="/casestudy" element={<CaseStudy />} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
