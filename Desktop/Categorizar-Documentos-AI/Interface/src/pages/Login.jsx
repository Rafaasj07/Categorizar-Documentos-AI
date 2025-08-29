import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cognitoSignIn, cognitoSignUp, cognitoConfirmSignUp, cognitoCompleteNewPassword } from '../services/authService';
import { APP_CONFIG, USER_ROLES } from '../constants/appConstants';

/**
 * pages/Login.jsx
 * * Função Principal:
 * Gerencia a interface e a lógica para login, cadastro, confirmação de usuário e
 * definição de nova senha no primeiro login.
 * Redireciona usuários já autenticados para a página apropriada.
 * * Estilização:
 * Utiliza Tailwind CSS para um design limpo e responsivo.
 */
function Login() {
  // --- Estados para os campos do formulário ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // --- Estados para controlar o fluxo da UI ---
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // --- Estados para mensagens e dados temporários ---
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [cognitoUser, setCognitoUser] = useState(null); // Guarda o objeto do usuário durante a troca de senha

  const { isAuthenticated, userRole, loading } = useAuth();
  const navigate = useNavigate();

  // Redireciona o usuário se ele já estiver logado
  useEffect(() => {
    if (!loading && isAuthenticated) {
      const path = userRole === USER_ROLES.ADMIN
        ? APP_CONFIG.DEFAULT_ADMIN_PATH
        : APP_CONFIG.DEFAULT_USER_PATH;
      navigate(path, { replace: true });
    }
  }, [isAuthenticated, userRole, loading, navigate]);

  // Função central que decide qual ação tomar ao submeter o formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (isChangingPassword) {
      handleCompleteNewPassword();
    } else if (isConfirming) {
      handleConfirmSignUp();
    } else if (isSigningUp) {
      handleSignUp();
    } else {
      handleSignIn();
    }
  };

  // Lida com a tentativa de login
  const handleSignIn = async () => {
    try {
      const result = await cognitoSignIn(username, password);
      
      // Verifica se o Cognito exige um passo adicional
      if (result && result.nextStep && result.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setMessage('Você precisa definir uma nova senha para continuar.');
        setCognitoUser(result.user); // Guarda o objeto do usuário retornado pelo Cognito
        setIsChangingPassword(true); // Ativa a UI de troca de senha
      }
      // Se o login for bem-sucedido (result === true), o useEffect cuidará do redirecionamento
    } catch (err) {
      setError(err.message || 'Erro ao fazer login.');
    }
  };
  
  // Lida com a criação de uma nova conta
  const handleSignUp = async () => {
    try {
      const result = await cognitoSignUp(username, password, email);
      if (result.needsConfirmation) {
        setIsConfirming(true);
        setMessage(result.message || 'Verifique seu email para o código de confirmação.');
      } else {
        setMessage(result.message || 'Cadastro bem-sucedido! Você pode fazer login.');
        setIsSigningUp(false);
      }
    } catch (err) {
      setError(err.message || 'Erro ao cadastrar.');
    }
  };

  // Lida com a confirmação do código de cadastro
  const handleConfirmSignUp = async () => {
    try {
      await cognitoConfirmSignUp(username, confirmationCode);
      setMessage('Conta confirmada com sucesso! Faça login.');
      setIsConfirming(false);
      setIsSigningUp(false);
      setPassword('');
      setEmail('');
      setConfirmationCode('');
    } catch (err) {
      setError(err.message || 'Erro ao confirmar código.');
    }
  };

  // Lida com o envio da nova senha para o Cognito
const handleCompleteNewPassword = async () => {
    try {
      await cognitoCompleteNewPassword(newPassword);
      setMessage('Senha alterada com sucesso! Faça o login com sua nova senha.');
      setIsChangingPassword(false);
      setCognitoUser(null);
      setPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.message || 'Erro ao definir a nova senha.');
    }
};

  // Alterna entre os formulários de login, cadastro e confirmação
  const toggleForm = (form) => {
    setIsSigningUp(form === 'signup');
    setIsConfirming(form === 'confirm');
    setIsChangingPassword(false); // Garante que a troca de senha seja resetada
    setError('');
    setMessage('');
  };

  if (loading || isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <h1>Carregando...</h1>
      </div>
    );
  }

  const inputBaseClasses = "w-full p-2.5 mb-4 border border-gray-300 rounded-md text-base focus:ring-2 focus:ring-blue-500 outline-none";
  const buttonBaseClasses = "w-full py-3 bg-blue-600 text-white border-none rounded-md text-lg cursor-pointer transition-colors hover:bg-blue-700";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 font-sans p-4">
      <div className="bg-white p-8 md:p-10 rounded-lg shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">
          {isChangingPassword ? 'Definir Nova Senha' : isConfirming ? 'Confirmar Cadastro' : isSigningUp ? 'Cadastre-se' : 'Fazer Login'}
        </h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {message && <p className="text-green-600 mb-4">{message}</p>}

        <form onSubmit={handleSubmit}>
          {isChangingPassword ? (
            <>
              <input type="password" placeholder="Nova Senha" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className={inputBaseClasses} />
              <button type="submit" className={buttonBaseClasses}>Salvar Nova Senha</button>
            </>
          ) : isConfirming ? (
            <>
              <input type="text" placeholder="Nome de Usuário" value={username} onChange={(e) => setUsername(e.target.value)} required className={inputBaseClasses} />
              <input type="text" placeholder="Código de Confirmação" value={confirmationCode} onChange={(e) => setConfirmationCode(e.target.value)} required className={inputBaseClasses} />
              <button type="submit" className={buttonBaseClasses}>Confirmar</button>
            </>
          ) : (
            <>
              <input type="text" placeholder="Nome de Usuário" value={username} onChange={(e) => setUsername(e.target.value)} required className={inputBaseClasses} />
              <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputBaseClasses} />
              {isSigningUp && (
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputBaseClasses} />
              )}
              <button type="submit" className={buttonBaseClasses}>
                {isSigningUp ? 'Cadastrar' : 'Entrar'}
              </button>
            </>
          )}
        </form>

        <div className="mt-6 text-sm">
          {isConfirming || isChangingPassword ? (
            <button onClick={() => toggleForm('login')} className="text-blue-600 hover:underline">Voltar para Login</button>
          ) : isSigningUp ? (
            <p>Já tem uma conta? <button onClick={() => toggleForm('login')} className="text-blue-600 hover:underline">Faça Login</button></p>
          ) : (
            <p>Não tem uma conta? <button onClick={() => toggleForm('signup')} className="text-blue-600 hover:underline">Cadastre-se</button></p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
