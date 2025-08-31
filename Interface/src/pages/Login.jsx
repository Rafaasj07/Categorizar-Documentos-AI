/**
 * Gerencia a interface e a lógica para login, cadastro, confirmação de usuário e
 * definição de nova senha no primeiro login, usando o AWS Cognito.
 */
// Importa os hooks 'useState' e 'useEffect' do React.
import { useState, useEffect } from 'react';
// Importa o hook 'useNavigate' para redirecionamento de páginas.
import { useNavigate } from 'react-router-dom';
// Importa o hook customizado 'useAuth' para acessar o contexto de autenticação.
import { useAuth } from '../context/AuthContext';
// Importa as funções de serviço que interagem com o AWS Cognito.
import { cognitoSignIn, cognitoSignUp, cognitoConfirmSignUp, cognitoCompleteNewPassword } from '../services/authService';
// Importa as constantes de configuração da aplicação.
import { APP_CONFIG, USER_ROLES } from '../constants/appConstants';
// Importa o ícone da aplicação.
import icone from '../assets/icone.png';

// Define o componente da página de Login.
function Login() {
  // --- Estados para armazenar os dados dos campos do formulário ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // --- Estados para controlar qual formulário é exibido na tela ---
  const [isSigningUp, setIsSigningUp] = useState(false); // true = formulário de cadastro
  const [isConfirming, setIsConfirming] = useState(false); // true = formulário de confirmação de código
  const [isChangingPassword, setIsChangingPassword] = useState(false); // true = formulário de nova senha
  const [error, setError] = useState(''); // Armazena mensagens de erro.
  const [message, setMessage] = useState(''); // Armazena mensagens de sucesso/informativas.
  
  // Obtém dados do contexto de autenticação e a função de navegação.
  const { isAuthenticated, userRole, loading } = useAuth();
  const navigate = useNavigate();

  // Efeito que roda para redirecionar o usuário se ele já estiver logado.
  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Define a rota de destino com base no papel do usuário (admin ou comum).
      const path = userRole === USER_ROLES.ADMIN ? APP_CONFIG.DEFAULT_ADMIN_PATH : APP_CONFIG.DEFAULT_USER_PATH;
      navigate(path, { replace: true }); // Navega para a página principal.
    }
  }, [isAuthenticated, userRole, loading, navigate]);

  // Função principal que é chamada quando o formulário é enviado.
  const handleSubmit = (e) => {
    e.preventDefault(); // Impede o recarregamento da página.
    // Limpa mensagens anteriores.
    setError('');
    setMessage('');

    // Decide qual função de autenticação chamar com base no estado atual da UI.
    if (isChangingPassword) handleCompleteNewPassword();
    else if (isConfirming) handleConfirmSignUp();
    else if (isSigningUp) handleSignUp();
    else handleSignIn();
  };

  // Lida com a tentativa de login.
  const handleSignIn = async () => {
    try {
      const result = await cognitoSignIn(username, password);
      // Se o login exige uma nova senha (primeiro acesso).
      if (result !== true) {
        setMessage('Você precisa definir uma nova senha.');
        setIsChangingPassword(true);
      }
      // Se o login for bem-sucedido, o 'useEffect' acima fará o redirecionamento.
    } catch (err) {
      setError(err.message || 'Erro ao fazer login.');
    }
  };
  
  // Lida com a tentativa de cadastro de um novo usuário.
  const handleSignUp = async () => {
    try {
      const result = await cognitoSignUp(username, password, email);
      // Se o cadastro precisa de um código de confirmação enviado por e-mail.
      if (result.needsConfirmation) {
        setIsConfirming(true);
        setMessage('Verifique seu email para o código de confirmação.');
      } else {
        // Se a confirmação não for necessária.
        setMessage('Cadastro bem-sucedido! Você pode fazer login.');
        setIsSigningUp(false);
      }
    } catch (err) {
      setError(err.message || 'Erro ao cadastrar.');
    }
  };

  // Lida com a confirmação do cadastro usando o código do e-mail.
  const handleConfirmSignUp = async () => {
    try {
      await cognitoConfirmSignUp(username, confirmationCode);
      setMessage('Conta confirmada! Faça login.');
      // Reseta os formulários para a tela de login.
      setIsConfirming(false);
      setIsSigningUp(false);
    } catch (err) {
      setError(err.message || 'Erro ao confirmar código.');
    }
  };

  // Lida com a definição de uma nova senha.
  const handleCompleteNewPassword = async () => {
    try {
      await cognitoCompleteNewPassword(newPassword);
      setMessage('Senha alterada! Faça login com sua nova senha.');
      // Reseta os formulários para a tela de login e limpa os campos de senha.
      setIsChangingPassword(false);
      setPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.message || 'Erro ao definir a nova senha.');
    }
  };

  // Função para alternar entre as telas de login, cadastro e confirmação.
  const toggleForm = (form) => {
    setIsSigningUp(form === 'signup');
    setIsConfirming(form === 'confirm');
    setIsChangingPassword(false);
    // Limpa as mensagens ao trocar de formulário.
    setError('');
    setMessage('');
  };

  // Retorna a estrutura JSX (HTML) da página de login.
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-900 rounded-2xl border border-gray-800 shadow-xl">
        <div className="text-center">
          <img src={icone} alt="Logo" className="w-24 h-24 mx-auto mb-4" />
          {/* O título da página muda de acordo com o formulário ativo. */}
          <h1 className="text-3xl font-bold text-white">
            {isChangingPassword ? 'Definir Nova Senha' : isConfirming ? 'Confirmar Cadastro' : isSigningUp ? 'Cadastre-se' : 'Bem-vindo!'}
          </h1>
          <p className="text-gray-400">
            {isChangingPassword ? 'Crie uma senha segura.' : 'Faça login ou cadastre-se para continuar'}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Exibe mensagens de erro ou sucesso. */}
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          {message && <p className="text-sm text-green-500 text-center">{message}</p>}

          {/* Renderiza os campos de input de acordo com o formulário ativo. */}
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
              {/* O campo de e-mail só aparece no formulário de cadastro. */}
              {isSigningUp && (
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 bg-gray-800 rounded-lg text-white placeholder-gray-500 border-none focus:outline-none caret-white login-input" />
              )}
            </>
          )}

          {/* Botão de envio do formulário, com texto dinâmico. */}
          <button type="submit" className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105">
            {isChangingPassword ? 'Salvar' : isConfirming ? 'Confirmar' : isSigningUp ? 'Cadastrar' : 'Entrar'}
          </button>
        </form>

        {/* Links para alternar entre as telas de login e cadastro. */}
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

// Exporta o componente para ser usado em outras partes da aplicação.
export default Login;