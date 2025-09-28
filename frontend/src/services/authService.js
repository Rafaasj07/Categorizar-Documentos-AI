import axios from 'axios';

// URL base da API de autenticação
const API_URL = `${import.meta.env.VITE_API_URL}auth`;

// registra um novo usuário
export const apiRegister = async (username, password) => {
    try {
        const response = await axios.post(`${API_URL}/register`, { username, password });
        return response.data;
    } catch (error) {
        // lança erro com mensagem da API ou padrão
        throw new Error(error.response?.data?.message || 'Falha ao registrar.');
    }
};

// autentica usuário e retorna token e dados
export const apiLogin = async (username, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { username, password });
        return response.data;
    } catch (error) {
        // lança erro com mensagem da API ou padrão
        throw new Error(error.response?.data?.message || 'Credenciais inválidas.');
    }
};
