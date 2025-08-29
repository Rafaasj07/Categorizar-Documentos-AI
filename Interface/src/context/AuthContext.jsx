/**
 * Gerencia o estado de autenticação globalmente usando a Context API do React
 * em conjunto com o AWS Amplify para interagir com o Cognito.
 * Expõe o status do usuário, seu papel (role) e funções de login/logout.
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, signOut, fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
// CORREÇÃO: Adicionada a extensão .js para garantir que o Vite encontre o arquivo.
import awsExports from '../aws-exports.js';

// Cria o contexto de autenticação
const AuthContext = createContext(null);

// Componente Provedor que encapsula a lógica de autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Função para verificar se há um usuário autenticado na sessão
    const checkUser = async () => {
      try {
        const amplifyUser = await getCurrentUser();
        const authSession = await fetchAuthSession();
        setUser(amplifyUser);
        setIsAuthenticated(true);

        const groups = authSession.tokens?.accessToken?.payload['cognito:groups'];
        const role = groups && groups.includes('admin') ? 'admin' : 'user';
        setUserRole(role);
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listener para eventos de autenticação do Amplify (login, logout)
    const listener = (data) => {
      switch (data.payload.event) {
        case 'signedIn':
          checkUser();
          break;
        case 'signedOut':
          setUser(null);
          setIsAuthenticated(false);
          setUserRole(null);
          break;
      }
    };

    const unsubscribe = Hub.listen('auth', listener);

    // Limpa o listener ao desmontar o componente
    return () => unsubscribe();
  }, []);

  // Função de logout
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Valor fornecido pelo contexto
  const value = {
    user,
    userRole,
    loading,
    isAuthenticated,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o uso do contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};