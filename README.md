# G01-GoLedger

## Equipe

| Nome     | GitHub                                                 |
| :------- | :----------------------------------------------------- |
| Eduarda  | [@EduardaCCampos](https://github.com/EduardaCCampos)   |
| Fábio    | [@fabiosodremat](https://github.com/fabiosodremat)     |
| Flávia   | [@flavirosadolima](https://github.com/flavirosadolima) |
| Gilvan   | [@Gilvan-pro](https://github.com/Gilvan-pro)           |
| Rafael Augusto | [@Rafaasj07](https://github.com/Rafaasj07)       |

## 🗂️ Artefatos

🔗 **Acesse aqui:** [Pasta G01-GoLedger no Google Drive](https://drive.google.com/drive/folders/1lm-dzjdQkykmR-7wladXBhUGkrSa5wtj?usp=sharing)

-----

## 📂 Visão Geral da Solução

Este projeto utiliza **Inteligência Artificial Generativa** para **analisar, categorizar e extrair metadados de documentos PDF**. A aplicação conta com autenticação JWT e controle de acesso.

A arquitetura foi modernizada para nuvem, utilizando **Cloudflare R2** para armazenamento de objetos e **MongoDB Atlas** para dados, facilitando o deploy em plataformas como **Render**.

-----

## ✨ Funcionalidades Principais

* 🔑 **Autenticação com JWT**: Cadastro e login seguro.
* 📤 **Upload e Storage em Nuvem**: Uploads seguros para Cloudflare R2.
* 🤖 **Análise com IA**: Categorização e extração de dados via OpenRouter.
* 🖥️ **Painel Administrativo**: Busca, filtros e edição de metadados.
* 📄 **Visualização Detalhada**: Modais ricos para cada tipo de documento.
* 📥 **Download Seguro**: Links temporários ou diretos do R2.

-----

## 🏗 Arquitetura e Tecnologias

### Frontend (`frontend`)
* ⚛️ **React (Vite)** + **Tailwind CSS**

### Backend (`backend`)
* 🟢 **Node.js & Express**
* ☁️ **Cloudflare R2** (Object Storage S3-compatible)
* 🍃 **MongoDB Atlas** (Banco de dados em nuvem)
* 🔐 **JWT** (Autenticação)
* 🤖 **OpenRouter** (IA)
* ✍️ **OCR** (Tesseract) e **PDF.js**

-----

## ⚙️ Como Rodar Localmente

### 🔧 Pré-requisitos
* **Docker** e **Node.js v22+**.
* Conta no **Cloudflare R2** (para as credenciais).

### 🚀 Passo 1: Configurar Variáveis
1. Crie o arquivo `backend/.env` baseado no `.env.example`.
2. Preencha as credenciais do **R2** (`R2_ACCESS_KEY`, `R2_SECRET_KEY`, etc).
3. Defina sua `OPENROUTER_API_KEY`.

### 🚀 Passo 2: Iniciar Backend e Banco
```bash
cd Categorizar-Documentos-AI
docker-compose up --build
