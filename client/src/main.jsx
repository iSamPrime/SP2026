import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { io } from 'socket.io-client'

const socketIo = io()


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App socketIo = {socketIo}/>
  </StrictMode>
)


