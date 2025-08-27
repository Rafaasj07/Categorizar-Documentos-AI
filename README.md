# AWS Amplify React+Vite - Overview

Este repositório utiliza Categorizar-Documentos-AI/INTERFACE (arquitetura monolítica utilizando Express.js) como base para desenvolvimento do front-end em uma Arquitetura Dirigida por Eventos (EDA). O template possui um setup mínimo e as aplicações foram desenvolvidas em React+Vite, conjuntamente a SDKs AWS Amplify (versão 6.x).

Alguns serviços da AWS foram pré-configurados manualmente (implementação CloudFormation no futuro), tais como Cognito, API Gateway, Funções Lambda, políticas IAM, Amazon SQS e Amazon S3. Outras funcionalidades serão aplicadas gradualmente.

# Features
> Authentication: Setup com Amazon Cognito.
- Cliente de aplicação usando SRP - Cognito versão Lite (Hosted UI)
- Dois usuários e grupos (admin e usuario)
> Api Gateway como endpoint e Lambdas com integração proxy.
- Estágio de dev nesta etapa.
- Upload com GET utilizando Lambda como proxy (parse de CORS) e OPTIONS mock para preflight
- OPTIONS: Solicitação sem AUTH (mock) + Respostas de integração requer mapeamento de X-Correlation-Id
> Database: Amazon S3 para carga de arquivos e acionamento de Fila SQS.
- Aplicar CORS para receber upload e S3 Events para acionar SQS
- SQS com DQL criado para ser aplicado sobre a Fila Principal: comunicar S3 com Lambda de Processamento
> CloudWatch e X-Ray para logs e métricas.
- Para API Gateway e Lambda UploadURL
> Amplify SDK para teste localmente e para Web Hosting para ambiente de desenvolvimento 
- Web Hosting a ser aplicado.
> Lambda UploadURL com powertools para diagnóstico (fazer upload do código index.js + node_modules)
- Configurar Variáveis de ambiente para diagnóstico e atividade:
    POWERTOOLS_LOGGER_LOG_EVENT     true
    POWERTOOLS_LOGGER_LOG_LEVEL     DEBUG
    S3_BUCKET_NAME                  nome_do_bucket_para_upload
- Origem: API Gateway
- Sem destino.
> Políticas de Segurança IAM e privilégio mínimo (Outras funcionalidades a serem implementadas).

# Deploy para a AWS
> Deploy local:
rm -rf node_modules && rm package-lock.json && rm -rf .vite && npm cache clean --force && npm install && npm run dev
- Verificar se axios uuid react-router-dom foram instalados e se aws-amplify está em versão 6.x (npm install aws-amplify@latest) para caso de erro de deploy local.

> Deploy em nuvem a ser aplicado.


