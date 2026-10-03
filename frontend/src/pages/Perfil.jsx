import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import './Perfil.css';


function Perfil() {
  const [perfil, setPerfil] = useState(null);
  const [referencias, setReferencias] = useState([]);
  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const [uploadando, setUploadando] = useState(false);
  const [feedback, setFeedback] = useState(null); // { tipo: 'sucesso'|'erro', msg: '' }
  const inputFotoRef = useRef(null);

  // ──────────────────────────────────────────────
  // Carregamento inicial
  // ──────────────────────────────────────────────
  useEffect(() => {
    carregarPerfil();
    carregarReferencias();
  }, []);

  const carregarPerfil = async () => {
    try {
      const response = await api.get('/auth/perfil');
      setPerfil(response.data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      mostrarFeedback('erro', 'Não foi possível carregar seu perfil.');
    } finally {
      setLoadingPerfil(false);
    }
  };

  const carregarReferencias = async () => {
    try {
      const response = await api.get('/referencias');
      setReferencias(response.data);
    } catch (error) {
      console.error('Erro ao carregar referências:', error);
    }
  };

  // ──────────────────────────────────────────────
  // Upload de foto
  // ──────────────────────────────────────────────
  const handleFotoChange = async (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;

    if (!arquivo.type.startsWith('image/')) {
      mostrarFeedback('erro', 'Selecione um arquivo de imagem válido.');
      return;
    }
    if (arquivo.size > 5 * 1024 * 1024) {
      mostrarFeedback('erro', 'A imagem deve ter no máximo 5 MB.');
      return;
    }

    const formData = new FormData();
    formData.append('foto', arquivo);

    setUploadando(true);
    try {
      // Usa a instância global `api` (aponta para o Catálogo / API Gateway).
      // NÃO defina Content-Type manualmente: o axios detecta o FormData e
      // gera o boundary correto automaticamente.
      const response = await api.post('/auth/perfil/foto', formData);

      // Atualiza a foto instantaneamente sem reload
      const novaUrl = response.data.url;
      setPerfil((prev) => ({ ...prev, foto_perfil: novaUrl }));
      mostrarFeedback('sucesso', 'Foto atualizada com sucesso!');
    } catch (error) {
      console.error('Erro no upload:', error);
      mostrarFeedback('erro', 'Falha ao enviar a foto. Tente novamente.');
    } finally {
      setUploadando(false);
      if (inputFotoRef.current) inputFotoRef.current.value = '';
    }
  };

  // ──────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────
  const mostrarFeedback = (tipo, msg) => {
    setFeedback({ tipo, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────
  if (loadingPerfil) {
    return (
      <div className="perfil-loading">
        <div className="loading-spinner" />
        <p>Carregando perfil…</p>
      </div>
    );
  }

  return (
    <div className="perfil-page">

      {/* ── FEEDBACK TOAST ── */}
      {feedback && (
        <div className={`perfil-toast perfil-toast--${feedback.tipo}`}>
          {feedback.tipo === 'sucesso' ? '✓' : '✕'} {feedback.msg}
        </div>
      )}

      {/* ── HERO DO PERFIL ── */}
      <section className="perfil-hero">
        <div className="perfil-avatar-wrapper">
          {perfil?.foto_perfil ? (
            <img
              src={perfil.foto_perfil}
              alt={`Foto de ${perfil.username}`}
              className="perfil-avatar"
            />
          ) : (
            <div className="perfil-avatar-placeholder" aria-label="Sem foto de perfil">
              {perfil?.username?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}

          <button
            className="perfil-avatar-btn"
            onClick={() => inputFotoRef.current?.click()}
            disabled={uploadando}
            title="Alterar foto de perfil"
            aria-label="Alterar foto de perfil"
          >
            {uploadando ? (
              <span className="btn-spinner" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.92c.04-.34.07-.68.07-1.08s-.03-.74-.07-1.08l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.63c-.04.34-.07.69-.07 1.08s.03.74.07 1.08L2.46 13.58c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.58 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.63Z" />
              </svg>
            )}
          </button>

          <input
            ref={inputFotoRef}
            id="input-foto-perfil"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFotoChange}
          />
        </div>

        <div className="perfil-info">
          <h1 className="perfil-username">{perfil?.username ?? '—'}</h1>
          <p className="perfil-bio">
            {perfil?.bio || <span className="perfil-bio--vazia">Nenhuma bio cadastrada.</span>}
          </p>
          <p className="perfil-meta">
            {referencias.length} referência{referencias.length !== 1 ? 's' : ''} salva{referencias.length !== 1 ? 's' : ''}
          </p>
        </div>
      </section>

      {/* ── GALERIA DE FAVORITOS ── */}
      <section className="perfil-galeria">
        <h2 className="perfil-galeria-titulo">
          <span className="titulo-icone">✦</span> Galeria de Referências
        </h2>

        {referencias.length === 0 ? (
          <div className="perfil-galeria-vazia">
            <p>Você ainda não salvou nenhuma referência.</p>
            <a href="/referencias" className="perfil-link-refs">Explorar referências →</a>
          </div>
        ) : (
          <div className="perfil-grid">
            {referencias.map((ref) => (
              <div className="perfil-card" key={ref.id}>
                <img
                  src={ref.url_imagem}
                  alt={ref.comentario || 'Referência'}
                  loading="lazy"
                />
                {ref.comentario && (
                  <div className="perfil-card-overlay">
                    <p>{ref.comentario.length > 80 ? ref.comentario.substring(0, 80) + '…' : ref.comentario}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Perfil;
