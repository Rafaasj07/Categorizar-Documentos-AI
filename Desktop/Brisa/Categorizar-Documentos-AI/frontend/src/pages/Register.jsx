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
    const [mensagem, setMensagem] = useState(''); // Estado unificado para feedback
    const [isSuccess, setIsSuccess] = useState(false); // Para diferenciar sucesso de erro

    const { register, loading } = useAuth();
    const navigate = useNavigate();

    // Limpa as mensagens de feedback ao focar em um input
    const limparFeedback = () => {
        setMensagem('');
        setIsSuccess(false);
    };

    // Submissão do formulário de registro
    const handleSubmit = async (e) => {
        e.preventDefault();
        limparFeedback();

        // Valida se as senhas coincidem
        if (password !== confirmPassword) {
            setMensagem('As senhas não coincidem.');
            return;
        }

        try {
            await register(username, password);
            setMensagem('Cadastro realizado com sucesso! Redirecionando para o login...');
            setIsSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            const errorMsg = err.response?.data?.mensagem || err.message || 'Ocorreu um erro no cadastro.';
            setMensagem(errorMsg);
            setIsSuccess(false);
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

                {/* Formulário de registro */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Campo usuário */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-300">Nome de Usuário</label>
                        <input id="username" type="text" autoComplete="off" value={username} onChange={(e) => setUsername(e.target.value)} onFocus={limparFeedback} required className={`mt-1 block w-full px-4 py-2 bg-gray-800 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${mensagem && !isSuccess ? 'border-red-500' : 'border-gray-600'}`} />
                    </div>

                    {/* Campo senha */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">Senha</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onFocus={limparFeedback} required className={`mt-1 block w-full px-4 py-2 bg-gray-800 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${mensagem && !isSuccess ? 'border-red-500' : 'border-gray-600'}`} />
                    </div>

                    {/* Campo confirmar senha */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">Confirmar Senha</label>
                        <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onFocus={limparFeedback} required className={`mt-1 block w-full px-4 py-2 bg-gray-800 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${mensagem && !isSuccess ? 'border-red-500' : 'border-gray-600'}`} />
                    </div>

                    {/* Mensagens de erro e sucesso */}
                    <div className="h-6 text-center">
                        {mensagem && (
                            <p className={`text-sm ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
                                {mensagem}
                            </p>
                        )}
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