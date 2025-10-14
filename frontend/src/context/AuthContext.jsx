import { createContext, useContext, useState, useEffect } from 'react';
import { apiRegister, apiLogin } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Ao carregar a aplicação, recupera o usuário salvo no localStorage.
    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
        }
        setLoading(false);
    }, []);

    // Autentica o usuário e salva os dados no localStorage.
    const login = async (username, password) => {
        setLoading(true);
        try {
            const data = await apiLogin(username, password);
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Registra um novo usuário.
    const register = async (username, password) => {
        setLoading(true);
        try {
            await apiRegister(username, password);
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Limpa a sessão do usuário.
    const logout = () => {
        setLoading(true);
        setTimeout(() => {
            localStorage.removeItem('userInfo');
            setUser(null);
            setLoading(false);
        }, 500);
    };

    // Valores e funções expostos para toda a aplicação.
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

// Hook personalizado para acessar o contexto de autenticação.
export const useAuth = () => useContext(AuthContext);