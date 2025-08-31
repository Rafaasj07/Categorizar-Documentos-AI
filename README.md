# 📂 Categorizar Documentos AI

Este projeto utiliza **Inteligência Artificial Generativa** da AWS (Amazon Bedrock com o modelo Claude 3 Haiku) para **analisar, categorizar e extrair metadados de documentos PDF** de forma automatizada.
A aplicação conta com um sistema de autenticação robusto via **Amazon Cognito**, com suporte a múltiplos usuários e controle de acesso baseado em papéis.

---

## ✨ Funcionalidades Principais

* 🔑 **Autenticação de Usuários**
  Login, cadastro, confirmação de conta e redefinição de senha com **AWS Cognito**.

* 🛡 **Controle de Acesso**
  Papéis `usuário` e `admin`, com permissões distintas para categorização e gerenciamento.

* 📤 **Upload em Lote**
  Envio de até **10 PDFs** por vez (máx. 5MB cada).

* 🤖 **Análise com IA Avançada**
  Cada documento é processado para extrair automaticamente:

  * **Categoria** (ex: Contrato, Nota Fiscal, Relatório Financeiro).
  * **Score de Confiança** (certeza da IA em %).
  * **Metadados**: título, autor, data, palavras-chave e resumo.

* 🔁 **"Fine-Tuning Simulado" (Loop de Feedback Humano)**

  * Administradores podem corrigir categorias diretamente no painel.
  * Cada correção é armazenada e usada como exemplo para **retroalimentar a IA**, tornando as futuras análises mais precisas.

* 🖥 **Painel de Administração**

  * Visualização de todos os documentos processados.
  * Indicadores visuais para **baixa confiança** (ícones ⚠️ e cores dinâmicas).
  * Ferramentas para **exclusão em lote**.

* 🔎 **Busca e Filtros**
  Pesquisa de documentos por **nome, categoria ou resumo**.

* 🔒 **Download Seguro**
  Links temporários e protegidos para baixar PDFs.

* 📱 **Interface Responsiva**
  Layout adaptável para desktop e mobile.

---

## 🏗 Arquitetura e Tecnologias

O projeto é um **monorepo** dividido em `Interface` (frontend) e `API` (backend), rodando em **arquitetura monolítica**.

### Frontend (`Interface`)

* ⚛️ **React (Vite)** — construção da interface.
* 🎨 **Tailwind CSS** — estilização rápida e responsiva.
* 🔌 **AWS Amplify SDK** — integração com Cognito.
* 🌐 **Axios** — comunicação com a API.

### Backend (`API`)

* 🟢 **Node.js & Express** — API REST.
* ☁️ **AWS SDK v3** — integração com serviços AWS:

  * **Amazon S3** — armazenamento de arquivos.
  * **Amazon Textract** — extração de texto.
  * **Amazon Bedrock (Claude 3 Haiku)** — categorização e metadados.
  * **Amazon DynamoDB** — persistência de documentos e correções.

---

## ⚙️ Como Rodar Localmente

### 🔧 Pré-requisitos

* Node.js **18+**
* NPM ou Yarn
* Conta AWS com permissões para **S3, Textract, Bedrock e DynamoDB**
* Cognito **User Pool** configurado
* Duas tabelas no **DynamoDB**:

  * `Documentos` (metadados)
  * `CorrecoesCategorias` (feedback humano)

---

### 🚀 Backend (API)

1. Acesse a pasta da API:

   ```bash
   cd API
   ```
2. Instale as dependências:

   ```bash
   npm install
   ```
3. Configure o arquivo `.env` (baseado no `.env.example`):

   ```env
   DYNAMODB_TABLE_NAME="sua-tabela-principal"
   DYNAMODB_CORRECOES_TABLE_NAME="CorrecoesCategorias"
   CORS_ORIGIN="http://localhost:5173"
   ```
4. Inicie o servidor:

   ```bash
   npm run dev
   ```

   ➜ Disponível em `http://localhost:3001`

---

### 🎨 Frontend (Interface)

1. Acesse a pasta da Interface:

   ```bash
   cd Interface
   ```
2. Instale as dependências:

   ```bash
   npm install
   ```
3. Configure o **Amplify (`aws-exports.js`)** em `src/`.
4. Crie o `.env` na raiz:

   ```env
   VITE_API_URL=http://localhost:3001/api/
   ```
5. Rode o projeto:

   ```bash
   npm run dev
   ```

   ➜ Disponível em `http://localhost:5173`

---

## 📖 Histórico e Evolução do Projeto

Inicialmente o sistema foi testado com uma **Arquitetura Orientada a Eventos (EDA)**.
No entanto, para garantir **simplicidade e estabilidade**, retornamos à arquitetura **monolítica**, reforçando-a com:

* Autenticação robusta via **Cognito**
* Loop de **feedback humano** para retroalimentação da IA

👉 O resultado é um sistema que combina **solidez do backend monolítico** com a **evolução contínua da IA** a partir do uso real.

---
