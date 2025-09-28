import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import icone from '../assets/icone.png';

// Componente de página de login
const Login = () => {
    // Estado para armazenar credenciais e mensagens de erro
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    // Se o usuário já estiver autenticado, redireciona para a página inicial
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Submissão do formulário de login
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(username, password); // Chama a função de login do contexto
        } catch (err) {
            setError(err.message || 'Ocorreu um erro ao tentar fazer login.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-xl shadow-lg border border-gray-700">
                {/* Cabeçalho com logo e título */}
                <div className="flex flex-col items-center">
                    <img src={icone} alt="Logo" className="w-20 h-20 mb-4" />
                    <h1 className="text-3xl font-bold text-center">Login</h1>
                </div>

                {/* Exibição de erro caso ocorra falha no login */}
                {error && <p className="text-red-500 bg-red-900/50 p-3 rounded-md text-center">{error}</p>}
                
                {/* Formulário de login */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Campo usuário */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-300">Nome de Usuário</label>
                        <input id="username" type="text" value={username} autoComplete="off" onChange={(e) => setUsername(e.target.value)} required className="mt-1 block w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    
                    {/* Campo senha */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">Senha</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>

                    {/* Botão de login com estado de carregamento */}
                    <div>
                        <button 
                            type="submit" 
                            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600"
                            disabled={loading}
                        >
                            {loading && <i className='bx bx-loader-alt animate-spin'></i>}
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </div>
                </form>

                {/* Link para registro */}
                <p className="text-center text-sm text-gray-400">
                    Não tem uma conta?{' '}
                    <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
                        Cadastre-se
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;