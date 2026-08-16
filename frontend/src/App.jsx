import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Layout from './components/Layout';

function App() {
  const estaAutenticado = () => {
    return localStorage.getItem('token') !== null;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={estaAutenticado() ? <Layout /> : <Navigate to="/" />}>
        <Route path="/home" element={<Home />} />
        <Route path="/referencias" element={<Dashboard />} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;