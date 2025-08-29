/**
 * Abstrai as interações com o AWS Amplify para autenticação, fornecendo
 * uma camada de serviço limpa para os componentes da UI.
 */

import { signIn, signOut, signUp, confirmSignUp, confirmSignIn } from 'aws-amplify/auth';

/**
 * Tenta autenticar o usuário com username e password.
 * Lida com o desafio de nova senha no primeiro login.
 */
export const cognitoSignIn = async (username, password) => {
  try {
    const result = await signIn({ username, password });
    if (result.nextStep && result.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
      return result; // Retorna o objeto de resultado para o componente Login lidar com a troca de senha
    }
    return true; // Login bem-sucedido
  } catch (error) {
    console.error("Erro no serviço de login:", error);
    throw error; // Propaga o erro para ser tratado na UI
  }
};

/**
 * Registra um novo usuário.
 */
export const cognitoSignUp = async (username, password, email) => {
  try {
    const result = await signUp({
      username,
      password,
      options: { userAttributes: { email } }
    });
    return result.isSignUpComplete ? { needsConfirmation: false } : { needsConfirmation: true };
  } catch (error) {
    console.error("Erro no serviço de cadastro:", error);
    throw error;
  }
};

/**
 * Confirma o cadastro de um usuário com o código enviado por e-mail.
 */
export const cognitoConfirmSignUp = async (username, confirmationCode) => {
  try {
    await confirmSignUp({ username, confirmationCode });
    return true;
  } catch (error) {
    console.error("Erro no serviço de confirmação:", error);
    throw error;
  }
};

/**
 * Finaliza o processo de login quando o usuário precisa definir uma nova senha.
 */
export const cognitoCompleteNewPassword = async (newPassword) => {
  try {
    await confirmSignIn({ challengeResponse: newPassword });
    return true;
  } catch (error) {
    console.error("Erro ao definir nova senha:", error);
    throw error;
  }
};

/**
 * Desloga o usuário.
 */
export const cognitoSignOut = async () => {
    try {
        await signOut();
    } catch (error) {
        console.error('Erro no serviço de logout:', error);
        throw error;
    }
};