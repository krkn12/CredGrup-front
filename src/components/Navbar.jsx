import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ padding: '1rem', background: '#333', color: '#fff' }}>
      <Link to="/" style={{ color: '#fff', marginRight: '1rem' }}>Home</Link>
      {user ? (
        <>
          <Link to="/dashboard" style={{ color: '#fff', marginRight: '1rem' }}>Dashboard</Link>
          <Link to="/deposits" style={{ color: '#fff', marginRight: '1rem' }}>Depósitos</Link>
          <Link to="/payments" style={{ color: '#fff', marginRight: '1rem' }}>Pagamentos</Link>
          <Link to="/transactions" style={{ color: '#fff', marginRight: '1rem' }}>Transações</Link>
          <Link to="/loans" style={{ color: '#fff', marginRight: '1rem' }}>Empréstimos</Link>
          <Link to="/investments" style={{ color: '#fff', marginRight: '1rem' }}>Investimentos</Link>
          <Link to="/profile" style={{ color: '#fff', marginRight: '1rem' }}>Perfil</Link>
          <Link to="/kyc" style={{ color: '#fff', marginRight: '1rem' }}>KYC</Link>
          {user.isAdmin && (
            <>
              <Link to="/admin" style={{ color: '#fff', marginRight: '1rem' }}>Admin</Link>
              <Link to="/admin/config" style={{ color: '#fff', marginRight: '1rem' }}>Configurações</Link>
            </>
          )}
          <button onClick={handleLogout} style={{ color: '#fff', background: 'none', border: 'none' }}>Sair</button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ color: '#fff', marginRight: '1rem' }}>Login</Link>
          <Link to="/register" style={{ color: '#fff' }}>Registrar</Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;