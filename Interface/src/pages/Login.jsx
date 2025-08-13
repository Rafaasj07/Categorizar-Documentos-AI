import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import icone from '../assets/icone.png';

const Login = () => {
  // --- Estados do formulário ---
  const [email, setEmail] = useState(''); // E-mail digitado
  const [password, setPassword] = useState(''); // Senha digitada
  const [error, setError] = useState(''); // Mensagem de erro
  const navigate = useNavigate(); // Hook para navegação

  // --- Usuários fixos para login ---
  const users = {
    'admin@email.com': { password: 'admin', role: 'admin' },
    'user@email.com': { password: 'user', role: 'user' },
  };

  // --- Função para tratar login ---
  const handleLogin = (e) => {
    e.preventDefault(); // Evita reload da página
    setError(''); // Limpa erro
    const user = users[email]; // Procura usuário

    if (user && user.password === password) {
      // Login válido
      localStorage.setItem('authToken', 'fake-token'); // Armazena token fictício
      localStorage.setItem('userRole', user.role); // Salva role

      // Redireciona de acordo com o tipo de usuário
      const targetPath = user.role === 'admin' ? '/admin' : '/categorizar';
      navigate(targetPath);
    } else {
      setError('E-mail ou senha inválidos.'); // Login inválido
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-900 rounded-2xl border border-gray-800 shadow-xl">
        {/* Cabeçalho com logo e título */}
        <div className="text-center">
          <img src={icone} alt="Logo" className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white">Bem-vindo!</h1>
          <p className="text-gray-400">Faça login para continuar</p>
        </div>

        {/* Formulário de login */}
        <form className="space-y-6" onSubmit={handleLogin}>
          {/* Input de E-mail */}
          <div>
            <label htmlFor="email" className="text-sm font-bold text-gray-400 block mb-2">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@email.com ou user@email.com"
              className="w-full p-3 bg-gray-800 rounded-lg text-white placeholder-gray-500
                         border-none focus:outline-none caret-white login-input"
            />
          </div>

          {/* Input de Senha */}
          <div>
            <label htmlFor="password" className="text-sm font-bold text-gray-400 block mb-2">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="senha: admin ou user"
              className="w-full p-3 bg-gray-800 rounded-lg text-white placeholder-gray-500
                         border-none focus:outline-none caret-white login-input"
            />
          </div>

          {/* Exibe mensagem de erro, se houver */}
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          {/* Botão de login */}
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm
                       text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                       transition-all duration-300 transform hover:scale-105"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
