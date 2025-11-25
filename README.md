Aqui está o `README.md` atualizado, agora incluindo a seção de Deploy logo no início para facilitar o acesso:

````markdown
# Categorizador Inteligente de Documentos (AI-Powered)

Este projeto é uma API robusta para **classificação e extração de metadados de documentos PDF** utilizando Inteligência Artificial Generativa. O sistema combina processamento de texto tradicional e OCR com a capacidade analítica de LLMs para estruturar dados não estruturados de diversos contextos.

## 🚀 Deploy

A aplicação está disponível em produção. Acesse o frontend conectado à API através do link abaixo:

🔗 **Acessar Sistema:** [https://categorizador-frontend.onrender.com](https://categorizador-frontend.onrender.com)

> **Nota:** O ambiente de produção utiliza **Cloudflare R2** para armazenamento e **MongoDB Atlas** para dados, garantindo escalabilidade na nuvem.

---

## 🔎 Visão Geral

A aplicação recebe arquivos PDF, armazena-os de forma segura em Object Storage e executa um pipeline de extração de texto híbrido (texto embutido + OCR). O conteúdo extraído é submetido a prompts otimizados via **OpenRouter (Modelo Mistral 7B)**, retornando um JSON estruturado com as informações cruciais do documento.

### Destaques Técnicos
- **Pipeline Híbrido**: Utiliza `pdfjs-dist` para texto nativo e `node-tesseract-ocr` para imagens.
- **Engenharia de Prompt Contextual**: Prompts dinâmicos baseados no tipo do documento (Diplomas, Notas Fiscais, Cartório, etc.).
- **Armazenamento em Nuvem**: Integração nativa com Cloudflare R2 (S3 Compatible).
- **Feedback Loop**: Sistema de avaliação da IA pelos usuários.

---

## 🛠️ Stack Tecnológica

### Backend & Infraestrutura
- **Runtime**: Node.js (Express)
- **Banco de Dados**: MongoDB (Mongoose)
- **Storage**: Cloudflare R2 (AWS SDK v3)
- **IA/LLM**: OpenRouter API (Mistral 7B Instruct)
- **Processamento de PDF**: PDF.js (`pdfjs-dist`)
- **OCR**: Tesseract (`node-tesseract-ocr`)
- **Containerização**: Docker & Docker Compose
- **Documentação**: Swagger (OpenAPI 3.0)

### Segurança
- **Autenticação**: JWT (JSON Web Tokens)
- **Hashing**: Bcryptjs
- **Controle de Acesso**: Middleware de proteção por role (`admin`/`user`)

---

## ✨ Funcionalidades da API

### 1. Gestão de Documentos
- **Upload e Análise**: Envio de PDFs com seleção de contexto específico.
- **Extração de Metadados**: Identificação automática de campos (Datas, Valores, CNPJs, Pessoas).
- **Download**: Geração de link seguro ou stream do arquivo original.
- **Exclusão em Lote**: Remoção simultânea de arquivos e metadados.

### 2. Busca e Organização
- **Filtros Avançados**: Busca Full-text nos metadados, por categoria ou data.
- **Paginação**: Sistema baseado em tokens (`nextToken`) para alta performance.
- **Categorias Dinâmicas**: Listagem das categorias identificadas.

### 3. Sistema de Feedback
- **Avaliação**: Usuários avaliam a precisão da IA (1-5 estrelas).
- **Monitoramento**: Agregação de notas para ajuste de prompts.

---

## ⚙️ Configuração e Instalação

### Pré-requisitos
- Node.js v18+
- Docker (opcional)
- Conta Cloudflare R2 (ou S3 compatível)
- Chave OpenRouter
- MongoDB

### Variáveis de Ambiente (.env)
```env
PORT=3001
MONGO_URI=mongodb+srv://...
JWT_SECRET=sua_chave_secreta
R2_BUCKET_NAME=nome-do-bucket
R2_ACCESS_KEY=sua_key
R2_SECRET_KEY=sua_secret
R2_ENDPOINT_URL=https://<id>.r2.cloudflarestorage.com
OPENROUTER_API_KEY=sua_chave_ia
````

### Rodando Localmente

1.  **Instale as dependências:**
    ```bash
    npm install
    ```
2.  **Dependência de Sistema (OCR):**
      - Certifique-se de ter o `tesseract-ocr` instalado no seu SO.
3.  **Inicie o servidor:**
    ```bash
    npm run dev
    ```
    *Ou via Docker:* `docker-compose up --build`

-----

## 📖 Documentação (Swagger)

A API possui documentação interativa gerada automaticamente.

🔗 **Local:** `http://localhost:3001/api-docs`

-----

## 📂 Estrutura do Projeto

```bash
src/
├── config/         # Configurações (DB, Swagger)
├── controllers/    # Lógica de negócio
├── middleware/     # Auth e validações
├── models/         # Schemas Mongoose
├── prompts/        # Engenharia de prompts por contexto
├── routes/         # Rotas da API
├── services/       # Integrações (R2, OpenRouter, OCR)
└── utils/          # Helpers
```

```
```
