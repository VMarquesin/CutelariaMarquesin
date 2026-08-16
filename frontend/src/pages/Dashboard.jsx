import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [referenciasSalvas, setReferenciasSalvas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [referenciaEmFoco, setReferenciaEmFoco] = useState(null);

  useEffect(() => {
    carregarReferenciasSalvas();
  }, []);

  const carregarReferenciasSalvas = async () => {
    try {
      const response = await api.get('/referencias');
      setReferenciasSalvas(response.data);
    } catch (error) {
      console.error("Erro ao carregar referências:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!busca.trim()) return;

    setLoading(true);
    try {
      const response = await api.get(`/referencias/buscar?query=${busca}`);
      const resultadosComComentario = response.data.map(img => ({ ...img, comentarioInput: '' }));
      setResultadosBusca(resultadosComComentario);
    } catch (error) {
      alert("Erro ao buscar imagens na API externa.");
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async (imagem) => {
    try {
      await api.post('/referencias', {
        unsplashId: imagem.unsplash_id,
        urlImagem: imagem.url_imagem,
        comentario: imagem.comentarioInput || 'Sem comentário'
      });
      
      setResultadosBusca(resultadosBusca.filter(img => img.unsplash_id !== imagem.unsplash_id));
      carregarReferenciasSalvas();
    } catch (error) {
      alert("Erro ao salvar referência no banco.");
    }
  };

  const handleComentarioChange = (unsplashId, texto) => {
    setResultadosBusca(resultadosBusca.map(img => 
      img.unsplash_id === unsplashId ? { ...img, comentarioInput: texto } : img
    ));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Painel de Referências - Cutelaria</h1>
      </header>

      <section className="search-section">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Ex: damascus knife, chef knife, handle..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Buscando...' : 'Pesquisar'}
          </button>
        </form>
      </section>

      {resultadosBusca.length > 0 && (
        <>
          <h2 className="section-title">Resultados da Busca (Clique para ver no Unsplash)</h2>
          <div className="image-grid">
            {resultadosBusca.map((img) => (
              <div className="card" key={`busca-${img.unsplash_id}`}>
                <a href={`https://unsplash.com/photos/${img.unsplash_id}`} target="_blank" rel="noopener noreferrer" title="Ver foto no Unsplash">
                  <img src={img.url_imagem} alt={img.titulo} />
                </a>
                <div className="card-body">
                  <input 
                    type="text" 
                    placeholder="Adicione um comentário/ideia..."
                    value={img.comentarioInput}
                    onChange={(e) => handleComentarioChange(img.unsplash_id, e.target.value)}
                  />
                  <button className="btn-save" onClick={() => handleSalvar(img)}>
                    + Salvar na Oficina
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="section-title">Minhas Referências Salvas</h2>
      {referenciasSalvas.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Você ainda não salvou nenhuma referência. Use a busca acima!</p>
      ) : (
        <div className="image-grid">
          {referenciasSalvas.map((ref) => (
            <div className="card" key={`salva-${ref.id}`}>
              <img 
                src={ref.url_imagem} 
                alt="Referência salva" 
                onClick={() => setReferenciaEmFoco(ref)}
                title="Clique para ampliar"
              />
              <div className="card-body">
                <p className="saved-comment">"{ref.comentario.length > 60 ? ref.comentario.substring(0, 60) + '...' : ref.comentario}"</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== O MODAL ===== */}
      {referenciaEmFoco && (
        <div className="modal-overlay" onClick={() => setReferenciaEmFoco(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setReferenciaEmFoco(null)}>
              &times;
            </button>
            <img src={referenciaEmFoco.url_imagem} alt="Referência ampliada" />
            <div className="modal-body">
              <h3>Anotações da Oficina</h3>
              <p>{referenciaEmFoco.comentario}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;