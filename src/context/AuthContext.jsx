// Context API do React para gerenciar o estado de autenticação com Cognito.
// Este arquivo utiliza as APIs modulares do AWS Amplify v6 e superiores.

import { createContext, useContext, useEffect, useState } from 'react';
// Importações modulares do Amplify v6 para funções de autenticação
import { getCurrentUser, signInWithRedirect, signOut, fetchAuthSession } from 'aws-amplify/auth';
// Importação do Hub para gerenciar listeners de eventos globais do Amplify (versao 6)
import { Hub } from 'aws-amplify/utils';
// Adicionar handleCognitoHostedUILogout no AuthProvider
import awsExports from '../aws-exports';


// Cria o contexto de autenticação. `null` é o valor padrão.
const AuthContext = createContext(null);

// Provedor de autenticação que envolverá a aplicação.
// Ele gerencia o estado de autenticação e expõe funções relacionadas.
export const AuthProvider = ({ children }) => {
  // Estado para armazenar o objeto do usuário Cognito autenticado.
  const [user, setUser] = useState(null);
  // Estado para indicar se a verificação inicial de autenticação está em andamento.
  const [loading, setLoading] = useState(true);
  // Estado para armazenar o papel do usuário ('admin', 'user', ou null).
  const [userRole, setUserRole] = useState(null);
  // Estado booleano para indicar se o usuário está autenticado.
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Função assíncrona para verificar o usuário atualmente autenticado e seu papel.
    const checkUser = async () => {
      try {
        // Tenta obter o usuário e sessão de tokens.
        const amplifyUser = await getCurrentUser();
        const authSession = await fetchAuthSession();
        setUser(amplifyUser);
        setIsAuthenticated(true);

        let role = null;

        // Verifica se há uma sessão de usuário e um token de acesso para extrair os grupos.
        if (authSession && authSession.tokens && authSession.tokens.accessToken) {
          
          // Extrai grupos do payload do token de acesso do Cognito para determinar o papel.
          // O payload do accessToken pode ser acessado diretamente assim.
          const groups = authSession.tokens.accessToken.payload['cognito:groups'];
          if (groups && groups.includes('admin')) {
            role = 'admin';
          } else {
            role = 'user'; // Padrão para 'user' se não for admin ou não tiver grupos.
          }
        }
        setUserRole(role);
        // Log para rastreamento. `role` é o valor que acabou de ser determinado.
        console.log("Usuário autenticado:", amplifyUser.username, "Papel:", role);
      } catch (error) {
        // Se houver um erro (ex: não há usuário autenticado, token expirado),
        // limpa o estado de autenticação.
        console.log('Nenhum usuário autenticado ou erro na sessão:', error);
        setUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
      } finally {
        // Indica que a verificação inicial de autenticação foi concluída.
        setLoading(false);
      }
    };

    // Executa a verificação na montagem do componente.
    checkUser();

    // --- Gerenciamento de Listeners de Eventos de Autenticação com Hub ---
    // Em Amplify v6+, o Hub é usado para escutar eventos de diferentes categorias.
    // 'auth' é a categoria para eventos de autenticação.

    // A função 'listener' será chamada quando um evento 'auth' ocorrer.
    const listener = (data) => {
      console.log('Evento do Auth Hub:', data.payload.event, data.payload.data);
      // `payload.event` contém o tipo de evento (ex: 'signedIn', 'signedOut').
      switch (data.payload.event) {
        case 'signedIn':
          console.log('Evento: signedIn - usuário logado.');
          // Após o login, reverifica o usuário para atualizar o estado completo.
          checkUser();
          break;
        case 'signIn_failure':
          console.log('Evento: signIn_failure - falha no login.');
          // Pode-se adicionar lógica específica para falha de login aqui.
          break;
        case 'signedOut':
          console.log('Evento: signedOut - usuário deslogado.');
          // Limpa o estado local para garantir que tudo esteja deslogado após o evento.
          setUser(null);
          setIsAuthenticated(false);
          setUserRole(null);
          setLoading(false); // Não há mais carregamento após o logout.
          break;
        case 'autoSignIn':
          console.log('Evento: autoSignIn - Automaticamente logado');
          break;
        case 'autoSignIn_failure': 
          console.log('Falha no autologin');
          break;        
        case 'tokenRefresh_failure':
          console.log('Evento: tokenRefresh_failure - falha na atualização do token. Tentando revalidar a sessão.');
          // Útil para detectar sessões expiradas ou problemas de token.
          // Uma nova verificação pode ser útil aqui ou forçar logout.
          checkUser(); // Tenta reverificar, pode levar ao logout se a sessão for inválida.
          break;
        // Outros eventos do Hub 'auth' podem ser 'userDeleted', 'undetermined', etc.
        default:
          console.log(`Evento de autenticação desconhecido/não tratado: ${data.payload.event}`);
          break;
      }
    };

    // Assina o listener para eventos da categoria 'auth'.
    // O Hub.listen() retorna uma função de "unsubscribe" na v6.
    // A função de limpeza do useEffect cuidará de remover o listener.
    const unsubscribe = Hub.listen('auth', listener);


    // Retorna a função de limpeza para remover o listener quando o componente for desmontado.
    // Isso evita vazamento de memória e garante que o listener não continue ativo.
    return () => unsubscribe();
  }, []); // O array de dependências vazio garante que o efeito seja executado apenas uma vez na montagem.

  // Fluxo de login automático via Hosted UI (quando configurado no Amplify).
  // Usa a nova API `signInWithRedirect`.
  const signInWithHostedUI = async () => {
    try {
      // Redireciona para o Hosted UI do Cognito. O resultado (usuário logado)
      // será capturado pelo listener do Hub 'signedIn' após o redirecionamento de volta.
      await signInWithRedirect();
      console.log("Iniciando redirecionamento para Hosted UI...");
    } catch (error) {
      console.error("Erro ao iniciar login via Hosted UI:", error);
      // É importante propagar o erro ou tratá-lo adequadamente na UI.
      throw error;
    }
  };

  // Função de logout para limpar o estado.
  // Usa a nova API `signOut`.
  const handleSignOut = async () => {
    try {
      await signOut(); // Executa o logout no Amplify.
      // O listener 'signedOut' do Hub já vai limpar o estado no contexto,
      // mas forçar a limpeza aqui pode ser uma redundância segura.
      // setUser(null);
      // setIsAuthenticated(false);
      // setUserRole(null);
      console.log('Logout executado com sucesso através do Amplify.');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  // Constrói a URL de logout para o Hosted UI usando dados do aws-exports e window.location.origin.
  const handleCognitoHostedUILogout = () => {
    const clientId = awsExports.Auth.userPoolWebClientId;
    // A URL deve ser a atual da aplicação
    const logoutUri = window.location.origin; // dinâmico (localhost ou AWS)
    const cognitoDomain = awsExports.Auth.Cognito.loginWith.oauth.domain;
    // Constrói a URL de logout e redireciona o navegador
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;  
  };


  // Objeto de valor fornecido pelo contexto a todos os componentes filhos.
  const value = {
    user,             // Objeto do usuário autenticado.
    userRole,         // Papel do usuário (admin/user).
    loading,          // Estado de carregamento inicial.
    isAuthenticated,  // Booleano indicando se o usuário está logado.
    signInWithHostedUI, // Função para iniciar login via Hosted UI.
    signOut: handleSignOut, // Função para logout.
    signOutHostedUI: handleCognitoHostedUILogout, // Nova função para logout direto do Hosted UI.
    // Funções para sign-up, confirm-sign-up, etc., podem ser adicionadas aqui
    // ou preferencialmente gerenciadas em um serviço de autenticação separado (authService.js)
    // para melhor encapsulamento e separação de responsabilidades.
  };

  // Enquanto estiver carregando (verificação inicial de autenticação),
  // exibe uma mensagem de carregamento.
  if (loading) {
    return <div>Carregando autenticação...</div>;
  }

  // Renderiza os componentes filhos, fornecendo o valor do contexto.
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para consumir o contexto de autenticação de forma fácil.
export const useAuth = () => {
  const context = useContext(AuthContext);
  // Garante que useAuth seja usado dentro de um AuthProvider.
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
