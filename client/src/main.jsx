import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import App from './App.jsx'
import Auth from './auth/auth.jsx'


/* 



createRoot(document.getElementById('auth')).render(
  <StrictMode>
    <Auth />
  </StrictMode>
)

*/


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)


