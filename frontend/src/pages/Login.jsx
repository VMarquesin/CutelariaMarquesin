import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

function Login() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLoginMode) {
        const response = await api.post('/auth/login', { username, senha });
        const { token } = response.data;
        
        localStorage.setItem('token', token);
        
        navigate('/home');
      } else {

        await api.post('/auth/cadastro', { username, senha });
        setSuccess('Conta criada com sucesso! Faça login para entrar.');
        setIsLoginMode(true);
        setSenha(''); 
      }
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const alternarModo = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setSuccess('');
    setUsername('');
    setSenha('');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>{isLoginMode ? 'Acesso ao Sistema' : 'Nova Conta'}</h1>
          <p>Cutelaria Marquesin</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Usuário</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="off"
            />
          </div>

          <div className="input-group">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Aguarde...' : isLoginMode ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        <div className="toggle-mode">
          <button type="button" className="btn-link" onClick={alternarModo}>
            {isLoginMode
              ? 'Não tem uma conta? Cadastre-se'
              : 'Já tem uma conta? Faça login'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;