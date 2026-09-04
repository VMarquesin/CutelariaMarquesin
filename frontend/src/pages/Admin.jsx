import { useState } from 'react';
import api from '../services/api';

function Admin() {
  const [usuarios, setUsuarios] = useState([]);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const buscarUsuarios = async () => {
    setErro('');
    setMensagem('');
    try {
      const token = localStorage.getItem('token'); 
      console.log("Token lido do armazenamento:", token);

      if (!token) {
        setErro('Opa! Nenhum token encontrado. Tem certeza que você fez login?');
        return;
      }

      const response = await api.get('/auth/admin/usuarios', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(response.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setErro('Erro 403: Acesso Proibido. Apenas Mestres Cuteleiros (Admin) podem ver esta área.');
      } else if (err.response?.status === 401) {
        setErro('Erro 401: Não autorizado. O token não chegou no backend ou expirou.');
      } else {
        setErro('Erro ao conectar com o servidor.');
      }
    }
  };

  const promoverAdmin = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/auth/admin/usuarios/${id}/role`, { novoRole: 'admin' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensagem('Usuário promovido a Admin com sucesso!');
      buscarUsuarios();
    } catch (err) {
      setErro('Erro ao promover usuário.');
    }
  };

  return (
    <div style={{ padding: '40px', color: '#fff', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'left' }}>
        
        <h1 style={{ color: '#d97706', marginBottom: '10px', fontSize: '2.5rem' }}>Gestão da Forja</h1>
        <p style={{ color: '#aaa', marginBottom: '30px', fontSize: '1.1rem' }}>
          Área restrita. Controle de acessos e permissões dos usuários do sistema.
        </p>
        
        <button 
          onClick={buscarUsuarios} 
          style={{ 
            padding: '12px 24px', 
            background: '#d97706', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '6px',
            cursor: 'pointer', 
            fontWeight: 'bold',
            marginBottom: '30px',
            fontSize: '1rem'
          }}
        >
          Carregar Lista de Usuários
        </button>

        {erro && (
          <div style={{ background: '#fee2e2', color: '#ef4444', padding: '15px', borderRadius: '6px', marginBottom: '20px', borderLeft: '5px solid #ef4444' }}>
            <strong>Atenção: </strong> {erro}
          </div>
        )}
        
        {mensagem && (
          <div style={{ background: '#d1fae5', color: '#10b981', padding: '15px', borderRadius: '6px', marginBottom: '20px', borderLeft: '5px solid #10b981' }}>
            {mensagem}
          </div>
        )}

        {usuarios.length > 0 && (
          <div style={{ background: '#1f1f1f', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#2c2c2c' }}>
                <tr>
                  <th style={{ padding: '15px', borderBottom: '2px solid #d97706' }}>ID</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #d97706' }}>Nome de Usuário</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #d97706' }}>E-mail</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #d97706' }}>Papel (Role)</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #d97706' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '15px', color: '#888' }}>{u.id}</td>
                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{u.username}</td>
                    <td style={{ padding: '15px', color: '#aaa' }}>{u.email}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '12px', 
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        background: u.role === 'admin' ? '#064e3b' : '#374151',
                        color: u.role === 'admin' ? '#34d399' : '#d1d5db'
                      }}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '15px' }}>
                      {u.role !== 'admin' ? (
                        <button 
                          onClick={() => promoverAdmin(u.id)} 
                          style={{ padding: '8px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          Tornar Admin
                        </button>
                      ) : (
                        <span style={{ color: '#777', fontStyle: 'italic' }}>Mestre</span>
                      )}
                    </td>
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