import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.tsx'

const root = document.getElementById('root')!
const normalizePath = (path: string) => path.replace(/\/$/, '') || '/'
const app = (
  <StrictMode>
    <App initialPath={window.location.pathname} />
  </StrictMode>
)

if (
  root.hasChildNodes()
  && normalizePath(root.dataset.prerenderedPath ?? '') === normalizePath(window.location.pathname)
) {
  hydrateRoot(root, app)
} else {
  root.replaceChildren()
  createRoot(root).render(app)
}
