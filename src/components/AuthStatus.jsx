// Componente de forms simples para input de login e logout (cadastro não foi adicionado ao front)
// import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function AuthStatus() {
  const { user, userRole, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div>Verificando status de autenticação...</div>;
  }

  if (!user) {
    return (
      <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '14px' }}>
        <p>
          Não logado. <button onClick={() => navigate('/login')} style={linkButtonStyle}>Login</button>
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '14px', textAlign: 'right' }}>
      <p>Olá, {user.attributes.email || user.username} ({userRole})!</p>
      <button
        onClick={async () => {
          await signOut();
          navigate('/login'); // Redireciona para a página de login após o logout
        }}
        style={logoutButtonStyle}
      >
        Sair
      </button>
    </div>
  );
}

// Estilos para os botões (pode ser movido para index.css)
const linkButtonStyle = {
    backgroundColor: 'transparent',
    color: '#007bff',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: 'inherit',
    padding: '0',
    margin: '0',
};

const logoutButtonStyle = {
  padding: '8px 15px',
  fontSize: '12px',
  cursor: 'pointer',
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
};

export default AuthStatus;