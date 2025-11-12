# G01-GoLedger

## Equipe

| Nome     | GitHub                                                 |
| :------- | :----------------------------------------------------- |
| Eduarda  | [@EduardaCCampos](https://github.com/EduardaCCampos)   |
| Fábio    | [@fabiosodremat](https://github.com/fabiosodremat)     |
| Flávia   | [@flavirosadolima](https://github.com/flavirosadolima) |
| Gilvan   | [GitHub ausente]                                       |
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

  * 🔑 **Autenticação Própria com JWT**: Sistema completo de cadastro e login.
  * 🛡 **Controle de Acesso por Papel (Role)**: Perfis de `user` e `admin`.
  * 📤 **Upload de Documentos em Lote**: Envio de até 10 arquivos PDF simultaneamente.
  * 🤖 **Análise Híbrida com IA na Nuvem**: Pipeline de processamento com `pdfjs-dist`, OCR (Tesseract) e **Análise Generativa** com **OpenRouter** para extração de metadados e categoria.
  * 🎯 **Contextos de Análise Específicos**: Seleção de contexto no frontend (Padrão, Nota Fiscal, Gestão Educacional, Cartório, SEI) para direcionar a IA com prompts otimizados.
      * **Subcategorias Detalhadas**: Para Gestão Educacional, o usuário pode selecionar o tipo específico (Diploma, Histórico, etc.), garantindo maior precisão.
  * 🖥 **Painel de Administração Simplificado**: Interface para administradores visualizarem e gerenciarem todos os documentos.
  * 🔎 **Busca e Filtros Avançados**: Pesquisa por **nome do arquivo, categoria ou conteúdo do resumo**, com ordenação e paginação.
  * 📄 **Visualização Detalhada**: Exibição dos metadados extraídos tanto após a categorização quanto na página de busca (via modal).
  * 🔒 **Armazenamento e Download Seguro de Documentos**: Arquivos armazenados no **MinIO**.
  * 📱 **Interface Totalmente Responsiva**: Layout projetado com **Tailwind CSS**.

-----

## 🛠️ Últimas Modificações (Outubro 2025)

  * **Refatoração de Prompts (Gestão Educacional)**: O prompt monolítico de Gestão Educacional foi dividido em arquivos específicos para cada tipo de documento (Diploma, Histórico Escolar, Regimento Interno, etc.), visando maior precisão e organização.
  * **Seleção de Subcategoria no Frontend**: Adicionado um dropdown no formulário que aparece quando "Gestão Educacional" é selecionado, permitindo ao usuário indicar o tipo específico do documento.
  * **Componentes de Exibição Específicos**: Criados componentes React (`InfoDiploma.jsx`, `InfoRegimentoInterno.jsx`, etc.) para exibir os metadados de cada tipo de documento educacional de forma adequada. Estes foram organizados na pasta `frontend/src/components/info/infoGestaoEducacional/`. O componente genérico `InfoGestaoEducacional.jsx` foi removido.
  * **Roteamento de Exibição Aprimorado**: O componente `InfoDocumento.jsx` foi atualizado para identificar as categorias específicas retornadas pela IA (incluindo subtipos de SEI e Gestão Educacional) e renderizar o componente de exibição correspondente.
  * **Modal de Detalhes na Busca**: Implementado um modal na página `Buscar.jsx`. Ao clicar em um resultado da busca, o modal é aberto exibindo os detalhes completos do documento, reutilizando o `InfoDocumento.jsx`.
  * **Busca Completa no Backend**: A função de busca (`buscarDocumentos` em `mongoDbService.js`) foi ajustada para retornar o objeto `resultadoIa` completo (incluindo todos os `metadados`), necessário para exibir os detalhes no novo modal da página Buscar. Anteriormente, retornava apenas campos selecionados.
  * **Melhoria na Exibição de Metadados**: A função `renderField` (`renderUtils.jsx`) foi aprimorada para:
        * Diferenciar visualmente os "tópicos" (rótulos de objetos/arrays) dos "campos" (rótulos de valores simples), aplicando um estilo maior aos tópicos.
        * Ocultar automaticamente tópicos (objetos/arrays) que contenham apenas valores nulos ou vazios, evitando poluição visual.
  * **Correção de Encoding de Nomes de Arquivo**: Implementada lógica no `documentoController.js` para detectar e corrigir problemas de codificação (UTF-8 lido como Latin1) em nomes de arquivos com acentos durante o upload, evitando nomes "bugados" como "ofÃ­cio.pdf".

-----

## 🏗 Arquitetura e Tecnologias

O projeto é estruturado como um monorepo, dividido em `frontend` e `backend`, orquestrado via `docker-compose`.

### Frontend (`frontend`)

  * ⚛️ **React (Vite)**
  * 🎨 **Tailwind CSS**
  * 🔐 **React Context API** (para Autenticação)
  * **React Router DOM** (para navegação)

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