# Categorizar Documentos AI

Este projeto utiliza a Inteligência Artificial generativa da AWS (Amazon Bedrock com o modelo Claude 3 Haiku) para analisar, categorizar e extrair metadados de múltiplos documentos PDF de forma automatizada. A aplicação conta com um sistema de autenticação robusto via **Amazon Cognito**, com suporte a múltiplos usuários e controle de acesso baseado em papéis.

## Funcionalidades Principais

  - **Autenticação de Usuários:** Sistema completo de login e cadastro com AWS Cognito, incluindo confirmação de conta e redefinição de senha.
  - **Controle de Acesso:** Papéis de `usuário` (pode categorizar e buscar seus próprios documentos) e `admin` (gerencia todos os documentos do sistema).
  - **Upload em Lote:** Envie até 10 arquivos PDF de uma vez, com um limite de 5MB por arquivo.
  - **Análise com IA:** Cada documento é processado para extrair automaticamente:
      - Uma **categoria** (ex: Contrato, Relatório, Fatura).
      - **Metadados** como título, autor, data, palavras-chave e um resumo.
  - **Busca e Filtro:** Uma página de busca permite visualizar todos os documentos processados, com a possibilidade de filtrar os resultados por nome, categoria ou conteúdo do resumo.
  - **Download Seguro:** Baixe qualquer documento diretamente da interface através de links temporários.
  - **Interface Responsiva:** O layout se adapta para uma experiência de uso agradável tanto em desktops quanto em dispositivos móveis.

## Arquitetura e Tecnologias

O projeto é um monorepo dividido em `Interface` (frontend) e `API` (backend), operando em uma arquitetura monolítica.

#### Frontend (`Interface`)

  - **React (Vite):** Biblioteca para a construção da interface de usuário.
  - **AWS Amplify SDK:** Para integração com o Amazon Cognito.
  - **Tailwind CSS:** Framework de estilização para um design ágil e responsivo.
  - **Axios:** Cliente HTTP para a comunicação com o backend.

#### Backend (`API`)

  - **Node.js & Express:** Ambiente e framework para a construção da API REST.
  - **AWS SDK v3:** Para integração com os serviços da AWS:
      - **Amazon S3:** Armazenamento dos arquivos PDF.
      - **Amazon Textract:** Extração do texto dos documentos.
      - **Amazon Bedrock (Claude 3 Haiku):** Análise do texto para categorização e extração de metadados.
      - **Amazon DynamoDB:** Banco de dados NoSQL para armazenar os metadados.

## Como Rodar Localmente

### Pré-requisitos

  - **Node.js:** Versão 18 ou superior.
  - **NPM ou Yarn.**
  - **Credenciais da AWS:** Um usuário IAM com permissões programáticas para S3, Textract, Bedrock e DynamoDB.
  - **Conta na AWS:** Um **User Pool do Cognito** configurado.

-----

### 1\. Configurando e Rodando o Backend (API)

1.  **Navegue até a pasta da API:**

    ```bash
    cd API
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    ```

3.  **Crie o arquivo de ambiente (`.env`):**
    Use o arquivo `.env.example` como guia para criar seu arquivo `.env` com suas credenciais e nomes de recursos da AWS.

4.  **Inicie o servidor:**

    ```bash
    npm run dev
    ```

    O servidor estará rodando em `http://localhost:3001`.

-----

### 2\. Configurando e Rodando o Frontend (Interface)

1.  **Abra um novo terminal e navegue até a pasta da Interface:**
    ```bash
    cd Interface
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Crie o arquivo de configuração do Amplify (`aws-exports.js`)** na pasta `src` com os dados do seu User Pool do Cognito.
4.  **Crie o arquivo de ambiente (`.env`):**
    Na raiz da pasta `Interface`, crie o arquivo e aponte para a URL da sua API local:
    ```env
    VITE_API_URL=http://localhost:3001/api/
    ```
5.  **Inicie a aplicação:**
    ```bash
    npm run dev
    ```
    A aplicação estará acessível em `http://localhost:5173`.

-----

## Histórico e Evolução do Projeto

O projeto passou por uma fase de experimentação com uma Arquitetura Orientada a Eventos (EDA). No entanto, para simplificar o desenvolvimento e garantir a estabilidade, a decisão foi reverter para a **arquitetura monolítica original** e enriquecê-la com o sistema de autenticação via Cognito. A versão atual é, portanto, uma fusão do backend monolítico do projeto "Antigo" com o sistema de autenticação do projeto "Atual".