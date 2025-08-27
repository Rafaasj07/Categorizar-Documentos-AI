// Embora permita SignUp, não será colocado no front

import { signIn, signOut, confirmSignUp, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth'; //adaptado para v6+


export const cognitoSignIn = async (username, password) => {
  console.log("Tentando login com username:", username);
  console.log("Tentando login com password (cuidado para não logar senhas em produção):", password);
    try {
        const { user } = await signIn({ username, password });
        console.log('Tentativa de login: ', { isSignedIn, nextStep });
    if (!isSignedIn) {
      // Lida com cenários como MFA, ou necessidade de confirmação de e-mail/telefone
      if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        throw new Error('Usuário precisa ser confirmado. Verifique seu e-mail para o código.');
      } else if (nextStep.signInStep === 'CONFIRM_MFA') {
        throw new Error('MFA requerido. Implemente a confirmação de MFA.');
      }
      // Outros possíveis nextStep.signInStep: RESET_PASSWORD, UPDATE_USER_ATTRIBUTES, etc.
      throw new Error(`Login não concluído. Próximo passo: ${nextStep.signInStep}`);
    }
    return true; // Login bem-sucedido
  } catch (error) {
    console.error("Erro ao tentar login:", error);
    // Erros específicos do Cognito que você pode querer mapear para mensagens amigáveis
    if (error.name === 'UserNotFoundException') {
      throw new Error('Usuário não encontrado. Verifique o nome de usuário.');
    } else if (error.name === 'NotAuthorizedException') {
      throw new Error('Credenciais inválidas.');
    } else if (error.name === 'UserNotConfirmedException') {
        throw new Error('Usuário não confirmado. Por favor, confirme seu e-mail/telefone.');
    }
    throw error; // Propaga outros erros
  }
};

// Em v6, getCurrentUser retorna um objeto com 'username' e 'userId'
export const cognitoGetCurrentUser = async () => {
    try {
        const { userId, signInDetails } = await getCurrentUser();
        const { tokens } = await fetchAuthSession();
        return  { userId, signInDetails, tokens };
    } catch (error) {
        // Usuário não autenticado ou erro
        console.error("Error getting current user:", error);
        return null;
    }
};

export const cognitoSignOut = async () => {
    try {
        await signOut();
        console.log('Logout bem-sucedido');
    } catch (error) {
        console.error('Erro no logout:', error);
        throw error;
    }
};

export const cognitoSignUp = async (username, password, email) => {
  try {
    const { isSignUpComplete, nextStep } = await signUp({
      username,
      password,
      options: {
        userAttributes: {
          email: email,
        },
        // optional: clientMetadata: { myCustomKey: 'myCustomValue' }
      }
    });
    console.log('Sign up attempt:', { isSignUpComplete, nextStep });

    if (!isSignUpComplete) {
      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        return { needsConfirmation: true, message: 'Confirmação necessária. Verifique seu email para o código.' };
      }
      throw new Error(`Cadastro não concluído. Próximo passo: ${nextStep.signUpStep}`);
    }
    return { needsConfirmation: false, message: 'Cadastro bem-sucedido!' };
  } catch (error) {
    console.error('Erro no signUp (authService):', error);
    // Mapeie erros comuns como UsernameExistsException
    if (error.name === 'UsernameExistsException') {
      throw new Error('Nome de usuário já existe. Tente fazer login ou escolha outro nome.');
    }
    throw error;
  }
};


export const cognitoConfirmSignUp = async (username, code) => {
  try {
    await confirmSignUp({ username, confirmationCode });
    return true; // Confirmação bem-sucedida
  } catch (error) {
    console.error('Erro no confirmSignUp (authService):', error);
    // Mapeie erros comuns como CodeMismatchException, ExpiredCodeException
    if (error.name === 'CodeMismatchException') {
      throw new Error('Código de confirmação inválido.');
    } else if (error.name === 'ExpiredCodeException') {
      throw new Error('Código de confirmação expirado. Peça um novo código.');
    }
    throw error;
  }
};
