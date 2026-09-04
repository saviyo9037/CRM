import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './redux/store.js'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3, // 3 minutes fresh cache
      gcTime: 1000 * 60 * 15,    // 15 minutes garbage collection
      retry: 1,
      refetchOnWindowFocus: false,
      experimental_prefetchInRender: false,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />

        <Toaster position="top-right" reverseOrder={false} />
      </QueryClientProvider>
    </Provider>
  </BrowserRouter>
)
