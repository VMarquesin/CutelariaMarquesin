import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Login.css'; // Reaproveitando o nosso design elegante

function Cadastro() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      await api.post('/auth/cadastro', { username, email, senha });
      // Se deu certo, joga pro login para entrar!
      navigate('/');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Criar Conta</h2>
        <p>Junte-se à Forja & Fogo</p>
        
        {erro && <div className="error-message">{erro}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="Nome de Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength="3"
          />
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Crie uma senha forte"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            minLength="6"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Forjando...' : 'Cadastrar'}
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <span style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
            Já tem uma conta?{' '}
            <Link to="/" style={{ color: '#d97706', textDecoration: 'none', fontWeight: 'bold' }}>
              Entrar
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Cadastro;