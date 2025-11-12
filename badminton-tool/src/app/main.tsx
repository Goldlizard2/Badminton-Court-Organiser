import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { PlayersProvider } from './context/PlayersContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PlayersProvider>
      <App />
    </PlayersProvider>
  </StrictMode>,
)
