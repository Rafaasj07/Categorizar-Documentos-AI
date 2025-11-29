# Categorizador Inteligente de Documentos

## 🎥 Vídeo Pitch

🔗 **Assista ao vídeo-pitch da equipe:** [https://www.youtube.com/watch?v=N_9-NKpeZ7Q](https://www.youtube.com/watch?v=N_9-NKpeZ7Q)

---

## 🗂️ Artefatos (Drive)

Todos os documentos, atas, diagramas e relatórios do grupo estão disponíveis no Google Drive oficial do projeto:

🔗 **Acesse aqui:** [Pasta G01-GoLedger no Google Drive](https://drive.google.com/drive/folders/1lm-dzjdQkykmR-7wladXBhUGkrSa5wtj?usp=sharing)

---

## 🚀 Deploy

🔗 **Repositório da Versão de Deploy:** [https://github.com/Rafaasj07/Categorizar-Documentos-AI](https://github.com/Rafaasj07/Categorizar-Documentos-AI)

A aplicação está rodando em ambiente de produção no Render:

🔗 **Acesse o Sistema:** [https://categorizador-frontend.onrender.com](https://categorizador-frontend.onrender.com)

> **Nota sobre a Stack em Produção:** Para viabilizar o deploy na nuvem, a arquitetura sofreu adaptações em relação ao ambiente local. O **MinIO** foi substituído pelo **Cloudflare R2** (Object Storage) e o banco de dados local migrou para o **MongoDB Atlas**.

---

## 📂 Visão Geral da Solução

Este projeto implementa um **Categorizador Inteligente de Documentos PDF**. Ele utiliza **Inteligência Artificial Generativa** (através da plataforma **OpenRouter**) para analisar, categorizar e extrair metadados de documentos de forma automatizada e eficiente.

A arquitetura é baseada em Docker Compose e Node.js, orquestrando um pipeline robusto de pré-processamento (extração de texto e OCR) e análise de IA.

---

## ✨ Funcionalidades Principais

* 🔑 **Autenticação Própria com JWT**: Sistema completo de cadastro e login (`bcryptjs`, `jsonwebtoken`).
* 🛡 **Controle de Acesso por Papel (Role)**: Perfis de `user` (upload/busca) e `admin` (gerenciamento total).
* 📤 **Upload de Documentos em Lote**: Envio de até 10 arquivos PDF simultaneamente.
* 🤖 **Análise Híbrida com IA na Nuvem**: O pipeline de processamento combina a extração de texto embutido com `pdfjs-dist` e **OCR** (`node-tesseract-ocr`) para conteúdo em imagens. O texto limpo e otimizado é enviado ao modelo **Mistral 7B (via OpenRouter)** para extração de metadados.
* 🎯 **Contextos de Análise Otimizados**: Seleção de contexto (`Nota Fiscal`, `Gestão Educacional`, `SEI`, `Cartório`, etc.) no frontend para direcionar a IA com prompts estruturados e específicos, garantindo maior precisão.
* ✏️ **Edição de Metadados (Admin)**: Administradores podem visualizar e corrigir o JSON bruto dos metadados extraídos pela IA diretamente pela interface.
* ⭐ **Sistema de Feedback**: Usuários podem avaliar a precisão da categorização (Rating 1-5), com visualização agregada e restrita a administradores.
* 🔎 **Busca e Paginação**: Pesquisa por nome, categoria ou conteúdo do resumo, com paginação baseada em tokens e ordenação.
* 📥 **Download Seguro**: Download do arquivo original e geração de um PDF formatado com os metadados extraídos (via `jsPDF` no frontend).

---

## 🏗 Arquitetura e Tecnologias

O projeto é estruturado como um monorepo, dividido em `frontend` e `backend`.

### Frontend (`frontend`)

* ⚛️ **React (Vite)**
* 🎨 **Tailwind CSS**
* 📦 **jsPDF & jsPDF-AutoTable**: Para geração de PDF de metadados no lado do cliente.

### Backend (`backend`)

* 🟢 **Node.js & Express**
* 🤖 **OpenRouter**: Serviço de IA (Mistral).
* ✍️ **node-tesseract-ocr**: OCR para extração de texto de imagens em PDF.
* 📑 **pdfjs-dist**: Para extração eficiente de texto embutido.

### ☁️ Infraestrutura e Armazenamento

A aplicação suporta duas configurações de infraestrutura:

1. **Local (Docker Compose):**

   * 🐋 **MinIO**: Armazenamento de objetos (S3 Compatible).
   * 💾 **MongoDB Local**: Persistência de dados.
2. **Produção (Deploy/Render):**

   * ☁️ **Cloudflare R2**: Armazenamento de objetos em nuvem.
   * 🍃 **MongoDB Atlas**: Banco de dados gerenciado em nuvem.

---

## 📖 Documentação da API (Swagger)

A documentação interativa da API do backend foi implementada usando **Swagger/OpenAPI 3.0**.

### Acesso

A documentação é servida pelo próprio backend Node.js.

* **URL da Documentação (Swagger UI):** `http://localhost:3001/api-docs`

### Configuração

O Swagger é configurado para ler os comentários JSDoc com a sintaxe `@swagger` nos arquivos de rota (ex: `authRoute.js`, `documentoRoute.js`, `feedbackRoute.js`).

### Esquema de Segurança

Todos os endpoints protegidos requerem autenticação via **Bearer Token (JWT)**, obtido através da rota de login (`/api/auth/login`).

---

## ⚙️ Como Rodar Localmente (Ambiente Docker)

### 🔧 Pré-requisitos

* **Docker** e **Docker Compose** instalados.
* **Node.js v18+**.
* **NPM** ou **Yarn**.

### 🚀 Passo 1: Configurar e Iniciar os Serviços de Backend

1. **Navegue até a raiz do projeto**:

   ```bash
   cd Categorizar-Documentos-AI
````

2.  **Configure as variáveis de ambiente**:

      * Crie ou edite o arquivo `./backend/.env`. Se não existir, copie o `.env.example`.
      * Preencha sua chave da OpenRouter: `OPENROUTER_API_KEY=sua-chave-aqui`.
      * As configurações do MinIO e MongoDB já estão pré-definidas para funcionar com o `docker-compose.yml` padrão.

3.  **Suba todos os containers**:

    ```bash
    docker-compose up --build
    ```

      * Aguarde a inicialização dos serviços (MongoDB, MinIO e Backend).

### 🎨 Passo 2: Acessar o Swagger e Iniciar o Frontend

1.  **Acesse a Documentação da API**:

      * Abra seu navegador e acesse: `http://localhost:3001/api-docs`

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

  * Use as credenciais padrão (criadas automaticamente na primeira execução do servidor) para testar:

      * **Administrador**: `user: admin` / `senha: admin`
      * **Usuário Comum**: `user: user` / `senha: user`
