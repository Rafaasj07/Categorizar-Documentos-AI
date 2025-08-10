# Categorizar Documentos AI (Em Desenvolvimento)

Este projeto utiliza a Inteligência Artificial generativa da AWS (Amazon Bedrock com o modelo Claude 3 Haiku) para analisar, categorizar e extrair metadados de múltiplos documentos PDF de forma automatizada.

## Link da Aplicação

A aplicação está disponível para teste no seguinte endereço:

**[https://categorizar-documentos-ai-1.onrender.com/](https://categorizar-documentos-ai-1.onrender.com/)**

## Funcionalidades Principais

-   **Upload em Lote:** Envie até 10 arquivos PDF de uma vez, com um limite de 5MB por arquivo.
-   **Análise com IA:** Cada documento é processado para extrair automaticamente:
    -   Uma **categoria** (ex: Contrato, Relatório, Fatura).
    -   **Metadados** como título, autor, data, palavras-chave e um resumo.
-   **Busca e Filtro:** Uma página de busca permite visualizar todos os documentos processados, com a possibilidade de filtrar os resultados por nome, categoria ou conteúdo do resumo.
-   **Download Seguro:** Baixe qualquer documento diretamente da interface. Os links são gerados de forma segura e temporária.
-   **Interface Responsiva:** O layout se adapta para uma experiência de uso agradável tanto em desktops quanto em dispositivos móveis.

## Arquitetura e Tecnologias

O projeto é um monorepo dividido em duas partes principais: `Interface` (frontend) e `API` (backend).

#### Frontend (`Interface`)

-   **React (Vite):** Biblioteca para a construção da interface de usuário com um ambiente de desenvolvimento rápido.
-   **Tailwind CSS:** Framework de estilização para um design ágil e responsivo.
-   **Axios:** Cliente HTTP para a comunicação segura com o backend.

#### Backend (`API`)

-   **Node.js & Express:** Ambiente e framework para a construção da API REST.
-   **Multer:** Middleware para gerenciar o upload dos arquivos.
-   **AWS SDK v3:** Para integração com os serviços da Amazon Web Services.
    -   **Amazon S3:** Armazenamento seguro dos arquivos PDF originais.
    -   **Amazon Textract:** Extração do texto bruto dos documentos PDF.
    -   **Amazon Bedrock (Claude 3 Haiku):** Análise do texto extraído para categorização e extração de metadados.
    -   **Amazon DynamoDB:** Banco de dados NoSQL para armazenar os metadados e a localização dos arquivos no S3.

## Como Rodar Localmente

### Pré-requisitos

-   **Node.js:** Versão 18 ou superior.
-   **NPM ou Yarn.**
-   **Credenciais da AWS:** Um usuário IAM com permissões programáticas para S3, Textract, Bedrock e DynamoDB.

---

### 1. Configurando e Rodando o Backend (API)

1.  **Navegue até a pasta da API:**
    ```bash
    cd API
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Crie o arquivo de ambiente:**
    Crie um arquivo chamado `.env` na raiz da pasta `API` e preencha com suas credenciais e nomes de recursos da AWS. Use o arquivo `.env.example` como guia.

4.  **Inicie o servidor:**
    ```bash
    npm run dev
    ```
    O servidor estará rodando em `http://localhost:3001`.

---

### 2. Configurando e Rodando o Frontend (Interface)

1.  **Abra um novo terminal.**
2.  **Navegue até a pasta da Interface:**
    ```bash
    cd Interface
    ```
3.  **Instale as dependências:**
    ```bash
    npm install
    ```
4.  **Crie o arquivo de ambiente:**
    Crie um arquivo chamado `.env` na raiz da pasta `Interface` e aponte para a URL da sua API local.
    ```env
    VITE_API_URL=http://localhost:3001/api/
    ```
5.  **Inicie a aplicação:**
    ```bash
    npm run dev
    ```
    A aplicação estará acessível em `http://localhost:5173` (ou outra porta indicada pelo Vite).