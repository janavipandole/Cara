import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()
    if (loading) return <div style={{ padding: 40, fontFamily: 'sans-serif' }}>Loading...</div>
    return user ? children : <Navigate to="/login" />
}

export default ProtectedRoute
