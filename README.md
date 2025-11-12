# G01-GoLedger

## Equipe

| Nome     | GitHub                                                 |
| :------- | :----------------------------------------------------- |
| Eduarda  | [@EduardaCCampos](https://github.com/EduardaCCampos)   |
| Fábio    | [@fabiosodremat](https://github.com/fabiosodremat)     |
| Flávia   | [@flavirosadolima](https://github.com/flavirosadolima) |
| Gilvan   | [@Gilvan-pro](https://github.com/Gilvan-pro)           |
| Rafael Augusto | [@Rafaasj07](https://github.com/Rafaasj07)       |

## 🗂️ Artefatos (Drive)

Todos os documentos, atas, diagramas e relatórios do grupo estão disponíveis no Google Drive oficial do projeto:

🔗 **Acesse aqui:** [Pasta G01-GoLedger no Google Drive](https://drive.google.com/drive/folders/1lm-dzjdQkykmR-7wladXBhUGkrSa5wtj?usp=sharing)

-----

## 📂 Visão Geral da Solução

Este projeto utiliza **Inteligência Artificial Generativa** (através da plataforma **OpenRouter**) para **analisar, categorizar e extrair metadados de documentos PDF** de forma automatizada e eficiente. A aplicação conta com um sistema de autenticação próprio, baseado em JWT, com suporte a múltiplos usuários e controle de acesso por papéis.

A arquitetura foi projetada para ser executada em um ambiente de desenvolvimento local com Docker, utilizando um pipeline otimizado de processamento de documentos que combina extração de texto/imagens com `pdfjs-dist` e OCR (Reconhecimento Óptico de Caracteres) com Tesseract.

-----

## ✨ Funcionalidades Principais

* 🔑 **Autenticação Própria com JWT**: Sistema completo de cadastro e login (`bcryptjs`, `jsonwebtoken`).
* 🛡 **Controle de Acesso por Papel (Role)**: Perfis de `user` (upload/busca) e `admin` (gerenciamento total).
* 📤 **Upload de Documentos em Lote**: Envio de até 10 arquivos PDF simultaneamente.
* 🤖 **Análise Híbrida com IA na Nuvem**: Pipeline de processamento com `pdfjs-dist` (texto), OCR (`node-tesseract-ocr` para imagens) e **Análise Generativa** com **OpenRouter** para extração de metadados. Inclui correção de encoding em nomes de arquivos.
* 🎯 **Contextos de Análise Específicos**: Seleção de contexto no frontend (Padrão, Nota Fiscal, etc.) para direcionar a IA com prompts otimizados.
* ↳ **Subcategorias Detalhadas**: Para "Gestão Educacional", o usuário pode selecionar o tipo específico (Diploma, Histórico, etc.), garantindo maior precisão.
* 🖥️ **Painel de Administração Completo**: Interface para administradores visualizarem, buscarem (com paginação e debounce) e gerenciarem todos os documentos.
* ✏️ **Edição de Metadados (Admin)**: Administradores podem corrigir ou editar o JSON bruto dos metadados extraídos pela IA diretamente pela interface.
* ⭐ **Sistema de Feedback**: Usuários podem avaliar a precisão da categorização (Ex: "Excelente", "Ruim"). Administradores podem visualizar o feedback agregado.
* 🔎 **Busca e Filtros Avançados**: Pesquisa por **nome do arquivo, categoria ou conteúdo do resumo**, com ordenação e paginação.
* 📄 **Visualização Detalhada (em Modal)**: Exibição rica dos metadados extraídos, com componentes de renderização específicos para cada categoria (Nota Fiscal, Diploma, SEI, etc.), disponível tanto na página de Busca quanto no painel Admin.
* 📥 **Download de Documentos e Metadados**: Download seguro do arquivo original (via **MinIO**) e também a opção de baixar um PDF formatado contendo apenas os metadados extraídos.
* 📱 **Interface Totalmente Responsiva**: Layout projetado com **Tailwind CSS**, adaptável para desktop e mobile.

-----

## 🏗 Arquitetura e Tecnologias

O projeto é estruturado como um monorepo, dividido em `frontend` e `backend`, orquestrado via `docker-compose`.

### Frontend (`frontend`)

* ⚛️ **React (Vite)**
* 🎨 **Tailwind CSS**
* 🔐 **React Context API** (para Autenticação)
* **React Router DOM** (para navegação)
* **jsPDF & jsPDF-AutoTable** (para gerar PDF de metadados)

### Backend (`backend`)

* 🟢 **Node.js & Express**
* 🐋 **Docker Compose** (Orquestra API, MinIO, MongoDB)
* 💾 **MinIO** (Armazenamento de objetos)
* 📄 **MongoDB** (com Mongoose)
* 🔐 **JWT & BcryptJS** (para Autenticação)
* 📤 **Multer** (para Uploads)
* 🤖 **OpenRouter** (Serviço de IA em nuvem)
* ✍️ **node-tesseract-ocr** (para OCR em imagens dentro dos PDFs)
* 📑 **pdfjs-dist & canvas** (para extração de texto e imagens de PDFs)

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
    * A primeira execução pode demorar. Deixe este terminal aberto para ver os logs.

### 🎨 Passo 2: Configurar e Iniciar o Frontend

1.  **Configure as variáveis de ambiente**:
    * Na pasta `frontend`, verifique se o arquivo `.env` existe com o seguinte conteúdo:
        ```env
        VITE_API_URL=http://localhost:3001/api/
        ```
    * Na pasta `backend`, crie um arquivo `.env` (se não existir, copie do `.env.example`) e adicione sua chave da OpenRouter:
        ```env
        OPENROUTER_API_KEY=sua-chave-aqui
        # Mantenha as outras variáveis como estão no .env.example
        JWT_SECRET=...
        CORS_ORIGIN=...
        MONGO_URI=...
        MINIO_BUCKET_NAME=...
        MINIO_ENDPOINT=...
        MINIO_PORT=...
        MINIO_USE_SSL=...
        MINIO_ACCESS_KEY=...
        MINIO_SECRET_KEY=...
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