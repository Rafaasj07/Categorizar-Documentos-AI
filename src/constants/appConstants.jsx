/* Esses nomes devem corresponder aos grupos configurados no seu AWS Cognito User Pool.
*/
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

/* Caminhos padrão da aplicação 
Inclui URLs de login, redirecionamentos padrão para diferentes papéis, home, etc.
Adicionar mais caminhos aqui conforme necessário. 
*/

export const APP_CONFIG = {
  LOGIN_PATH: '/login',             
  DEFAULT_USER_PATH: '/categorizar', // Caminho padrão para user após login.
  DEFAULT_ADMIN_PATH: '/admin',      // Caminho padrão para admin após login.
};