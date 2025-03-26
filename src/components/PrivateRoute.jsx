import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Correto

function PrivateRoute({ children, requiresAdmin = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (requiresAdmin && !user.isAdmin) return <Navigate to="/" />;
  return children;
}

export default PrivateRoute;