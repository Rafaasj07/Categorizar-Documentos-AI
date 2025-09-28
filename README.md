# 📂 Categorizador de Documentos com IA

Este projeto utiliza **Inteligência Artificial Generativa** (rodando localmente com Ollama e o modelo Llama 3) para **analisar, categorizar e extrair metadados de documentos PDF** de forma automatizada e eficiente. A aplicação conta com um sistema de autenticação próprio, baseado em JWT, com suporte a múltiplos usuários e controle de acesso por papéis.

A arquitetura foi projetada para ser executada em um ambiente de desenvolvimento local com Docker, utilizando um pipeline otimizado de processamento de documentos que combina extração de texto/imagens com `pdfjs-dist` e OCR (Reconhecimento Óptico de Caracteres) com Tesseract.

## ✨ Funcionalidades Principais

  * 🔑 **Autenticação Própria com JWT**

      * Sistema completo de cadastro e login de usuários.
      * As senhas são armazenadas de forma segura no banco de dados usando criptografia `bcryptjs`.
      * O acesso às rotas protegidas é controlado via JSON Web Tokens (JWT), garantindo que apenas usuários autenticados possam interagir com a API.

  * 🛡 **Controle de Acesso por Papel (Role)**

      * Perfis de `user` e `admin` com permissões distintas. Usuários podem categorizar e buscar seus documentos, enquanto administradores gerenciam todos os arquivos do sistema.
      * O sistema cria automaticamente um usuário `admin` e um `user` no primeiro login para facilitar os testes.

  * 📤 **Upload de Documentos em Lote**

      * Envio de até **10 arquivos PDF** simultaneamente, com validação de tamanho (máx. 5MB por arquivo) e quantidade.

  * 🤖 **Análise Híbrida com IA Local**

      * Cada documento passa por um pipeline de processamento otimizado no backend:
        1.  **Extração de Conteúdo**: O texto e as imagens são extraídos de cada página do PDF usando `pdfjs-dist`.
        2.  **OCR com Tesseract**: O Tesseract é aplicado nas imagens extraídas para converter conteúdo visual em texto.
        3.  **Análise Generativa**: O texto consolidado é enviado ao **Ollama (com o modelo Llama 3)** para extrair a **categoria** e **metadados relevantes** como título, autor, data, palavras-chave e um resumo.

  * 🖥 **Painel de Administração Simplificado**

      * Interface para administradores visualizarem todos os documentos do sistema, com ferramentas para **busca, filtro e exclusão em lote**.

  * 🔎 **Busca e Filtros Avançados**

      * Pesquisa de documentos por **nome do arquivo, categoria ou conteúdo do resumo**.
      * Opções para **ordenar** os resultados por data e **paginação** para facilitar a navegação.

  * 🔒 **Armazenamento e Download Seguro de Documentos**

      * Os arquivos são armazenados de forma segura no **MinIO**.
      * Geração de links de download temporários e protegidos (pré-assinados).

  * 📱 **Interface Totalmente Responsiva**

      * Layout projetado com **Tailwind CSS**, adaptável para uma experiência de uso consistente em desktops e dispositivos móveis.

-----

## 🏗 Arquitetura e Tecnologias

O projeto é estruturado como um monorepo, dividido em `frontend` e `backend`, com todos os serviços orquestrados via `docker-compose`.

### Frontend (`frontend`)

  * ⚛️ **React (Vite)** — Biblioteca para a construção da interface de usuário.
  * 🎨 **Tailwind CSS** — Framework para estilização moderna e responsiva.
  * 🔐 **React Context API** — Para gerenciamento do estado de autenticação de forma global na aplicação.
  * 🌐 **Axios** — Cliente HTTP para comunicação com a API, com interceptor para adicionar o token de autenticação.
  * 🔄 **React Router** — Para gerenciamento de rotas e navegação.

### Backend (`backend`)

  * 🟢 **Node.js & Express** — Plataforma e framework para a construção da API REST.
  * 🐋 **Docker Compose** — Orquestra todos os serviços de backend (API, MinIO, MongoDB, Ollama).
  * 🔐 **JWT & BcryptJS** — Para gerar tokens de autenticação seguros e criptografar senhas de usuários.
  * 💾 **MinIO** — Armazenamento de objetos para os arquivos PDF.
  * 📄 **MongoDB** — Banco de dados NoSQL para persistir os metadados dos documentos e as informações dos usuários.
  * 🤖 **Ollama (Llama 3)** — Serviço para rodar o modelo de linguagem localmente.
  * ✍️ **node-tesseract-ocr** — Biblioteca para realizar OCR em imagens extraídas dos PDFs.
  * 📑 **pdfjs-dist & canvas** — Bibliotecas para processar e extrair o conteúdo de arquivos PDF.

-----

## ⚙️ Como Rodar Localmente

### 🔧 Pré-requisitos

  * **Docker** e **Docker Compose** instalados.
  * **Node.js v18+**.
  * **NPM** ou **Yarn**.

### 🚀 Passo 1: Iniciar os Serviços de Backend com Docker

1.  **Navegue até a raiz do projeto** no seu terminal:
    ```bash
    cd Categorizar-Documentos-AI
    ```
2.  **Suba todos os containers**:
    ```bash
    docker-compose up --build
    ```
      * A primeira execução pode demorar, pois o Docker precisará baixar as imagens. Deixe este terminal aberto para ver os logs.

### 🤖 Passo 2: Configurar o Modelo de IA no Ollama

1.  **Abra um novo terminal**.
2.  **Execute o comando** para baixar o modelo `llama3` no container do Ollama:
    ```bash
    docker exec -it ollama ollama pull llama3
    ```
3.  Aguarde a conclusão do download.

### 🎨 Passo 3: Configurar e Iniciar o Frontend

1.  **Configure as variáveis de ambiente**:
      * Na pasta `frontend`, verifique se o arquivo `.env` existe com o seguinte conteúdo:
        ```env
        VITE_API_URL=http://localhost:3001/api/
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

### ✅ Passo 4: Acesse a Aplicação

  * Abra seu navegador e acesse **`http://localhost:5173`**.
  * O sistema criará dois usuários padrão na primeira vez que o servidor iniciar. Você pode usá-los para testar:
      * **Administrador**:
          * **Usuário**: `admin`
          * **Senha**: `admin`
      * **Usuário Comum**:
          * **Usuário**: `user`
          * **Senha**: `user`
  * Você também pode criar novas contas através da página de cadastro.