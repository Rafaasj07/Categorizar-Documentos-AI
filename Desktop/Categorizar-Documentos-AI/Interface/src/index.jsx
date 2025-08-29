import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from "./App";
import './index.css';

// Importações do AWS Amplify
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports'; // Nosso arquivo de configuração

// 1. Configura o Amplify com as informações do seu backend
Amplify.configure(awsExports);

const root = createRoot(document.getElementById("root"));

// 2. Renderiza a aplicação. O AuthProvider correto já está dentro do App.jsx
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
