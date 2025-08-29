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
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

/**
 * Define os caminhos (rotas) padrão da aplicação.
 * Usado para redirecionamentos e links de navegação.
 */
export const APP_CONFIG = {
  LOGIN_PATH: '/login',
  DEFAULT_USER_PATH: '/categorizar', // Rota padrão para usuários 'user' após o login.
  DEFAULT_ADMIN_PATH: '/admin',      // Rota padrão para usuários 'admin' após o login.
};