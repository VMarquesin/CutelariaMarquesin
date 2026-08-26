import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

function ResetarSenha() {
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  // Pega o ?token=... da URL
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    
    if (!token) {
      return setErro('Token de recuperação ausente na URL.');
    }
    if (senha !== confirmarSenha) {
      return setErro('As senhas não coincidem!');
    }

    setLoading(true);
    try {
      await api.post('/auth/resetar-senha', { token, novaSenha: senha });
      setSucesso(true);
      setTimeout(() => navigate('/'), 3000); // Redireciona pro login após 3 segundos
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao redefinir a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Nova Senha</h2>
        <p>Digite sua nova credencial</p>
        
        {erro && <div className="error-message">{erro}</div>}
        {sucesso && (
          <div style={{ color: '#4ade80', marginBottom: '1rem', textAlign: 'center' }}>
            Senha alterada com sucesso! Redirecionando...
          </div>
        )}
        
        {!sucesso && (
          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="password"
              placeholder="Nova senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength="6"
            />
            <input
              type="password"
              placeholder="Confirme a nova senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
              minLength="6"
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Nova Senha'}
            </button>
          </form>
        )}
        
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
            Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetarSenha;