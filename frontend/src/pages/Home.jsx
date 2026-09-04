import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-overlay">
        <div className="home-content">
          <h1>Forja Ativa</h1>
          <p>
            Bem-vindo ao sistema de gestão da Cutelaria Marquesin. 
            Utilize o menu lateral para gerenciar suas referências de design, materiais e fluxo de produção.
          </p>
          
          {/* Botão para acessar a área administrativa */}
          <button 
            onClick={() => navigate('/admin')}
            style={{ marginTop: '20px', padding: '10px 20px', background: '#d97706', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '16px' }}
          >
            Acessar Painel de Mestres (Admin)
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;