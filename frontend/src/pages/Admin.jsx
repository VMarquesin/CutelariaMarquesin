import { useState } from 'react';
import api from '../services/api';

function Admin() {
  const [abaAtiva, setAbaAtiva] = useState('usuarios');
  const [usuarios, setUsuarios] = useState([]);
  const [logs, setLogs] = useState([]);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const buscarUsuarios = async () => {
    setErro(''); setMensagem(''); setAbaAtiva('usuarios');
    try {
      const token = localStorage.getItem('token'); 
      const response = await api.get('/auth/admin/usuarios', { headers: { Authorization: `Bearer ${token}` } });
      setUsuarios(response.data);
    } catch (err) {
      tratarErro(err);
    }
  };

  const buscarLogs = async () => {
    setErro(''); setMensagem(''); setAbaAtiva('logs');
    try {
      const token = localStorage.getItem('token'); 
      const response = await api.get('/logs/auditoria', { headers: { Authorization: `Bearer ${token}` } });
      setLogs(response.data);
    } catch (err) {
      tratarErro(err);
    }
  };

  const promoverAdmin = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/auth/admin/usuarios/${id}/role`, { novoRole: 'admin' }, { headers: { Authorization: `Bearer ${token}` } });
      setMensagem('Usuário promovido a Admin com sucesso!');
      buscarUsuarios(); 
    } catch (err) {
      setErro('Erro ao promover usuário.');
    }
  };

  const tratarErro = (err) => {
    if (err.response?.status === 403) {
      setErro('Erro 403: Acesso Proibido. Apenas Mestres (Admin) podem ver esta área.');
    } else if (err.response?.status === 401) {
      setErro('Erro 401: Token inválido ou expirado. Faça login novamente.');
    } else {
      setErro('Erro ao conectar com o servidor.');
    }
  };

  // Função para formatar a data/hora para o padrão brasileiro
  const formatarData = (isoString) => {
    if (!isoString) return '-';
    const data = new Date(isoString);
    return data.toLocaleString('pt-BR');
  };

  // Função para dar cores às ações (Design)
  const renderAcaoTag = (acao) => {
    if (acao.includes('SUCESSO')) return <span style={{ color: '#34d399', fontWeight: 'bold' }}>{acao}</span>;
    if (acao.includes('NEGADO') || acao.includes('INVALIDO')) return <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{acao}</span>;
    return <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{acao}</span>;
  };

  return (
    <div style={{ padding: '40px', color: '#fff', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'left' }}>
        
        <h1 style={{ color: '#d97706', marginBottom: '10px', fontSize: '2.5rem' }}>Gestão da Forja</h1>
        <p style={{ color: '#aaa', marginBottom: '30px', fontSize: '1.1rem' }}>
          Controle de acessos, permissões e auditoria de segurança (Logs).
        </p>
        
        {/* BOTOES DAS ABAS */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
          <button onClick={buscarUsuarios} style={{ padding: '12px 24px', background: abaAtiva === 'usuarios' ? '#d97706' : '#374151', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            👥 Listar Usuários
          </button>
          <button onClick={buscarLogs} style={{ padding: '12px 24px', background: abaAtiva === 'logs' ? '#d97706' : '#374151', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            🛡️ Registros de Auditoria (Logs)
          </button>
        </div>

        {erro && <div style={{ background: '#fee2e2', color: '#ef4444', padding: '15px', borderRadius: '6px', marginBottom: '20px', borderLeft: '5px solid #ef4444' }}><strong>Atenção: </strong> {erro}</div>}
        {mensagem && <div style={{ background: '#d1fae5', color: '#10b981', padding: '15px', borderRadius: '6px', marginBottom: '20px', borderLeft: '5px solid #10b981' }}>{mensagem}</div>}

        {/* TABELA DE USUÁRIOS */}
        {abaAtiva === 'usuarios' && usuarios.length > 0 && (
          <div style={{ background: '#1f1f1f', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#2c2c2c' }}>
                <tr>
                  <th style={{ padding: '15px', borderBottom: '2px solid #d97706' }}>ID</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #d97706' }}>Nome</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #d97706' }}>Papel</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #d97706' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '15px', color: '#888' }}>{u.id}</td>
                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{u.username}</td>
                    <td style={{ padding: '15px' }}>{u.role.toUpperCase()}</td>
                    <td style={{ padding: '15px' }}>
                      {u.role !== 'admin' && <button onClick={() => promoverAdmin(u.id)} style={{ padding: '8px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Tornar Admin</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TABELA DE LOGS (AUDITORIA) */}
        {abaAtiva === 'logs' && logs.length > 0 && (
          <div style={{ background: '#1f1f1f', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#2c2c2c' }}>
                <tr>
                  <th style={{ padding: '15px', borderBottom: '2px solid #d97706' }}>Data/Hora</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #d97706' }}>Usuário ID</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #d97706' }}>Ação Realizada</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #d97706' }}>IP de Origem</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #d97706' }}>Detalhes Adicionais</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.redis_id} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '15px', color: '#aaa', fontSize: '0.9rem' }}>{formatarData(log.data_hora)}</td>
                    <td style={{ padding: '15px', fontWeight: 'bold', color: log.usuario_id === 'ANONIMO' ? '#9ca3af' : '#fff' }}>{log.usuario_id}</td>
                    <td style={{ padding: '15px' }}>{renderAcaoTag(log.acao)}</td>
                    <td style={{ padding: '15px', color: '#888', fontFamily: 'monospace' }}>{log.ip}</td>
                    <td style={{ padding: '15px', color: '#aaa', fontSize: '0.9rem', fontStyle: 'italic' }}>{log.detalhes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;