/**
 * Gerencia a interface e a lógica para login, cadastro, confirmação de usuário e
 * definição de nova senha no primeiro login, usando o AWS Cognito.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cognitoSignIn, cognitoSignUp, cognitoConfirmSignUp, cognitoCompleteNewPassword } from '../services/authService';
import { APP_CONFIG, USER_ROLES } from '../constants/appConstants';
import icone from '../assets/icone.png';

function Login() {
  // Estados do formulário
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Estados de controle da UI
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const { isAuthenticated, userRole, loading } = useAuth();
  const navigate = useNavigate();

  // Redireciona se já estiver logado
  useEffect(() => {
    if (!loading && isAuthenticated) {
      const path = userRole === USER_ROLES.ADMIN ? APP_CONFIG.DEFAULT_ADMIN_PATH : APP_CONFIG.DEFAULT_USER_PATH;
      navigate(path, { replace: true });
    }
  }, [isAuthenticated, userRole, loading, navigate]);

  // Handler principal do formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (isChangingPassword) handleCompleteNewPassword();
    else if (isConfirming) handleConfirmSignUp();
    else if (isSigningUp) handleSignUp();
    else handleSignIn();
  };

  // Lógica de Login
  const handleSignIn = async () => {
    try {
      const result = await cognitoSignIn(username, password);
      if (result !== true) { // Se não for sucesso direto, é um desafio
        setMessage('Você precisa definir uma nova senha.');
        setIsChangingPassword(true);
      }
      // O redirecionamento em caso de sucesso é tratado pelo useEffect
    } catch (err) {
      setError(err.message || 'Erro ao fazer login.');
    }
  };
  
  // Lógica de Cadastro
  const handleSignUp = async () => {
    try {
      const result = await cognitoSignUp(username, password, email);
      if (result.needsConfirmation) {
        setIsConfirming(true);
        setMessage('Verifique seu email para o código de confirmação.');
      } else {
        setMessage('Cadastro bem-sucedido! Você pode fazer login.');
        setIsSigningUp(false);
      }
    } catch (err) {
      setError(err.message || 'Erro ao cadastrar.');
    }
  };

  // Lógica de Confirmação de Cadastro
  const handleConfirmSignUp = async () => {
    try {
      await cognitoConfirmSignUp(username, confirmationCode);
      setMessage('Conta confirmada! Faça login.');
      setIsConfirming(false);
      setIsSigningUp(false);
    } catch (err) {
      setError(err.message || 'Erro ao confirmar código.');
    }
  };

  // Lógica para definir nova senha
  const handleCompleteNewPassword = async () => {
    try {
      await cognitoCompleteNewPassword(newPassword);
      setMessage('Senha alterada! Faça login com sua nova senha.');
      setIsChangingPassword(false);
      setPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.message || 'Erro ao definir a nova senha.');
    }
  };

  // Alterna entre os formulários
  const toggleForm = (form) => {
    setIsSigningUp(form === 'signup');
    setIsConfirming(form === 'confirm');
    setIsChangingPassword(false);
    setError('');
    setMessage('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-900 rounded-2xl border border-gray-800 shadow-xl">
        <div className="text-center">
          <img src={icone} alt="Logo" className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white">
            {isChangingPassword ? 'Definir Nova Senha' : isConfirming ? 'Confirmar Cadastro' : isSigningUp ? 'Cadastre-se' : 'Bem-vindo!'}
          </h1>
          <p className="text-gray-400">
            {isChangingPassword ? 'Crie uma senha segura.' : 'Faça login ou cadastre-se para continuar'}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          {message && <p className="text-sm text-green-500 text-center">{message}</p>}

          {isChangingPassword ? (
            <input type="password" placeholder="Nova Senha" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full p-3 bg-gray-800 rounded-lg text-white placeholder-gray-500 border-none focus:outline-none caret-white login-input" />
          ) : isConfirming ? (
            <>
              <input type="text" placeholder="Nome de Usuário" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full p-3 bg-gray-800 rounded-lg text-white placeholder-gray-500 border-none focus:outline-none caret-white login-input" />
              <input type="text" placeholder="Código de Confirmação" value={confirmationCode} onChange={(e) => setConfirmationCode(e.target.value)} required className="w-full p-3 bg-gray-800 rounded-lg text-white placeholder-gray-500 border-none focus:outline-none caret-white login-input" />
            </>
          ) : (
            <>
              <input type="text" placeholder="Nome de Usuário" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full p-3 bg-gray-800 rounded-lg text-white placeholder-gray-500 border-none focus:outline-none caret-white login-input" />
              <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 bg-gray-800 rounded-lg text-white placeholder-gray-500 border-none focus:outline-none caret-white login-input" />
              {isSigningUp && (
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 bg-gray-800 rounded-lg text-white placeholder-gray-500 border-none focus:outline-none caret-white login-input" />
              )}
            </>
          )}

          <button type="submit" className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105">
            {isChangingPassword ? 'Salvar' : isConfirming ? 'Confirmar' : isSigningUp ? 'Cadastrar' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-sm text-center">
          {isSigningUp || isConfirming || isChangingPassword ? (
             <p>Já tem uma conta? <button onClick={() => toggleForm('login')} className="font-medium text-indigo-400 hover:text-indigo-300">Faça Login</button></p>
          ) : (
            <p>Não tem uma conta? <button onClick={() => toggleForm('signup')} className="font-medium text-indigo-400 hover:text-indigo-300">Cadastre-se</button></p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;