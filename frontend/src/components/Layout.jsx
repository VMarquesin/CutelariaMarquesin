import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import './Layout.css';

function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="layout-wrapper">
      {/* TOP BAR */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="logo-placeholder">CM</div>
          <span className="topbar-title">Cutelaria Marquesin</span>
        </div>
        <div className="topbar-right">
          <button className="btn-logout" onClick={handleLogout}>Sair da Oficina</button>
        </div>
      </header>

      <div className="main-container">
        {/* SIDE BAR */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <NavLink to="/home" className="nav-item">
              Início
            </NavLink>
            <NavLink to="/referencias" className="nav-item">
              Referências & Ideias
            </NavLink>
            <span className="nav-item" style={{opacity: 0.5, cursor: 'not-allowed'}} title="Em breve">
              Estoque (Em breve)
            </span>
            <span className="nav-item" style={{opacity: 0.5, cursor: 'not-allowed'}} title="Em breve">
              Clientes (Em breve)
            </span>
          </nav>
        </aside>

        {/* ÁREA DE CONTEÚDO DINÂMICO */}
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;