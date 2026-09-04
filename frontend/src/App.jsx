import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import EsqueciSenha from './pages/EsqueciSenha';
import ResetarSenha from './pages/ResetarSenha';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Layout from './components/Layout';
import Admin from './pages/Admin';

const RotaPrivada = () => {
  const logado = localStorage.getItem('token') !== null;
  return logado ? <Layout /> : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="/resetar-senha" element={<ResetarSenha />} />
        
        {/* Usamos o Guarda-Costas aqui */}
        <Route element={<RotaPrivada />}>
          <Route path="/home" element={<Home />} />
          <Route path="/referencias" element={<Dashboard />} /> 
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;