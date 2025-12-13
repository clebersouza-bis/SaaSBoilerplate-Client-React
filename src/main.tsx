// main.tsx - VERSÃO ATUALIZADA
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { App } from './app/App';
import './lib/i18n/config';
import './styles/globals.css';

// Initialize theme before app loads
const initializeTheme = () => {
  // Check for saved theme or system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (!savedTheme && prefersDark) {
    document.documentElement.classList.add('dark');
  }
};

initializeTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);