import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// --- RENDERIZAÇÃO DA APLICAÇÃO ---

// Localiza o elemento HTML com o id 'root' no arquivo public/index.html.
const rootElement = document.getElementById('root');
// Cria a "raiz" da aplicação React dentro do elemento HTML encontrado.
const root = createRoot(rootElement);
// Renderiza (desenha) o componente principal <App /> dentro da raiz.
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);