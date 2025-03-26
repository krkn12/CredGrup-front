import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function PrivateRoute({ children, requiresAdmin = false }) {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;
  if (requiresAdmin && !user.isAdmin) return <Navigate to="/dashboard" />;
  return children;
}

export default PrivateRoute;