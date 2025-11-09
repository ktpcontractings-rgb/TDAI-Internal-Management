import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { trpc } from './lib/trpc'
import { Toaster } from 'sonner'
import CEODashboard from './pages/CEODashboard'
import { TrainerDashboard } from './pages/TrainerDashboard'
import { AgentChat } from './pages/AgentChat'
import { InvestorDemo } from './pages/InvestorDemo'
import './index.css'

function App() {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'https://tdai-internal-management.onrender.com',
        }),
      ],
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/demo" replace />} />
            <Route path="/demo" element={<InvestorDemo />} />
            <Route path="/sigma" element={<CEODashboard />} />
            <Route path="/trainer" element={<TrainerDashboard />} />
            <Route path="/chat/:agentId" element={<AgentChat />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </QueryClientProvider>
    </trpc.Provider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
