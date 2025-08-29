const awsExports = {
    "Auth": {
        "Cognito": {
            "userPoolId": "us-east-1_1LupqCAD1",
            "userPoolClientId": "6vdcq3882dqe4a8rssm6neasl1", 
            "region": "us-east-1",
            "loginWith": {
                "oauth": {
                    "domain": "categorizar-documentos-ai.auth.us-east-1.amazoncognito.com", 
                    "redirectSignIn": [
                        "http://localhost:5173/"
                    ],
                    "redirectSignOut": [
                        "http://localhost:5173/"
                    ],
                    "responseType": "code",
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
                "name": "MinhaAPIDeDocumentos",
                "endpoint": "http://localhost:3001/api/", 
                "region": "us-east-1"
            }
        ]
    },
    "Storage": {
        "bucket": "categorizar-docs-grupo1",
        "region": "us-east-1"
    }
};

export default awsExports;