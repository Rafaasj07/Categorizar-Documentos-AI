# 📂 Categorizar Documentos AI

Este projeto utiliza **Inteligência Artificial Generativa** da AWS (Amazon Bedrock com o modelo Claude 3 Haiku) para **analisar, categorizar e extrair metadados de documentos PDF** de forma automatizada e eficiente. A aplicação conta com um sistema de autenticação robusto via **Amazon Cognito**, com suporte a múltiplos usuários e controle de acesso baseado em papéis.

A arquitetura foi refinada para utilizar um pipeline avançado de processamento de documentos, combinando a extração de texto e imagens com a biblioteca `pdfjs-dist` e aplicando OCR (Reconhecimento Óptico de Caracteres) com **Amazon Textract** apenas quando necessário, garantindo maior precisão e performance.

-----

## 🚀 Acessar a Aplicação (Deploy)

Você pode testar a aplicação em produção no seguinte link:

**[https://categorizar-documentos-ai-1.onrender.com/login](https://categorizar-documentos-ai-1.onrender.com/login)**

-----

## ✨ Funcionalidades Principais

  * 🔑 **Autenticação de Usuários**

      * Sistema completo de login, cadastro, confirmação de conta e redefinição de senha com **AWS Cognito**.

  * 🛡 **Controle de Acesso por Papel (Role)**

      * Perfis de `usuário` e `admin` com permissões distintas, onde usuários podem categorizar e buscar, e administradores gerenciam todos os arquivos do sistema.

  * 📤 **Upload de Documentos em Lote**

      * Envio de até **10 arquivos PDF** simultaneamente, com validação de tamanho (máx. 5MB por arquivo) e quantidade.

  * 🤖 **Análise Híbrida com IA Avançada**

      * Cada documento passa por um pipeline de processamento otimizado:
        1.  **Extração de Conteúdo:** O texto e as imagens são extraídos de cada página do PDF usando `pdfjs-dist`.
        2.  **OCR Inteligente:** O **Amazon Textract** é aplicado apenas nas imagens extraídas para converter conteúdo visual em texto.
        3.  **Análise Generativa:** O texto consolidado é enviado ao **Amazon Bedrock (Claude 3 Haiku)** para extrair:
              * **Categoria** (ex: Contrato, Nota Fiscal, Relatório Financeiro).
              * **Metadados Relevantes**: Título, autor, data, palavras-chave e um resumo objetivo do conteúdo.

  * 🖥 **Painel de Administração Simplificado**

      * Interface para visualização de todos os documentos enviados ao sistema.
      * Ferramentas para **busca, filtro e exclusão em lote**, otimizando a gestão dos arquivos.

  * 🔎 **Busca e Filtros Avançados**

      * Pesquisa de documentos por **nome do arquivo, categoria ou conteúdo do resumo**.
      * Opções para **ordenar** os resultados por data (mais recentes ou mais antigos).
      * **Paginação** para navegar facilmente por grandes volumes de resultados.

  * 🔒 **Download Seguro de Documentos**

      * Geração de links de download temporários e protegidos (pré-assinados) diretamente do Amazon S3, garantindo que os arquivos só possam ser acessados de forma autorizada.

  * 📱 **Interface Totalmente Responsiva**

      * Layout projetado com Tailwind CSS, adaptável para uma experiência de uso consistente em desktops e dispositivos móveis.

-----

## 🏗 Arquitetura e Tecnologias

O projeto é estruturado como um **monorepo** com uma **arquitetura monolítica**, dividido em `Interface` (frontend) e `API` (backend) para uma clara separação de responsabilidades.

### Frontend (`Interface`)

  * ⚛️ **React (Vite)** — Biblioteca principal para a construção da interface de usuário.
  * 🎨 **Tailwind CSS** — Framework CSS para estilização rápida, moderna e responsiva.
  * 🔌 **AWS Amplify SDK** — Facilita a integração com os serviços da AWS, especialmente o Cognito para autenticação.
  * 🌐 **Axios** — Cliente HTTP para realizar a comunicação segura e eficiente com a API do backend.
  * 🔄 **React Router** — Para gerenciamento de rotas e navegação na aplicação.

### Backend (`API`)

  * 🟢 **Node.js & Express** — Plataforma e framework para a construção de uma API REST robusta e escalável.
  * ☁️ **AWS SDK v3** — Kit de desenvolvimento para integração com os serviços da AWS:
      * **Amazon S3** — Para o armazenamento seguro e durável dos arquivos PDF enviados pelos usuários.
      * **Amazon Textract** — Utilizado de forma otimizada para realizar OCR (Reconhecimento Óptico de Caracteres) apenas em imagens extraídas dos PDFs.
      * **Amazon Bedrock (Claude 3 Haiku)** — Serviço de IA generativa para a análise inteligente, categorização e extração de metadados dos textos.
      * **Amazon DynamoDB** — Banco de dados NoSQL para persistência dos metadados de todos os documentos processados.
  * 📄 **pdfjs-dist & canvas** — Bibliotecas utilizadas no backend para processar os arquivos PDF, extraindo seu conteúdo textual e visual antes da análise pela IA.

-----

## ⚙️ Como Rodar Localmente

### 🔧 Pré-requisitos

  * Node.js **v18+**
  * NPM ou Yarn
  * Uma conta na AWS com credenciais de acesso configuradas e permissões para **S3, Textract, Bedrock e DynamoDB**.
  * Um **Amazon Cognito User Pool** configurado com um App Client.
  * Uma tabela no **Amazon DynamoDB** para armazenar os metadados dos documentos.

-----

### 🚀 Backend (API)

1.  Acesse a pasta da API:
    ```bash
    cd ATUAL/API
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Crie e configure o arquivo `.env` a partir do exemplo `.env.example`:
    ```env
    AWS_ACCESS_KEY_ID="SUA_ACCESS_KEY_ID_AQUI"
    AWS_SECRET_ACCESS_KEY="SUA_SECRET_ACCESS_KEY_AQUI"
    AWS_REGION="sua-regiao-aws"
    S3_BUCKET_NAME="NOME_DO_SEU_BUCKET_S3"
    DYNAMODB_TABLE_NAME="NOME_DA_SUA_TABELA_DYNAMODB"
    CORS_ORIGIN="http://localhost:5173"
    ```
4.  Inicie o servidor em modo de desenvolvimento:
    ```bash
    npm run dev
    ```
    ➜ A API estará disponível em `http://localhost:3001`

-----

### 🎨 Frontend (Interface)

1.  Acesse a pasta da Interface:
    ```bash
    cd ATUAL/Interface
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Configure a conexão com os serviços da AWS no arquivo `src/aws-exports.js`, preenchendo os dados do seu Cognito User Pool.
4.  Crie um arquivo `.env` na raiz da pasta `Interface` com a URL da sua API:
    ```env
    VITE_API_URL=http://localhost:3001/api/
    ```
5.  Inicie a aplicação de desenvolvimento:
    ```bash
    npm run dev
    ```
    ➜ A aplicação estará disponível em `http://localhost:5173`

-----

## 📖 Histórico e Evolução do Projeto

Este projeto começou como uma exploração de **Arquitetura Orientada a Eventos (EDA)**. No entanto, para garantir maior **simplicidade, estabilidade e controle** sobre o fluxo de processamento, a decisão foi retornar a uma arquitetura **monolítica**, que foi significativamente reforçada e otimizada.

A evolução mais importante foi a **substituição do pipeline de extração de texto**. A versão inicial dependia exclusivamente do AWS Textract para processar PDFs inteiros, o que poderia ser lento e custoso. A versão atual implementa um **processo híbrido e mais inteligente**: primeiro, utiliza a biblioteca `pdfjs-dist` para uma extração rápida de texto e imagens; em seguida, aplica o OCR do Textract de forma cirúrgica apenas nas imagens, maximizando a precisão e reduzindo o tempo de processamento.

Além disso, o projeto foi simplificado pela **remoção da funcionalidade de "fine-tuning simulado"**, onde administradores corrigiam manualmente as categorias. A nova abordagem foca em um fluxo **totalmente automatizado**, confiando na capacidade do modelo Claude 3 Haiku e na qualidade do novo pipeline de extração de dados para fornecer resultados precisos desde o início.

👉 O resultado é um sistema que combina a **solidez e a simplicidade de uma API monolítica** com um **backend de processamento de documentos de ponta**, entregando uma solução mais rápida, eficiente e fácil de manter.
