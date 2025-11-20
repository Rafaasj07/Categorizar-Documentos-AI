import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import icone from '../assets/icone.png';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [mensagem, setMensagem] = useState('');
    const { login, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    // Redireciona para a home caso o usuário já esteja autenticado
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const limparFeedback = () => {
        setMensagem('');
    };

    // Gerencia submissão do formulário, chamando API de login e tratando erros
    const handleSubmit = async (e) => {
        e.preventDefault();
        limparFeedback();
        try {
            await login(username, password);
        } catch (err) {
            const errorMsg = err.response?.data?.mensagem || err.message || 'Ocorreu um erro ao tentar fazer login.';
            setMensagem(errorMsg);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-xl shadow-lg border border-gray-700">
                <div className="flex flex-col items-center">
                    <img src={icone} alt="Logo" className="w-20 h-20 mb-4" />
                    <h1 className="text-3xl font-bold text-center">Login</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-300">Nome de Usuário</label>
                        <input id="username" type="text" value={username} autoComplete="off" onChange={(e) => setUsername(e.target.value)} onFocus={limparFeedback} required className={`mt-1 block w-full px-4 py-2 bg-gray-800 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${mensagem ? 'border-red-500' : 'border-gray-600'}`} />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">Senha</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onFocus={limparFeedback} required className={`mt-1 block w-full px-4 py-2 bg-gray-800 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${mensagem ? 'border-red-500' : 'border-gray-600'}`} />
                    </div>

                    <div className="h-6 text-center">
                        {mensagem && <p className="text-red-500 text-sm">{mensagem}</p>}
                    </div>

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