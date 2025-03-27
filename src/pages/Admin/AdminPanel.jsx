import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/api';
import AdminSidebar from '@/components/Admin/AdminSidebar';
import '@/styles/admin/admin-panel.css';

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const { data } = await api.get('/admin/pending');
        setPendingRequests(data);
      } catch (error) {
        console.error('Error fetching pending requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, []);

  const handleApprove = async (id, type) => {
    try {
      await api.put(`/admin/approve/${type}/${id}`);
      setPendingRequests(pendingRequests.filter(item => item.id !== id));
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  if (loading) return <div>Carregando painel administrativo...</div>;

  return (
    <div className="admin-container">
      <AdminSidebar />
      <div className="admin-content">
        <h1>Painel Administrativo</h1>
        
        <section className="pending-requests">
          <h2>Solicitações Pendentes</h2>
          {pendingRequests.length === 0 ? (
            <p>Nenhuma solicitação pendente</p>
          ) : (
            <ul>
              {pendingRequests.map(request => (
                <li key={request.id}>
                  <div>
                    <p>Tipo: {request.type}</p>
                    <p>Usuário: {request.userName}</p>
                    <p>Valor: R$ {request.amount?.toFixed(2) || 'N/A'}</p>
                  </div>
                  <button 
                    onClick={() => handleApprove(request.id, request.type)}
                    className="approve-btn"
                  >
                    Aprovar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminPanel;