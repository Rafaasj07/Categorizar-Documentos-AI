import { createContext, useContext, useState, useEffect } from 'react';
import { apiRegister, apiLogin } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Gerencia o estado do usuário e o status de carregamento.
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Ao iniciar a aplicação, verifica se há um usuário salvo no localStorage.
    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
        }
        setLoading(false);
    }, []);

    // Função de login: chama a API, salva os dados no localStorage e atualiza o estado.
    const login = async (username, password) => {
        setLoading(true);
        return apiLogin(username, password)
            .then(data => {
                localStorage.setItem('userInfo', JSON.stringify(data));
                setUser(data);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Função de registro: chama a API de registro.
    const register = async (username, password) => {
        setLoading(true);
        return apiRegister(username, password)
            .finally(() => {
                setLoading(false);
            });
    };

    // Função de logout: remove os dados do localStorage e limpa o estado.
    const logout = () => {
        setLoading(true);
        setTimeout(() => {
            localStorage.removeItem('userInfo');
            setUser(null);
            setLoading(false);
        }, 500);
    };

    // Objeto com os valores que serão compartilhados com os componentes da aplicação.
    const value = {
        user,
        isAuthenticated: !!user,
        userRole: user ? user.role : null,
        loading,
        login,
        register,
        logout
    };

    // Disponibiliza o contexto de autenticação para os componentes filhos.
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);