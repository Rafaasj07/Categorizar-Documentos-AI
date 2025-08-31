/**
 * Gerencia o estado de autenticação globalmente usando a Context API do React
 * em conjunto com o AWS Amplify para interagir com o Cognito.
 * Expõe o status do usuário, seu papel (role) e funções de login/logout.
 */

// Importa os hooks e funções necessárias do React.
import { createContext, useContext, useEffect, useState } from 'react';
// Importa funções do AWS Amplify para interagir com o serviço de autenticação (Cognito).
import { getCurrentUser, signOut, fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
// Importa as configurações do Amplify (quais serviços da AWS usar).
import awsExports from '../aws-exports.js';

// Cria um "Contexto" de Autenticação. É como um container global para os dados de login.
const AuthContext = createContext(null);

// Cria o componente "Provedor" que vai disponibilizar os dados de autenticação para toda a aplicação.
export const AuthProvider = ({ children }) => {
  // Define os estados que vão armazenar as informações do usuário.
  const [user, setUser] = useState(null); // Dados do usuário.
  const [loading, setLoading] = useState(true); // Indica se a verificação de login está em andamento.
  const [userRole, setUserRole] = useState(null); // Papel do usuário (admin ou comum).
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Indica se o usuário está logado.

  // O 'useEffect' executa uma vez quando o componente é montado.
  useEffect(() => {
    // Função para verificar se já existe um usuário logado na sessão.
    const checkUser = async () => {
      try {
        // Tenta obter o usuário e a sessão atuais do Amplify.
        const amplifyUser = await getCurrentUser();
        const authSession = await fetchAuthSession();
        // Se conseguir, atualiza os estados com os dados do usuário.
        setUser(amplifyUser);
        setIsAuthenticated(true);

        // Verifica os "grupos" do usuário no Cognito para definir seu papel (admin ou user).
        const groups = authSession.tokens?.accessToken?.payload['cognito:groups'];
        const role = groups && groups.includes('admin') ? 'admin' : 'user';
        setUserRole(role);
      } catch (error) {
        // Se não encontrar um usuário, limpa todos os estados de autenticação.
        setUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
      } finally {
        // Garante que o estado de 'loading' seja desativado ao final, com ou sem erro.
        setLoading(false);
      }
    };

    // Executa a verificação assim que a aplicação carrega.
    checkUser();

    // Cria um "ouvinte" para eventos de autenticação do Amplify.
    // Isso permite que a aplicação reaja em tempo real a logins e logouts.
    const listener = (data) => {
      switch (data.payload.event) {
        // Quando um usuário faz login.
        case 'signedIn':
          checkUser(); // Verifica novamente os dados do usuário.
          break;
        // Quando um usuário faz logout.
        case 'signedOut':
          setUser(null); // Limpa todos os dados.
          setIsAuthenticated(false);
          setUserRole(null);
          break;
      }
    };

    // Registra o ouvinte no Hub de eventos do Amplify.
    const unsubscribe = Hub.listen('auth', listener);

    // Função de limpeza: remove o ouvinte quando o componente for "desmontado" para evitar vazamentos de memória.
    return () => unsubscribe();
  }, []);

  // Função para realizar o logout do usuário.
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Objeto que contém todos os dados e funções que serão compartilhados com o resto da aplicação.
  const value = {
    user,
    userRole,
    loading,
    isAuthenticated,
    signOut: handleSignOut,
  };

  // Renderiza o "Provedor" do Contexto, disponibilizando o 'value' para todos os componentes filhos.
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Cria um hook customizado 'useAuth' para facilitar o acesso ao contexto em outros componentes.
export const useAuth = () => {
  const context = useContext(AuthContext);
  // Garante que o hook só seja usado dentro de um 'AuthProvider'.
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};