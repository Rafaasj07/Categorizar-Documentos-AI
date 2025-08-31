/**
 * Centraliza toda a configuração do Amplify para conectar o frontend
 * aos serviços da AWS (Cognito, API, S3).
 * Os valores aqui DEVEM corresponder aos recursos criados na sua conta AWS.
 */

// Define e exporta um objeto com as configurações de conexão com a AWS.
const awsExports = {
    // Seção de configuração para Autenticação.
    "Auth": {
        // Especifica o uso do Amazon Cognito.
        "Cognito": {
            // ID do "User Pool" (banco de usuários) no Cognito.
            "userPoolId": "us-east-1_1LupqCAD1",
            // ID do "App Client" (aplicativo cliente) registrado no User Pool.
            "userPoolClientId": "6vdcq3882dqe4a8rssm6neasl1",
            // Região da AWS onde o serviço Cognito está hospedado.
            "region": "us-east-1",
            // Configurações para login social ou federado (OAuth).
            "loginWith": {
                "oauth": {
                    // O domínio da interface de login hospedada pelo Cognito.
                    "domain": "categorizar-documentos-ai.auth.us-east-1.amazoncognito.com",
                    // URLs para as quais o usuário será redirecionado após o login.
                    "redirectSignIn": [
                        "http://localhost:5173/"
                    ],
                    // URLs para as quais o usuário será redirecionado após o logout.
                    "redirectSignOut": [
                        "http://localhost:5173/"
                    ],
                    // Tipo de resposta esperado do processo de autenticação.
                    "responseType": "code",
                    // Permissões (escopos) que a aplicação solicita ao usuário durante o login.
                    "scopes": [
                        "email",
                        "profile",
                        "openid",
                        "aws.cognito.signin.user.admin"
                    ]
                }
            }
        }
    },
    // Seção de configuração para a API.
    "API": {
        // Lista de endpoints (pontos de acesso) da API.
        "endpoints": [
            {
                // Um nome amigável para identificar a API.
                "name": "MinhaAPIDeDocumentos",
                // A URL base do backend onde as requisições serão enviadas.
                "endpoint": "http://localhost:3001/api/",
                // A região da AWS onde a API está hospedada.
                "region": "us-east-1"
            }
        ]
    },
    // Seção de configuração para o Armazenamento (Storage).
    "Storage": {
        // Nome do bucket no Amazon S3 usado pela aplicação.
        "bucket": "categorizar-docs-grupo1",
        // A região da AWS onde o bucket S3 está localizado.
        "region": "us-east-1"
    }
};

// Exporta o objeto de configuração para ser usado pelo Amplify em outras partes do código.
export default awsExports;