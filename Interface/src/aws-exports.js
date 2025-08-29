/**
 * Centraliza toda a configuração do Amplify para conectar o frontend
 * aos serviços da AWS (Cognito, API, S3).
 * Os valores aqui DEVEM corresponder aos recursos criados na sua conta AWS.
 */

const awsExports = {
    "Auth": {
        "Cognito": {
            // ID do seu User Pool no Cognito
            "userPoolId": "us-east-1_1LupqCAD1",
            // ID do cliente do seu User Pool
            "userPoolClientId": "6vdcq3882dqe4a8rssm6neasl1",
            // Região da AWS onde os recursos estão
            "region": "us-east-1",
            "loginWith": {
                "oauth": {
                    // Domínio do seu Hosted UI do Cognito
                    "domain": "categorizar-documentos-ai.auth.us-east-1.amazoncognito.com",
                    // URIs para redirecionamento após login
                    "redirectSignIn": [
                        "http://localhost:5173/"
                    ],
                    // URIs para redirecionamento após logout
                    "redirectSignOut": [
                        "http://localhost:5173/"
                    ],
                    // Tipo de resposta esperado do OAuth
                    "responseType": "code",
                    // Permissões que a aplicação solicita ao usuário
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
    "API": {
        "endpoints": [
            {
                // Nome amigável para a sua API monolítica
                "name": "MinhaAPIDeDocumentos",
                // Endpoint do seu backend Express.js
                "endpoint": "http://localhost:3001/api/",
                "region": "us-east-1"
            }
        ]
    },
    "Storage": {
        // Nome do bucket S3 (mantido para referência, mas o upload é via backend)
        "bucket": "categorizar-docs-grupo1",
        "region": "us-east-1"
    }
};

export default awsExports;