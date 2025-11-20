import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}auth`;

// Envia requisição para registrar um novo usuário no sistema
export const apiRegister = async (username, password) => {
    try {
        const response = await axios.post(`${API_URL}/register`, { username, password });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Realiza login e retorna os dados do usuário autenticado (incluindo token)
export const apiLogin = async (username, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { username, password });
        return response.data;
    } catch (error) {
        throw error;
    }
};