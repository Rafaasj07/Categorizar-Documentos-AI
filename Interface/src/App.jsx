import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Categorizar from './pages/Categorizar';
import Buscar from './pages/Buscar';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas principais */}
        <Route path="/Categorizar" element={<Categorizar />} />
        <Route path="/Buscar" element={<Buscar />} />
        
        {/* Redireciona qualquer rota inválida para /Categorizar */}
        <Route path="*" element={<Navigate to="/Categorizar" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
