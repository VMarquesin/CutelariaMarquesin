import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Login.css'; // Reaproveitando o CSS do Login

function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');
    setLoading(true);

    try {
      const response = await api.post('/auth/esqueci-senha', { email });
      setMensagem(response.data.mensagem);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao solicitar recuperação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Recuperar Senha</h2>
        <p>Enviaremos um link para o seu e-mail</p>
        
        {erro && <div className="error-message">{erro}</div>}
        {mensagem && <div style={{ color: '#4ade80', marginBottom: '1rem', textAlign: 'center' }}>{mensagem}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Digite seu e-mail cadastrado"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Link'}
          </button>
        </form>
        
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
            &larr; Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EsqueciSenha;