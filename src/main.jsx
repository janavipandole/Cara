import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const redirect = sessionStorage.redirect
delete sessionStorage.redirect
if (redirect && redirect !== location.pathname) {
  history.replaceState(null, '', redirect)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
