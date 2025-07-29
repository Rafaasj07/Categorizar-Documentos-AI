// Importa o StrictMode do React para ajudar a identificar problemas no app durante o desenvolvimento
import { StrictMode } from 'react';

// Importa a função para criar a raiz do React na DOM (React 18+)
import { createRoot } from 'react-dom/client';

// Importa o arquivo de estilos global
import './index.css';

// Importa o componente principal da aplicação
import App from './App.jsx';

// Seleciona o elemento HTML onde o React vai montar a aplicação (div com id 'root')
const container = document.getElementById('root');

// Cria a raiz do React a partir do container selecionado
const root = createRoot(container);

// Renderiza o componente <App /> dentro do StrictMode para ativar verificações extras no desenvolvimento
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
