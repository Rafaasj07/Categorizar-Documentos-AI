import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from "./App";
import './index.css';
import { AuthProvider } from "react-oidc-context";
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
// Configuração do Amplify - Setup do ambiente de authN


console.log('Objeto de configuração do Amplify recebido:', awsExports);
Amplify.configure(awsExports); // inicializa SDK com credenciais AWS

// Define a variável 'clientId' usando o valor de awsExports.
const clientId = awsExports.Auth.userPoolWebClientId;

// O endpoint da autoridade OIDC para o Cognito.
const authority = `https://cognito-idp.${awsExports.Auth.region}.amazonaws.com/${awsExports.Auth.userPoolId}`;

// O redirect_uri deve ser a URL atual da aplicação.
const redirectUri = window.location.origin;

// Usado para construir a URL de logout em AuthContext.
const cognitoHostedUIDomain = awsExports.Auth.Cognito.loginWith.oauth.domain;

// A configuração para o AuthProvider
const oidcConfig = {
  authority: authority, // O endpoint OIDC do Cognito
  client_id: clientId, // O Client ID do seu App Client
  redirect_uri: redirectUri, // A URL atual da sua aplicação
  response_type: "code", // Conforme seu aws-exports
  scope: awsExports.Auth.Cognito.loginWith.oauth.scopes.join(" "),
  post_logout_redirect_uri: redirectUri,
  // Adicionar outras configurações conforme necessário para o react-oidc-context (Ex: metadataUrl, userStore, etc)
};

// Passa o cognitoHostedUIDomain e clientId para o App consumido do awsExports, para uso na função de logout
const root = createRoot(document.getElementById("root"));

root.render(
  <StrictMode>
    {/* O AuthProvider do 'react-oidc-context' envolve a aplicação com AuthProvider,
        fornecendo as configs de autenticação OIDC. */}
    <AuthProvider {...oidcConfig}>
      {/* Renderização do componente principal da sua aplicação. */}
      <App />
    </AuthProvider>
  </StrictMode>
);
