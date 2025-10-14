# G01-GoLedger

## Equipe

| Nome | GitHub |
| :--- | :--- |
| Eduarda | [@EduardaCCampos](https://github.com/EduardaCCampos) |
| Fábio | [@fabiosodremat](https://github.com/fabiosodremat) |
| Flávia | [@flavirosadolima](https://github.com/flavirosadolima) |
| Gilvan | [GitHub ausente] |
| Rafael Augusto | [@Rafaasj07](https://github.com/Rafaasj07) |

-----

## 📂 Visão Geral da Solução

Este projeto utiliza **Inteligência Artificial Generativa** (através da plataforma **OpenRouter**) para **analisar, categorizar e extrair metadados de documentos PDF** de forma automatizada e eficiente. A aplicação conta com um sistema de autenticação próprio, baseado em JWT, com suporte a múltiplos usuários e controle de acesso por papéis.

A arquitetura foi projetada para ser executada em um ambiente de desenvolvimento local com Docker, utilizando um pipeline otimizado de processamento de documentos que combina extração de texto/imagens com `pdfjs-dist` e OCR (Reconhecimento Óptico de Caracteres) com Tesseract.

-----

## ✨ Funcionalidades Principais

  * 🔑 **Autenticação Própria com JWT**: Sistema completo de cadastro e login.
  * 🛡 **Controle de Acesso por Papel (Role)**: Perfis de `user` e `admin`.
  * 📤 **Upload de Documentos em Lote**: Envio de até 10 arquivos PDF simultaneamente.
  * 🤖 **Análise Híbrida com IA na Nuvem**: Pipeline de processamento com `pdfjs-dist`, OCR (Tesseract) e **Análise Generativa** com **OpenRouter** para extração de metadados e categoria.
  * 🖥 **Painel de Administração Simplificado**: Interface para administradores visualizarem todos os documentos.
  * 🔎 **Busca e Filtros Avançados**: Pesquisa por **nome do arquivo, categoria ou conteúdo do resumo**.
  * 🔒 **Armazenamento e Download Seguro de Documentos**: Arquivos armazenados no **MinIO**.
  * 📱 **Interface Totalmente Responsiva**: Layout projetado com **Tailwind CSS**.

-----

## 🏗 Arquitetura e Tecnologias

O projeto é estruturado como um monorepo, dividido em `frontend` e `backend`, orquestrado via `docker-compose`.

### Frontend (`frontend`)

  * ⚛️ **React (Vite)**
  * 🎨 **Tailwind CSS**
  * 🔐 **React Context API**

### Backend (`backend`)

  * 🟢 **Node.js & Express**
  * 🐋 **Docker Compose** (Orquestra API, MinIO, MongoDB)
  * 💾 **MinIO** (Armazenamento de objetos)
  * 📄 **MongoDB**
  * 🤖 **OpenRouter** (Serviço de IA em nuvem)
  * ✍️ **node-tesseract-ocr**
  * 📑 **pdfjs-dist & canvas**

-----

## ⚙️ Como Rodar Localmente

### 🔧 Pré-requisitos

  * **Docker** e **Docker Compose** instalados.
  * **Node.js v18+**.
  * **NPM** ou **Yarn**.

### 🚀 Passo 1: Iniciar os Serviços de Backend com Docker

1.  **Navegue até a raiz do projeto**:
    ```bash
    cd Categorizar-Documentos-AI
    ```
2.  **Suba todos os containers**:
    ```bash
    docker-compose up --build
    ```
      * A primeira execução pode demorar, pois o Docker precisará baixar as imagens. Deixe este terminal aberto para ver os logs.

### 🎨 Passo 2: Configurar e Iniciar o Frontend

1.  **Configure as variáveis de ambiente**:
      * Na pasta `frontend`, verifique se o arquivo `.env` existe com o seguinte conteúdo:
        ```env
        VITE_API_URL=http://localhost:3001/api/
        ```
      * Na pasta `backend`, crie um arquivo `.env` e adicione sua chave da OpenRouter:
        ```env
        OPENROUTER_API_KEY=sua-chave-aqui
        ```
2.  **Inicie o Frontend**:
      * Em um **novo terminal**, navegue até a pasta do frontend:
        ```bash
        cd frontend
        ```
      * Instale as dependências:
        ```bash
        npm install
        ```
      * Inicie o servidor de desenvolvimento:
        ```bash
        npm run dev
        ```

### ✅ Passo 3: Acesse a Aplicação

  * Abra seu navegador e acesse **`http://localhost:5173`**.
  * O sistema criará dois usuários padrão na primeira vez que o servidor iniciar. Você pode usá-los para testar:
      * **Administrador**:
          * **Usuário**: `admin`
          * **Senha**: `admin`
      * **Usuário Comum**:
          * **Usuário**: `user`
          * **Senha**: `user`
  * Você também pode criar novas contas através da página de cadastro.