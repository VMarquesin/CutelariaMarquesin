import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      const response = await api.post('/auth/login', { email, senha });
      localStorage.setItem('token', response.data.token);
      navigate('/home');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao conectar com o servidor');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Forja & Fogo</h2>
        <p>Acesso ao Catálogo</p>
        
        {erro && <div className="error-message">{erro}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <button type="submit">Entrar na Oficina</button>
        </form>
        
        {/* AQUI ESTÁ A MUDANÇA: Os links empilhados e centralizados */}
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', textAlign: 'center' }}>
          <Link to="/esqueci-senha" style={{ color: '#d97706', textDecoration: 'none', fontSize: '0.9rem' }}>
            Esqueceu sua senha?
          </Link>
          
          <div style={{ borderTop: '1px solid #444', margin: '0.5rem 0' }}></div>
          
          <span style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
            Ainda não tem cadastro?{' '}
            <Link to="/cadastro" style={{ color: '#d97706', textDecoration: 'none', fontWeight: 'bold' }}>
              Criar conta
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;