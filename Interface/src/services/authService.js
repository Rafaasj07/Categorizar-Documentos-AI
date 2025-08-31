/**
 * Abstrai as interações com o AWS Amplify para autenticação, fornecendo
 * uma camada de serviço limpa para os componentes da UI.
 */

// Importa as funções de autenticação necessárias da biblioteca AWS Amplify.
import { signIn, signOut, signUp, confirmSignUp, confirmSignIn } from 'aws-amplify/auth';

/**
 * Tenta autenticar um usuário com nome de usuário e senha.
 * Lida com o caso especial em que o usuário precisa definir uma nova senha no primeiro login.
 */
export const cognitoSignIn = async (username, password) => {
  try {
    // Chama a função de login do Amplify.
    const result = await signIn({ username, password });
    // Verifica se o próximo passo é a confirmação de uma nova senha.
    if (result.nextStep && result.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
      // Retorna o resultado para que a UI possa lidar com a troca de senha.
      return result;
    }
    // Se não houver passos adicionais, o login foi um sucesso.
    return true;
  } catch (error) {
    // Em caso de erro, exibe no console e lança o erro para a UI tratar.
    console.error("Erro no serviço de login:", error);
    throw error;
  }
};

/**
 * Registra um novo usuário no sistema.
 */
export const cognitoSignUp = async (username, password, email) => {
  try {
    // Chama a função de cadastro do Amplify, passando os dados do usuário.
    const result = await signUp({
      username,
      password,
      options: { userAttributes: { email } }
    });
    // Retorna se o cadastro precisa de confirmação por e-mail ou não.
    return result.isSignUpComplete ? { needsConfirmation: false } : { needsConfirmation: true };
  } catch (error) {
    // Em caso de erro, exibe no console e lança o erro.
    console.error("Erro no serviço de cadastro:", error);
    throw error;
  }
};

/**
 * Confirma o cadastro de um novo usuário usando o código enviado por e-mail.
 */
export const cognitoConfirmSignUp = async (username, confirmationCode) => {
  try {
    // Chama a função de confirmação de cadastro do Amplify.
    await confirmSignUp({ username, confirmationCode });
    return true; // Retorna sucesso.
  } catch (error) {
    // Em caso de erro, exibe no console e lança o erro.
    console.error("Erro no serviço de confirmação:", error);
    throw error;
  }
};

/**
 * Finaliza o processo de login quando um usuário precisa definir uma nova senha.
 */
export const cognitoCompleteNewPassword = async (newPassword) => {
  try {
    // Envia a nova senha para o Amplify para completar o desafio de login.
    await confirmSignIn({ challengeResponse: newPassword });
    return true; // Retorna sucesso.
  } catch (error) {
    // Em caso de erro, exibe no console e lança o erro.
    console.error("Erro ao definir nova senha:", error);
    throw error;
  }
};

/**
 * Desloga o usuário do sistema.
 */
export const cognitoSignOut = async () => {
    try {
        // Chama a função de logout do Amplify.
        await signOut();
    } catch (error) {
        // Em caso de erro, exibe no console e lança o erro.
        console.error('Erro no serviço de logout:', error);
        throw error;
    }
};