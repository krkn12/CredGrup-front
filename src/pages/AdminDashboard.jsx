import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

function AdminDashboard() {
  const { user } = useContext(AuthContext);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard Administrativo</h1>
      <p>Bem-vindo, {user.name}. Esta é a área administrativa.</p>
      <p>Aqui você pode gerenciar configurações e monitorar a plataforma.</p>
    </div>
  );
}

export default AdminDashboard;