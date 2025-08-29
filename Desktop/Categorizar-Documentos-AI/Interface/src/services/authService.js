/**
 * services/authService.js
 * * Função Principal:
 * Este arquivo agrupa todas as funções relacionadas à autenticação de usuários
 * com o AWS Cognito. Ele abstrai a complexidade da SDK do AWS Amplify,
 * fornecendo métodos simples e diretos para login, logout, registro e
 * verificação do usuário atual.
 */

// Importa todas as funções de autenticação necessárias da v6+ do Amplify
import { signIn, signOut, signUp, confirmSignUp, getCurrentUser, fetchAuthSession, confirmSignIn } from 'aws-amplify/auth';

export const cognitoSignIn = async (username, password) => {
  console.log("Tentando login com username:", username);
  try {
    // A função signIn agora retorna o objeto de resultado completo
    const result = await signIn({ username, password });
    console.log('Tentativa de login:', result);

    // Se o login não estiver completo, significa que há um próximo passo (como troca de senha)
    if (!result.isSignedIn) {
      // Retorna o objeto de resultado completo para o componente Login decidir o que fazer
      return result;
    }
    
    // Se o login foi bem-sucedido diretamente, retorna true
    return true;
  } catch (error) {
    console.error("Erro ao tentar login:", error);
    // Mapeia erros comuns para mensagens mais amigáveis
    if (error.name === 'UserNotFoundException') {
      throw new Error('Usuário não encontrado. Verifique o nome de usuário.');
    } else if (error.name === 'NotAuthorizedException') {
      throw new Error('Credenciais inválidas.');
    } else if (error.name === 'UserNotConfirmedException') {
      throw new Error('Usuário não confirmado. Por favor, confirme seu cadastro.');
    }
    // Propaga outros erros para serem tratados na UI
    throw error;
  }
};

// Retorna informações do usuário logado
export const cognitoGetCurrentUser = async () => {
  try {
    // getCurrentUser retorna o ID do usuário e detalhes do login
    const { userId, signInDetails } = await getCurrentUser();
    // fetchAuthSession retorna os tokens (incluindo o JWT)
    const session = await fetchAuthSession();
    return { userId, signInDetails, tokens: session.tokens };
  } catch (error) {
    console.info("Não foi possível obter o usuário atual:", error);
    return null; // Retorna nulo se não houver usuário logado
  }
};

// Realiza o logout do usuário
export const cognitoSignOut = async () => {
  try {
    await signOut();
    console.log('Logout bem-sucedido');
  } catch (error) {
    console.error('Erro no logout:', error);
    throw error;
  }
};

// Registra um novo usuário
export const cognitoSignUp = async (username, password, email) => {
  try {
    const { isSignUpComplete, nextStep } = await signUp({
      username,
      password,
      options: {
        userAttributes: {
          email: email,
        },
      }
    });
    console.log('Resultado do cadastro:', { isSignUpComplete, nextStep });

    if (!isSignUpComplete) {
      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        return { needsConfirmation: true, message: 'Confirmação necessária. Verifique seu email para o código.' };
      }
      throw new Error(`Cadastro não concluído. Próximo passo: ${nextStep.signUpStep}`);
    }
    return { needsConfirmation: false, message: 'Cadastro bem-sucedido!' };
  } catch (error) {
    console.error('Erro no signUp (authService):', error);
    if (error.name === 'UsernameExistsException') {
      throw new Error('Nome de usuário já existe. Tente fazer login ou escolha outro nome.');
    }
    throw error;
  }
};

// Confirma o registro do usuário com um código
export const cognitoConfirmSignUp = async (username, confirmationCode) => {
  try {
    await confirmSignUp({ username, confirmationCode });
    return true; // Confirmação bem-sucedida
  } catch (error) {
    console.error('Erro no confirmSignUp (authService):', error);
    if (error.name === 'CodeMismatchException') {
      throw new Error('Código de confirmação inválido.');
    } else if (error.name === 'ExpiredCodeException') {
      throw new Error('Código de confirmação expirado. Peça um novo código.');
    }
    throw error;
  }
};

// Completa o fluxo de login definindo uma nova senha
export const cognitoCompleteNewPassword = async (newPassword) => {
  try {
    // A função confirmSignIn é usada para completar desafios, como a troca de senha.
    // O Amplify gerencia o objeto de usuário internamente após a primeira chamada de signIn.
    const { isSignedIn } = await confirmSignIn({
      challengeResponse: newPassword,
    });
    return isSignedIn;
  } catch (error) {
    console.error("Erro ao definir a nova senha:", error);
    throw error;
  }
};