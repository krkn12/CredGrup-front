import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">CredGrup Fintech</Link>
        {user ? (
          <div className="space-x-4">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/deposits">Depósitos</Link>
            <Link to="/payments">Pagamentos</Link>
            <Link to="/transactions">Transações</Link>
            <Link to="/loans">Empréstimos</Link>
            <Link to="/investments">Investimentos</Link>
            {user.isAdmin && <Link to="/admin">Admin</Link>}
            <button onClick={logout} className="bg-red-500 px-3 py-1 rounded">Sair</button>
          </div>
        ) : (
          <div className="space-x-4">
            <Link to="/login">Login</Link>
            <Link to="/register">Cadastro</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;