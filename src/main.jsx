import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import { AuthProvider } from '@/context/AuthContext';

// Importação garantida do CSS (use uma das opções abaixo)
import '@/styles/main.css';       // Opção 1: com alias

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);