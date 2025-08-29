import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Importações da AWS para configuração
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports.js';

// Configura o Amplify com as informações do backend (Cognito)
Amplify.configure(awsExports);

// Localiza o elemento root no HTML para renderizar a aplicação
const root = createRoot(document.getElementById('root'));

// Renderiza o componente principal <App />
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);