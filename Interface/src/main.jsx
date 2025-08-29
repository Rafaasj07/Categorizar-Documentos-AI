import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Importações da AWS
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports.js';

// Configura o Amplify com as informações do backend
Amplify.configure(awsExports);

const root = createRoot(document.getElementById('root'));

// Renderiza a aplicação
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);