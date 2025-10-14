# G01-GoLedger #

## Equipe #
| Nome | GitHub |
| :--- | :--- |
| Eduarda | [@EduardaCCampos](https://github.com/EduardaCCampos) |
| Fábio | [@fabiosodremat](https://github.com/fabiosodremat) |
| Flávia | [@flavirosadolima](https://github.com/flavirosadolima) |
| Gilvan | [GitHub ausente] |
| Rafael Augusto | [@Rafaasj07](https://github.com/Rafaasj07) |

---

## Visão Geral da Solução

Este projeto utiliza a **Inteligência Artificial Generativa** (rodando localmente com **Ollama** e o modelo **Llama 3**) para **analisar, categorizar e extrair metadados de documentos PDF** de forma automatizada e eficiente.

Encontra-se atualmente na etapa de migração da arquitetura monolítica associada a serviços da AWS para uma **arquitetura de microsserviços** com todos os serviços necessários à produção sendo *open-source*. Esta migração visa a modernização da *stack* tecnológica, maior controle sobre os resultados da IA Generativa e a eliminação do *lock-in* em serviços proprietários.

> **Observações sobre o Template do Repositório**
> O repositório está dividido em diretórios de acordo com as responsabilidades técnicas:
> * `documentacao` - documentação
> * `frontend` - aplicação web
> * `backend` - aplicação backend
> * `rollback1` - sistema monolítico associado aos serviços da AWS
> * `outros*` - quaisquer outros diretórios necessários

---

## Histórico e Evolução do Projeto

O projeto iniciou-se como um monolito para o *front-end* em React, *back-end* em Node.js e os serviços de API conectando-se aos serviços da AWS (versão 0).

Em seguida, passou por uma fase de experimentação com uma Arquitetura Orientada a Eventos (EDA) visando melhor performance (versão 0.1). No entanto, dado o esforço empreendido e a necessidade de eficiência sobre a solução, foi feito o *rollback* para a arquitetura monolítica original.

Garantida a estabilidade da solução, a mesma foi enriquecida com o sistema de autenticação via Cognito (versão 1). A versão em produção atual é, portanto, uma fusão do *backend* monolítico da versão inicial com o sistema de autenticação do projeto.

Para esta versão final (**versão 2**), será implementada a refatoração do código para atender a Arquitetura de Microsserviços.

> **Estratégia de Microsserviços (Decomposição Baseada em Domínio):**
> Cada contexto/domínio deve se tornar um microsserviço independente:
> * Document Management (Importação, Armazenamento)
> * Document Pre-processing (OCR, extração de metadados básicos)
> * AI/Classification (Categorização por IA, Fine-tuning)
> * Indexing & Search (Indexação de metadados, busca)
> * Blockchain Interaction (Interação com API da *blockchain*, garantindo registro na cadeia de custódia)
> * User/Web Interface (Upload, Visualização, Interação com APIs)
>
> Os microsserviços serão criados ao redor do monolito (Padrão Strangler Fig).
>
>> **Substituição de Serviços (v2):**
> * DynamoDB $\rightarrow$ MongoDB
> * Amazon S3 $\rightarrow$ MinIO
> * Amazon Bedrock $\rightarrow$ Llama 3.2
> * Amazon Textract $\rightarrow$ Tesseract
> * Amazon Cognito $\rightarrow$ Keycloak

---

## ✨ Funcionalidades Principais

O projeto, em sua arquitetura atual, oferece:

* 🔑 **Autenticação Própria com JWT**: Sistema completo de cadastro e login.
* 🛡 **Controle de Acesso por Papel (Role)**: Perfis de `user` e `admin`.
* 📤 **Upload de Documentos em Lote**: Envio de até 10 arquivos PDF simultaneamente.
* 🤖 **Análise Híbrida com IA Local**: Pipeline de processamento com `pdfjs-dist`, OCR (Tesseract) e **Análise Generativa** com **Ollama (Llama 3)** para extração de metadados e categoria.
* 🖥 **Painel de Administração Simplificado**: Interface para administradores visualizarem todos os documentos.
* 🔎 **Busca e Filtros Avançados**: Pesquisa por **nome do arquivo, categoria ou conteúdo do resumo**.
* 🔒 **Armazenamento e Download Seguro de Documentos**: Arquivos armazenados no **MinIO**.
* 📱 **Interface Totalmente Responsiva**: Layout projetado com **Tailwind CSS**.

---

## 🏗 Arquitetura e Tecnologias

O projeto é estruturado como um monorepo, dividido em `frontend` e `backend`, orquestrado via `docker-compose`.

### Frontend (`frontend`)

* ⚛️ **React (Vite)**
* 🎨 **Tailwind CSS**
* 🔐 **React Context API**

### Backend (`backend`)

* 🟢 **Node.js & Express**
* 🐋 **Docker Compose** (Orquestra API, MinIO, MongoDB, Ollama)
* 💾 **MinIO** (Armazenamento de objetos)
* 📄 **MongoDB**
* 🤖 **Ollama (Llama 3)**
* ✍️ **node-tesseract-ocr**
* 📑 **pdfjs-dist & canvas**

---

## ⚙️ Como Rodar Localmente

### 🔧 Pré-requisitos

* **Docker** e **Docker Compose** instalados.
* **Node.js v18+**.
* **NPM** ou **Yarn**.

### 🚀 Passo 1: Iniciar os Serviços de Backend com Docker

1.  **Navegue até a raiz do projeto**:
    ```bash
    cd G01-GoLedger
    ```
2.  **Suba todos os containers**:
    ```bash
    docker-compose up --build -d
    ```

### 🤖 Passo 2: Configurar o Modelo de IA no Ollama

1.  **Execute o comando** para baixar o modelo `llama3` no container do Ollama:
    ```bash
    docker exec -it ollama ollama pull llama3
    ```

### 🎨 Passo 3: Configurar e Iniciar o Frontend

1.  **Configure as variáveis de ambiente**:
    * Na pasta `frontend`, verifique o arquivo `.env`:
        ```env
        VITE_API_URL=http://localhost:3001/api/
        ```
2.  **Inicie o Frontend**:
    * Navegue até a pasta do frontend: `cd frontend`
    * Instale as dependências: `npm install`
    * Inicie o servidor: `npm run dev`

### ✅ Passo 4: Acesse a Aplicação

* Abra seu navegador e acesse **`http://localhost:5173`**.
* **Usuários Padrão para Teste**:
    * **Administrador**: Usuário: `admin` | Senha: `admin`
    * **Usuário Comum**: Usuário: `user` | Senha: `user`
