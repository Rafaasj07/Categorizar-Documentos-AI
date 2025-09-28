import { createContext, useContext, useState, useEffect } from 'react';
import { apiRegister, apiLogin } from '../services/authService';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ao carregar a aplicação, recupera o usuário salvo no localStorage e restaura o token no header da API
    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        }
        setLoading(false);
    }, []);

    // autentica o usuário, salva os dados no localStorage e configura o token na API
    const login = async (username, password) => {
        setLoading(true);
        try {
            const data = await apiLogin(username, password);
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // registra um novo usuário (sem salvar sessão automaticamente)
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

    // limpa sessão do usuário e remove token do header da API
    const logout = () => {
        setLoading(true); 
        setTimeout(() => {
            localStorage.removeItem('userInfo');
            setUser(null);
            delete api.defaults.headers.common['Authorization'];
            setLoading(false); 
        }, 500);
    };

    // valores e funções expostos para toda a aplicação
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

// hook personalizado para acessar o contexto de autenticação
export const useAuth = () => useContext(AuthContext);
