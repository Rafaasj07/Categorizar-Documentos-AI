// Coração da conexão frontend-AWS - Especificado para a V6 do Amplify
// ADICIONAR VALORES REAIS 


const awsExp = {
    // Configurações da categoria Auth (Autenticação)
    "Auth": {
        // As configurações específicas do Cognito User Pool são aninhadas sob 'Cognito'
        "Cognito": {
            // Seu User Pool ID
            "userPoolId": "USER_POOL_ID", // Ex: "us-east-1_XXXXX"
            // Seu App Client ID (renomeado de userPoolWebClientId para userPoolClientId na v6)
            "userPoolClientId": "APP_CLIENT_ID", // Ex: "YYYYY" (sem segredo de cliente)",
            // A região do seu User Pool
            "region": "REGIAO_AWS",
            // As configurações para o login com Hosted UI (OAuth) são aninhadas sob 'loginWith.oauth'
            "loginWith": {
                "oauth": {
                    // O domínio do seu Hosted UI ('CUSTOM-DOMAIN.auth.REGIAO_AWS.amazoncognito.com') 
                    // ou gerado pelo Cognito: ('USER_POOL_ID.auth.REGIAO_AWS.amazoncognito.com')
                    "domain": "VALOR.auth.region.amazoncognito.com",
                    // Incluir todos os domínios permitidos (localhost para desenvolvimento, domínios de produção)
                    // Agora um array de strings
                    "redirectSignIn": ["http://localhost:3000/"],
                    "redirectSignOut": ["http://localhost:5173/"],
                    // O tipo de resposta OAuth esperado ('code' para Authorization Code Grant Flow, 'token' para Implicit Grant)
                    "responseType": "code",
                    // Os escopos de permissão solicitados (renomeado de 'scope' para 'scopes' na v6, e é um array)
                    "scopes": ["email", "profile", "openid", "aws.cognito.signin.user.admin"]
                }
            }
        }
    },
    // Se você tiver uma API Gateway customizada (não gerenciada pelo Amplify),
    // você pode configurá-la aqui para facilitar a importação no api.js
    "API": {
        "endpoints": [
            {
                "name": "NomeAPIGW", // Nome da sua API, ajuste conforme seu projeto
                "endpoint": "https://XYZ.execute-api.REGIAO_AWS.amazonaws.com/STAGE", // Seu endpoint de API Gateway
                "region": "REGIAO_AWS"
            }
        ]
    },
    // Configurações da categoria Storage
    "Storage": {
        "bucket": "NomeBUCKET", // Seu bucket S3
        "region": "REGIAO_AWS" // Sua região
    }
};

export default awsExp;
