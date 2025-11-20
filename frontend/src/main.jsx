import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Inicializa a raiz da aplicação vinculada ao elemento DOM
const root = createRoot(document.getElementById('root'));

// Renderiza a estrutura principal da aplicação
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);