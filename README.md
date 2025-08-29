### Atualizações Recentes (29/08/2025)

Após os ajustes para corrigir problemas e simplificar o ambiente de desenvolvimento, a aplicação recebeu as seguintes atualizações:

* **Configuração de Autenticação e Autorização:** O fluxo de autenticação com Amazon Cognito foi revisado e configurado corretamente. A funcionalidade de login de administrador agora funciona conforme o esperado, concedendo acesso exclusivo à página de administração.
* **Melhoria na Estabilidade:** Diversos bugs e problemas de comunicação entre o front-end e o back-end foram corrigidos, resultando em uma experiência de usuário mais estável.
* **Arquitetura Monolítica Temporária:** Devido aos desafios encontrados na implantação da arquitetura serverless (com Lambda e API Gateway), o projeto agora está rodando em uma arquitetura monolítica. O back-end em Node.js/Express e o front-end em React se comunicam diretamente por meio de um servidor local. O plano de migração para uma arquitetura dirigida por eventos na AWS foi adiado e será retomado em uma etapa futura.
* **Problema Conhecido:** A funcionalidade de exclusão de documentos no painel administrativo parou de funcionar e está atualmente sob investigação.

---
