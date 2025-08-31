/**
 * Centraliza as constantes e valores de configuração estáticos da aplicação.
 * Isso evita a repetição de strings ("magic strings") no código e facilita
 * a manutenção.
 */

/**
 * Define os nomes dos papéis (roles) dos usuários.
 * Estes valores DEVEM corresponder exatamente aos nomes dos grupos
 * configurados no seu AWS Cognito User Pool.
 */
// Exporta um objeto 'USER_ROLES' para ser usado em outras partes do código.
export const USER_ROLES = {
  // Define o papel de Administrador.
  ADMIN: 'admin',
  // Define o papel de Usuário padrão.
  USER: 'user',
};

/**
 * Define os caminhos (rotas) padrão da aplicação.
 * Usado para redirecionamentos e links de navegação.
 */
// Exporta um objeto 'APP_CONFIG' com as rotas principais da aplicação.
export const APP_CONFIG = {
  // Rota para a página de login.
  LOGIN_PATH: '/login',
  // Rota padrão para usuários comuns após o login.
  DEFAULT_USER_PATH: '/categorizar',
  // Rota padrão para administradores após o login.
  DEFAULT_ADMIN_PATH: '/admin',
};