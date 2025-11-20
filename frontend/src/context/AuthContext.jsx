import { createContext, useContext, useState, useEffect } from 'react';
import { apiRegister, apiLogin } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restaura a sessão do usuário verificando o localStorage na inicialização
    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
        }
        setLoading(false);
    }, []);

    // Realiza login, persiste dados da sessão e atualiza estado global
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

    // Registra novo usuário via API
    const register = async (username, password) => {
        setLoading(true);
        return apiRegister(username, password)
            .finally(() => {
                setLoading(false);
            });
    };

    // Remove dados da sessão, limpa estado e simula delay de saída
    const logout = () => {
        setLoading(true);
        setTimeout(() => {
            localStorage.removeItem('userInfo');
            setUser(null);
            setLoading(false);
        }, 500);
    };

    const value = {
        user,
        isAuthenticated: !!user,
        userRole: user ? user.role : null,
        loading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);