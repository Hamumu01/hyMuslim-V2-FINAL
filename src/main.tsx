import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 60 * 60 * 1000, // 1 hour
      refetchOnWindowFocus: false,
    }
  }
})

// Handle PWA lifecycle is now handled in App.tsx

// Create root and handle errors
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Root element not found! Make sure there is a div with id="root" in index.html');
  const errorDiv = document.createElement('div');
  errorDiv.textContent = 'Application Error: Could not find root element. Please check your HTML.';
  document.body.appendChild(errorDiv);
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  );
}
