import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import icone from '../assets/icone.png';

// Componente de página de registro de usuário
const Register = () => {
    // Estado para armazenar campos do formulário e mensagens
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const { register, loading } = useAuth();
    const navigate = useNavigate();

    // Submissão do formulário de registro
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // valida se as senhas coincidem
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        try {
            await register(username, password); // chama função de registro do contexto
            setSuccess('Cadastro realizado com sucesso! Redirecionando para o login...');
            setTimeout(() => navigate('/login'), 2000); // redireciona após 2s
        } catch (err) {
            setError(err.message || 'Ocorreu um erro no cadastro.');
        }
    };
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-xl shadow-lg border border-gray-700">
                {/* Cabeçalho com logo e título */}
                <div className="flex flex-col items-center">
                    <img src={icone} alt="Logo" className="w-20 h-20 mb-4" />
                    <h1 className="text-3xl font-bold text-center">Cadastro</h1>
                </div>

                {/* Mensagens de erro e sucesso */}
                {error && <p className="text-red-500 bg-red-900/50 p-3 rounded-md text-center">{error}</p>}
                {success && <p className="text-green-500 bg-green-900/50 p-3 rounded-md text-center">{success}</p>}
                
                {/* Formulário de registro */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Campo usuário */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-300">Nome de Usuário</label>
                        <input id="username" type="text" autoComplete="off" value={username} onChange={(e) => setUsername(e.target.value)} required className="mt-1 block w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>

                    {/* Campo senha */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">Senha</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>

                    {/* Campo confirmar senha */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">Confirmar Senha</label>
                        <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 block w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>

                    {/* Botão de cadastro com estado de carregamento */}
                    <div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600">
                            {loading && <i className='bx bx-loader-alt animate-spin'></i>}
                            {loading ? 'Cadastrando...' : 'Cadastrar'}
                        </button>
                    </div>
                </form>

                {/* Link para login */}
                <p className="text-center text-sm text-gray-400">
                    Já tem uma conta?{' '}
                    <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
                        Faça login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;