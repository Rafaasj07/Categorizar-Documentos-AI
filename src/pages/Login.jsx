import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importe o useAuth
import { cognitoSignIn, cognitoSignUp, cognitoConfirmSignUp } from '../services/authService';
import { APP_CONFIG, USER_ROLES } from '../constants/appConstants'; 

// Usará authService para o capturar credenciais e interagir com back de authN
// e o AuthContext para verificar o estado de authN e redirecionar o logout

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false); // Estado para alternar entre login e cadastro
  const [isConfirming, setIsConfirming] = useState(false); // Estado para tela de confirmação
  const [error, setError] = useState('');
  const [message, setMessage] = useState(''); 
  
  const { isAuthenticated, userRole, loading } = useAuth(); // Obtém o estado de autenticação do contexto
  const navigate = useNavigate();

  // Redireciona o usuário se ele já estiver logado
  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (userRole === USER_ROLES.ADMIN) {
        navigate(APP_CONFIG.DEFAULT_ADMIN_PATH, { replace: true });
      } else {
        navigate(APP_CONFIG.DEFAULT_USER_PATH, { replace: true });
      }
    }
  }, [isAuthenticated, userRole, loading, navigate]); // Dependências do useEffect

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await cognitoSignIn(username, password);
      console.log("Tentando login com username:", username);
      console.log("Tentando login com password (cuidado para não logar senhas em produção):", password)
      // O useEffect acima lidará com o redirecionamento após o sucesso do login.
    } catch (err) {
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
      console.error("Erro no login:", err);
    }
  };

  const handleSignUp = async (e) => {
    try {
      const result = await cognitoSignUp(username, password, email);
      if (result.needsConfirmation) {
        setIsConfirming(true);
        setMessage(result.message || 'Usuário cadastrado com sucesso! Verifique seu email para o código de confirmação.');
      } else {
        setMessage(result.message || 'Cadastro bem-sucedido! Você pode fazer login agora.');
        setIsSigningUp(false); // Volta para a tela de login
        setUsername(''); // Limpa campos
        setPassword('');
        setEmail('');
      }
    } catch (err) {
      setError(err.message || 'Erro ao cadastrar. Tente novamente.');
      console.error("Erro no cadastro:", err);
    }
  };

  const handleConfirmSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await cognitoConfirmSignUp(username, confirmationCode);
      setMessage('Conta confirmada com sucesso! Faça login.');
      setIsConfirming(false);
      setIsSigningUp(false); // Garante volta para formulário de login
      setUsername('');
      setPassword('');
      setEmail('');
      setConfirmationCode('');
    } catch (err) {
      setError(err.message || 'Erro ao confirmar código. Verifique e tente novamente.');
      console.error("Erro na confirmação:", err);
    }
  };

  // Funções para alternar entre as telas de login e cadastro; confirmação é feita no handleSignUp
  const toggleToSignUp = () => {
    setIsSigningUp(true);
    setIsConfirming(false);
    setError('');
    setMessage('');
  };

  const toggleToSignIn = () => {
    setIsSigningUp(false);
    setIsConfirming(false);
    setError('');
    setMessage('');
  };

  // Exibe um carregamento enquanto verifica o status de autenticação inicial
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Carregando autenticação...</h1>
      </div>
    );
  }

  // Se o usuário já estiver logado, não renderiza o formulário de login, pois o useEffect já o redirecionará
  if (isAuthenticated) {
    return null;
  }

  // Return que lidará com Cadastro
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <h1>{isConfirming ? 'Confirmar Cadastro' : (isSigningUp ? 'Cadastre-se' : 'Fazer Login')}</h1>
        {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}
        {message && <p style={{ color: 'green', marginBottom: '15px' }}>{message}</p>}

        {isConfirming ? (
          <form onSubmit={handleConfirmSignUp}>
            <input
              type="text"
              placeholder="Nome de Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Código de Confirmação"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              required
              style={inputStyle}
            />
            <button type="submit" style={buttonStyle}>Confirmar</button>
            <p style={{ marginTop: '15px' }}>
              <a href="#" onClick={toggleToSignIn} style={{ color: '#007bff', textDecoration: 'none' }}>Voltar para Login</a>
            </p>
          </form>
        ) : (
          <form onSubmit={isSigningUp ? handleSignUp : handleSignIn}>
            <input
              type="text"
              placeholder="Nome de Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
            {isSigningUp && (
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
              />
            )}
            <button type="submit" style={buttonStyle}>
              {isSigningUp ? 'Cadastrar' : 'Entrar'}
            </button>
          </form>
        )}

        {!isConfirming && (
          <p style={{ marginTop: '20px' }}>
            {isSigningUp ? (
              <>Já tem uma conta? <a href="#" onClick={toggleToSignIn} style={{ color: '#007bff', textDecoration: 'none' }}>Faça Login</a></>
            ) : (
              <>Não tem uma conta? <a href="#" onClick={toggleToSignUp} style={{ color: '#007bff', textDecoration: 'none' }}>Cadastre-se</a></>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

// Estilos básicos para o formulário (pode ser movido para index.css)
const inputStyle = {
  width: 'calc(100% - 20px)',
  padding: '10px',
  marginBottom: '15px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '16px',
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '18px',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
};

export default Login;