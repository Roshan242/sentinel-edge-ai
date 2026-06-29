import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
// react-hot-toast removed to fix Vercel build (dependency not installed)


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
