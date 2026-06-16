import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import { FontScaleProvider } from './context/FontScaleContext';
import { apiGet } from './utils/api.js'

apiGet('users').then(data => console.log('Users:', data)).catch(err => console.error('API Error:', err))

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <FontScaleProvider>
        <App />
      </FontScaleProvider>
    </QueryClientProvider>
  </StrictMode>,
)
