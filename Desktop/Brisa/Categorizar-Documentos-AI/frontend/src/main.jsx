import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Cria o "root" apontando para a div #root no index.html
const root = createRoot(document.getElementById('root'));

// Renderiza a aplicação dentro do StrictMode
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
