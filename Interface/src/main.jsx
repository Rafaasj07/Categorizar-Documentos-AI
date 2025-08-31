// Importa o 'StrictMode' do React, que ajuda a identificar potenciais problemas na aplicação.
import { StrictMode } from 'react';
// Importa a função 'createRoot', que é a nova forma de renderizar a aplicação React.
import { createRoot } from 'react-dom/client';
// Importa o componente principal da aplicação.
import App from './App';
// Importa o arquivo de estilos CSS principal.
import './index.css';

// Importa a biblioteca principal do AWS Amplify.
import { Amplify } from 'aws-amplify';
// Importa o arquivo de configuração que conecta o frontend com os serviços da AWS.
import awsExports from './aws-exports.js';

// Configura o Amplify com as informações do backend (como Cognito, API, etc.).
Amplify.configure(awsExports);

// Localiza o elemento HTML com o id 'root', que servirá como o container da aplicação.
const root = createRoot(document.getElementById('root'));

// Renderiza o componente principal '<App />' dentro do container 'root'.
// O 'StrictMode' envolve a aplicação para ativar verificações e avisos adicionais do React.
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);