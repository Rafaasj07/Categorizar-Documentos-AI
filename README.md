# Readme do Projeto: Evolução e Estado Atual

Este documento descreve as modificações arquitetônicas e funcionais aplicadas ao projeto **Categorizar Documentos AI**, detalhando o que foi mantido da estrutura original, o que foi descartado da versão de testes com EDA e o que foi adicionado para criar a versão atual e estável.

## Resumo da Evolução

O projeto passou por uma fase de experimentação com uma Arquitetura Orientada a Eventos (EDA) utilizando AWS Lambda e API Gateway. No entanto, para simplificar o desenvolvimento e garantir a estabilidade, tomou-se a decisão de reverter para a **arquitetura monolítica original**, mais robusta e testada, e enriquecê-la com o sistema de autenticação moderno que havia sido desenvolvido separadamente.

Em suma, a versão atual é uma fusão do **backend monolítico do projeto "Antigo"** com o **sistema de autenticação via Cognito do projeto "Atual"**.

---

## O Que Foi Mantido (Base do Projeto "Antigo")

A fundação do projeto continua sendo a arquitetura monolítica original, que se mostrou eficaz e mais simples de gerenciar no ambiente de desenvolvimento atual.

* **Backend Monolítico com Node.js/Express:** Toda a lógica de negócio permanece centralizada em um único servidor Express.js (`API/server.js`).
* **Serviços AWS via SDK:** A comunicação com os serviços da AWS (S3, DynamoDB, Bedrock, Textract) continua a ser gerenciada diretamente pelo backend através do AWS SDK v3, conforme implementado nos arquivos de serviço (`API/src/services/...`).
* **Fluxo de Análise de Documentos:** A lógica principal para upload, extração de texto, análise com IA e armazenamento de metadados (`API/src/controllers/documentoController.js`) foi integralmente preservada.
* **Estrutura do Frontend em React + Vite:** A interface do usuário (`Interface`) continua sendo uma aplicação React construída com Vite, mantendo a estrutura de componentes e a estilização com Tailwind CSS.

---

## O Que Foi Descartado (Funcionalidades da Versão "Atual" com EDA)

Para focar na estabilidade e na funcionalidade principal, os seguintes elementos da arquitetura experimental foram removidos:

* **Arquitetura Serverless:** O uso de funções AWS Lambda como resolvedores de rotas e o Amazon API Gateway como ponto de entrada foram completamente descartados. O projeto não depende mais de uma implantação serverless para funcionar.
* **Comunicação Direta Frontend -> AWS (para upload):** O fluxo onde o frontend obtinha uma URL pré-assinada do API Gateway para fazer upload direto para o S3 foi removido. O upload agora é gerenciado pelo backend monolítico.
* **Login Fixo (Hardcoded):** O sistema de login original do projeto "Antigo", que utilizava usuários e senhas fixos no código (`Interface/src/pages/Login.jsx`), foi completamente substituído.

---

## O Que Foi Adicionado e Modificado (Integração do Cognito)

A principal melhoria foi a substituição do sistema de login simples por uma solução completa e segura de gerenciamento de identidade, portada da versão "Atual".

* **Autenticação com AWS Cognito:**
    * **Novas Dependências:** Foram adicionadas as bibliotecas do `aws-amplify` ao `package.json` do frontend.
    * **Configuração do Amplify:** Foi criado o arquivo `aws-exports.js` para conectar o frontend ao User Pool do Cognito.
    * **Contexto de Autenticação (`AuthContext.jsx`):** Um novo provedor de contexto foi implementado para gerenciar o estado de autenticação (usuário, role, status de login) em toda a aplicação, de forma reativa e centralizada.
    * **Serviço de Autenticação (`authService.js`):** As chamadas à SDK do Amplify para login, cadastro e confirmação foram abstraídas em um serviço dedicado.

* **Atualização da Interface:**
    * **Nova Página de Login:** O componente `Login.jsx` foi substituído pela versão do Cognito, que inclui fluxos para cadastro, confirmação de conta e redefinição de senha.
    * **Rotas Protegidas (`ProtectedRoute.jsx`):** O componente foi refatorado para usar o `useAuth` hook, protegendo as rotas com base no estado de autenticação do Cognito em vez do `localStorage`.
    * **Navegação Inteligente (`NavPadrao.jsx` e `NavInferior.jsx`):** Os componentes de navegação agora utilizam o `useAuth` hook para exibir/ocultar links de acordo com o papel (role) do usuário e para executar a função de logout.
    * **Envio de Token JWT:** O serviço `api.js` foi modificado com um interceptor do Axios para anexar automaticamente o token de autenticação do Cognito em todas as requisições ao backend, garantindo que a comunicação seja segura.